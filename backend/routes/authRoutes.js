const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const router = express.Router()

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body
    

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({ username, email, password: hashedPassword })
    await newUser.save()
    
    res.status(201).json({ message: "User registered successfully!" })
  } catch (err) {
    res.status(500).json(err)
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) return res.status(400).json({ message: "User not found" })

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) return res.status(400).json({ message: "Invalid password" })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.json({ token, userId: user._id, username: user.username })
  } catch (err) {
    res.status(500).json(err)
  }
})

module.exports = router
