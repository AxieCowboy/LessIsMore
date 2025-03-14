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

    const total = await Post.countDocuments()

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    })
  } catch (error) {
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

    const likeIndex = post.likes.indexOf(req.user._id)
    if (likeIndex === -1) {
      post.likes.push(req.user._id)
    } else {
      post.likes.splice(likeIndex, 1)
    }

    await post.save()
    res.json(post)
  } catch (error) {
    res.status(500).json({ message: 'Error updating post likes', error: error.message })
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

module.exports = router 