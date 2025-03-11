const express = require('express')
const Comment = require('../models/Comment')

const router = express.Router()

router.post("/", async (req, res) => {
    try {
      const newComment = new Comment(req.body)
      const savedComment = await newComment.save()
      res.status(201).json(savedComment)
    } catch (err) {
      res.status(500).json(err)
    }
  })
  
  router.get("/:postId", async (req, res) => {
    try {
      const comments = await Comment.find({ postId: req.params.postId }).populate("userId", "username")
      res.json(comments)
    } catch (err) {
      res.status(500).json(err)
    }
  })

  module.exports = router