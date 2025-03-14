const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const auth = require('../middleware/auth')

router.post('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    post.comments.push({
      user: req.user._id,
      content: req.body.content
    })

    await post.save()
    await post.populate('comments.user', 'username profilePicture')
    
   
    const newComment = post.comments[post.comments.length - 1]
    res.status(201).json(newComment)
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message })
  }
})


router.delete('/:postId/:commentId', auth, async (req, res) => {
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