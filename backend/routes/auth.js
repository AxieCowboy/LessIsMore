const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const router = express.Router()
const validator = require('validator')

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  )
}

// Signup route
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup request received:', { ...req.body, password: '[REDACTED]' })
    const { username, email, password } = req.body

    // Validate input
    if (!username || !email || !password) {
      console.log('Missing required fields')
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      console.log('Invalid email format:', email)
      return res.status(400).json({ message: 'Please provide a valid email address' })
    }

    // Validate password length
    if (password.length < 6) {
      console.log('Password too short')
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    // Validate username length
    if (username.length < 3) {
      console.log('Username too short')
      return res.status(400).json({ message: 'Username must be at least 3 characters long' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    })

    if (existingUser) {
      console.log('User already exists:', { email, username })
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? 'Email already exists' 
          : 'Username already exists'
      })
    }

    // Create new user
    console.log('Creating new user:', { username, email })
    const user = new User({
      username,
      email,
      password
    })

    // Save user
    await user.save()
    console.log('User saved successfully:', { userId: user._id, username: user.username })

    // Generate token
    const token = generateToken(user._id)

    // Send response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        score: user.score
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ 
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' })
    }

    // Find user and explicitly select password field along with other required fields
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
      console.log('Login failed: User not found')
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    
    if (!isMatch) {
      console.log('Login failed: Invalid password')
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate token
    const token = generateToken(user._id)

    // Send response with all necessary user data
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        score: user.score
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router 