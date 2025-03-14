import { useState, useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"

const Home = () => {
  const { user } = useContext(AuthContext)
  const [content, setContent] = useState("")
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/posts")
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      alert("You must be logged in to post.")
      return
    }

    try {
      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, content }),
      })

      if (response.ok) {
        setContent("")
        fetchPosts()  
      } else {
        console.error("Failed to create post")
      }
    } catch (error) {
      console.error("Error submitting post:", error)
    }
  }

  return (
    <div>
      <h2>Home Page</h2>
      {user ? (
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a post..."
            required
          />
          <button type="submit">Post</button>
        </form>
      ) : (
        <p>You must be logged in to create a post.</p>
      )}

      <h3>Recent Posts</h3>
      {posts.map((post) => (
        <div key={post._id}>
          <p><strong>{post.username}</strong></p>
          <p>{post.content}</p>
          <hr />
        </div>
      ))}
    </div>
  )
}

export default Home
