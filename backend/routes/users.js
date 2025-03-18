const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Post = require('../models/Post')
const auth = require('../middleware/auth')

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    console.log('Leaderboard request received from user:', req.user._id)
    
    // Validate database connection
    if (!User.db.readyState) {
      console.error('Database not connected')
      return res.status(503).json({ message: 'Database service unavailable' })
    }

    // Get users active in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    console.log('Fetching users active since:', oneDayAgo)
    
    // Get all users with their basic info
    const users = await User.find({
      lastActivity: { $gte: oneDayAgo }
    }).select('username profilePicture score lastActivity _id')

    console.log(`Found ${users.length} active users`)

    // Return empty array if no active users
    if (!users || users.length === 0) {
      console.log('No active users found')
      return res.json([])
    }

    // Get stats for each user
    const leaderboardData = await Promise.all(users.map(async (user) => {
      try {
        if (!user || !user._id) {
          console.warn('Invalid user object found:', user)
          return null
        }

        console.log(`Processing stats for user: ${user._id}`)

        // Get post count
        const postCount = await Post.countDocuments({ author: user._id })
        
        // Get like count (likes received)
        const posts = await Post.find({ author: user._id })
        const likeCount = posts.reduce((total, post) => total + (post.likes?.length || 0), 0)
        
        // Get comment count (comments received)
        const commentCount = posts.reduce((total, post) => total + (post.comments?.length || 0), 0)

        const userData = {
          _id: user._id,
          username: user.username || 'Anonymous',
          profilePicture: user.profilePicture || '',
          stats: {
            posts: postCount || 0,
            likes: likeCount || 0,
            comments: commentCount || 0,
            activityScore: user.score || 0
          },
          lastActivity: user.lastActivity || new Date()
        }

        console.log(`Processed user ${user._id}:`, userData)
        return userData
      } catch (userError) {
        console.error(`Error processing user ${user._id}:`, userError)
        return null
      }
    }))

    // Filter out any null entries and sort by activity score
    const validLeaderboardData = leaderboardData.filter(Boolean)
    validLeaderboardData.sort((a, b) => b.stats.activityScore - a.stats.activityScore)

    console.log('Sending leaderboard data:', validLeaderboardData)
    // Return top 10 users
    res.json(validLeaderboardData.slice(0, 10))
  } catch (error) {
    console.error('Leaderboard error:', error)
    console.error('Error stack:', error.stack)
    
    // Check for specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid data format',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Data validation failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }

    res.status(500).json({ 
      message: 'Error fetching leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' })
  }
})

// Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' })
    }

    const updates = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check for duplicate username/email
    if (updates.username && updates.username !== user.username) {
      const existingUser = await User.findOne({ username: updates.username })
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' })
      }
    }

    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ email: updates.email })
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' })
      }
    }

    // Update fields
    Object.keys(updates).forEach(update => {
      user[update] = updates[update]
    })

    await user.save()
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' })
  }
})

module.exports = router 