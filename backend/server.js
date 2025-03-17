const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const userRoutes = require('./routes/users')
const postRoutes = require('./routes/posts')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}

app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)

const startServer = async (port) => {
  try {
    const portNum = parseInt(port)
    if (isNaN(portNum) || portNum < 0 || portNum > 65535) {
      throw new Error(`Invalid port number: ${port}`)
    }

    await new Promise((resolve, reject) => {
      const server = app.listen(portNum)
        .on('listening', () => {
          console.log(`Server running on port ${portNum}`)
          resolve()
        })
        .on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${portNum} is busy, trying ${portNum + 1}...`)
            server.close()
            reject(err)
          } else {
            reject(err)
          }
        })
    })
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      startServer(port + 1)
    } else {
      console.error('Server error:', err.message)
      process.exit(1)
    }
  }
}

const init = async () => {
  try {
    await connectDB()
    const port = process.env.PORT || 5000
    await startServer(port)
  } catch (err) {
    console.error('Application startup error:', err.message)
    process.exit(1)
  }
}

init()
