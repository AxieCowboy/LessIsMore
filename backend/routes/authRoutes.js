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
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" })
    }

    
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({ username, email, password: hashedPassword })
    await newUser.save()

    res.status(201).json({ message: "User created successfully" })
  } catch (error) {
    console.error("Signup Error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      console.error(`Login failed: User with email ${email} not found`)
      return res.status(400).json({ message: "User not found" })
    }

    console.log("Entered password:", password)
    console.log("Stored password (hashed):", user.password)

    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log("Password match:", isPasswordValid)

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect password" })
    }

    res.json({ message: "Login successful", user })
  } catch (error) {
    console.error("Server error during login:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password") 
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
