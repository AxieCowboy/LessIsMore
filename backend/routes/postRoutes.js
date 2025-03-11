const express = require('express')
const Post = require('../models/Post')

const router = express.Router()

router.post("/", async (req, res) => {
    try {
      const newPost = new Post(req.body)
      const savedPost = await newPost.save()
      res.status(201).json(savedPost)
    } catch (err) {
      res.status(500).json(err)
    }
  })
  
  router.get("/", async (req, res) => {
    try {
      const posts = await Post.find().populate("userId", "username")
      res.json(posts)
    } catch (err) {
      res.status(500).json(err)
    }
  })
  
  module.exports = router