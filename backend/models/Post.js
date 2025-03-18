const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: [true, "Post content is required"],
    maxlength: [500, "Post cannot be more than 500 characters"]
  },
  image: {
    type: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, "Comment cannot be more than 500 characters"]
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Index for efficient queries
postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ createdAt: -1 })

// Update user's activity when a post is created
postSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User')
    await User.findByIdAndUpdate(doc.author, {
      $inc: { score: 10 }, // Add 10 points for creating a post
      lastActivity: new Date()
    })
  } catch (error) {
    console.error('Error updating user activity:', error)
  }
})

module.exports = mongoose.model("Post", postSchema)
