const express = require('express')
const router = express.Router()
const User = require('../models/User')
const auth = require('../middleware/auth')

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details' })
  }
})

router.put('/:id', auth, async (req, res) => {
  try {
    const { username, email } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this user' })
    }

    user.username = username || user.username
    user.email = email || user.email

    const updatedUser = await user.save()
    res.json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' })
    }
    res.status(500).json({ message: 'Error updating user details' })
  }
})

module.exports = router 