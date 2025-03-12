require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const authRoutes = require("./routes/authRoutes")
const postRoutes = require("./routes/postRoutes")
const commentRoutes = require("./routes/commentRoutes")

const app = express()

app.use(express.json())
app.use(cors())

app.use("/api/auth", authRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRoutes)

const mongoURI = process.env.MONGO_URI

if (!mongoURI) {
  console.error("MONGO_URI is not defined")
  process.exit(1)
}

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
