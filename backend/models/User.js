const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  
})


userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next()
    }
    console.log('Hashing password for user:', this.email)
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    console.log('Password hashed successfully')
    next()
  } catch (error) {
    console.error('Error hashing password:', error)
    next(error)
  }
})


userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing passwords')
    console.log('Candidate password:', candidatePassword)
    console.log('Stored hashed password:', this.password)
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    console.log('Password match result:', isMatch)
    return isMatch
  } catch (error) {
    console.error('Error comparing passwords:', error)
    throw error
  }
}

module.exports = mongoose.model('User', userSchema)
