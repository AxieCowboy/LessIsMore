const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      console.log('No token provided')
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    console.log('Decoded token:', { id: decoded.id, exp: decoded.exp })
    
    const user = await User.findById(decoded.id)

    if (!user) {
      console.log('User not found for token')
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    req.token = token
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please log in again.' })
    }
    res.status(401).json({ message: 'Please authenticate' })
  }
}

module.exports = auth 