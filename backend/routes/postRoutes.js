const express = require("express")
const Post = require("../models/Post")
const User = require("../models/User")

const router = express.Router()

router.post("/", async (req, res) => {
  try {
    const { userId, content } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const newPost = new Post({
      userId,
      username: user.username,
      content,
    })

    await newPost.save()
    res.status(201).json(newPost)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 })
    res.json(posts)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
