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

postSchema.index({ author: 1, createdAt: -1 })

module.exports = mongoose.model("Post", postSchema)
