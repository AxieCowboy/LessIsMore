const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")


router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body


    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: "User already exists" })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({ username, email, password: hashedPassword })
    await user.save()

    res.status(201).json({ message: "User created successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: "User not found" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

    res.json({ token, userId: user._id })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password") // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/current", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" })
  }
})


module.exports = router
