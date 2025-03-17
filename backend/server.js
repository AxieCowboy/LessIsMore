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

const startServer = async (portNum) => {
  return new Promise((resolve, reject) => {
    console.log(`Attempting to start server on port ${portNum} (type: ${typeof portNum})`)
    const server = app.listen(portNum)
      .once('listening', () => {
        console.log(`Server is running on port ${portNum}`)
        resolve(server)
      })
      .once('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`Port ${portNum} is busy, trying ${portNum + 1}...`)
          server.close()
          if (portNum + 1 <= 5010) {
            startServer(portNum + 1)
              .then(resolve)
              .catch(reject)
          } else {
            reject(new Error('No available ports found between 5000 and 5010'))
          }
        } else {
          reject(error)
        }
      })
  })
}

const init = async () => {
  try {
    await connectDB()
    const port = parseInt(process.env.PORT, 10) || 5000
    await startServer(port)
  } catch (err) {
    console.error('Application startup error:', err.message)
    process.exit(1)
  }
}

init()