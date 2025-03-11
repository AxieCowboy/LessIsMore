const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
})

module.exports = mongoose.models.Post || mongoose.model("Post", PostSchema)
