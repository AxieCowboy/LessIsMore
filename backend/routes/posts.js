const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const auth = require('../middleware/auth')

router.post('/', auth, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      author: req.user._id
    })
    await post.save()
    await post.populate('author', 'username profilePicture')
    res.status(201).json(post)
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message })
  }
})

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username profilePicture')
      .populate('comments.user', 'username profilePicture')
      .populate('likes', 'username profilePicture')
      .lean()

    const transformedPosts = posts.map(post => ({
      ...post,
      likes: post.likes || [],
      comments: post.comments || [],
      author: post.author || { username: 'Unknown User' }
    }))

    const total = await Post.countDocuments()

    res.json({
      posts: transformedPosts,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    res.status(500).json({ message: 'Error fetching posts', error: error.message })
  }
})

router.get('/user/:userId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture')
      .populate('comments.user', 'username profilePicture')
    res.json(posts)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user posts', error: error.message })
  }
})


router.post('/:postId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const likeIndex = post.likes.findIndex(like => 
      like.toString() === req.user._id.toString()
    )
    
    if (likeIndex === -1) {
      post.likes.push(req.user._id)
    } else {
      post.likes.splice(likeIndex, 1)
    }

    await post.save()
    
    await post.populate('author', 'username profilePicture')
    await post.populate('comments.user', 'username profilePicture')
    await post.populate('likes', 'username profilePicture')

    const transformedPost = {
      ...post.toObject(),
      likes: post.likes || [],
      comments: post.comments || [],
      author: post.author || { username: 'Unknown User' }
    }

    res.json(transformedPost)
  } catch (error) {
    console.error('Error in like endpoint:', error)
    res.status(500).json({ 
      message: 'Error updating post likes', 
      error: error.message 
    })
  }
})

router.delete('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' })
    }

    await post.remove()
    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message })
  }
})

router.post('/:postId/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const newComment = {
      user: req.user._id,
      content: req.body.content,
      createdAt: new Date()
    }

    post.comments.push(newComment)
    await post.save()
    await post.populate('comments.user', 'username')

    const addedComment = post.comments[post.comments.length - 1]
    res.status(201).json(addedComment)
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message })
  }
})

router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const comment = post.comments.id(req.params.commentId)
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' })
    }

    comment.remove()
    await post.save()
    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message })
  }
})

module.exports = router 