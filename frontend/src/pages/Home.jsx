import { useState, useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { Link } from "react-router-dom"
import styles from './Home.module.css'

const MAX_CONTENT_LENGTH = 500
const API_URL = "http://localhost:5000"

const Home = () => {
  const { token, user, isAuthenticated, logout } = useContext(AuthContext)
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentContent, setCommentContent] = useState({})
  const [showComments, setShowComments] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const checkAuthAndFetchPosts = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        // Check if token is valid
        const isValid = isAuthenticated()
        console.log('Token validation:', { isValid, token: token?.slice(0, 20) + '...' })
        
        if (!isValid) {
          console.log('Token is invalid, logging out')
          logout()
          setIsLoading(false)
          return
        }

        await fetchPosts()
      } catch (error) {
        console.error('Auth check error:', error)
        setIsLoading(false)
      }
    }

    checkAuthAndFetchPosts()
  }, [token, currentPage, isAuthenticated, logout])

  const fetchPosts = async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fetching posts with token:', token?.slice(0, 20) + '...')
      
      const response = await fetch(`${API_URL}/api/posts?page=${currentPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Posts response status:', response.status)
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized response, logging out')
          logout()
          throw new Error('Authentication failed. Please log in again.')
        }
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      console.log('Posts data received:', { count: data.posts?.length, totalPages: data.totalPages })
      
      setPosts(data.posts || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setError(error.message || "Failed to load posts. Please try again.")
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || content.length > MAX_CONTENT_LENGTH) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      setContent("")
      fetchPosts()
    } catch (error) {
      console.error("Error submitting post:", error)
      setError("Failed to create post. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to like post')
      }

      // Update the posts state immediately
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? {
                ...post,
                likes: post.likes.includes(user._id)
                  ? post.likes.filter(id => id !== user._id)
                  : [...post.likes, user._id]
              }
            : post
        )
      )
    } catch (error) {
      console.error('Error liking post:', error)
      setError('Failed to like post. Please try again.')
    }
  }

  const handleComment = async (postId) => {
    if (!commentContent[postId]?.trim()) return

    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentContent[postId] })
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      setCommentContent(prev => ({ ...prev, [postId]: '' }))
      fetchPosts()
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  if (!token) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.welcomeMessage}>
          <h1>Welcome to LessIsMore</h1>
          <p>Please log in to view and create posts.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.createPostCard}>
        <h2 className={styles.createPostTitle}>Create a Post</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className={styles.textarea}
            disabled={isLoading}
            maxLength={MAX_CONTENT_LENGTH}
          />
          <span className={styles.characterCount}>
            {content.length}/{MAX_CONTENT_LENGTH}
          </span>
          <button
            type="submit"
            disabled={isLoading || !content.trim() || content.length > MAX_CONTENT_LENGTH}
            className={`${styles.submitButton} ${
              isLoading || !content.trim() || content.length > MAX_CONTENT_LENGTH
                ? styles.submitButtonDisabled
                : styles.submitButtonEnabled
            }`}
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.postsSection}>
        <h2 className={styles.sectionTitle}>Recent Posts</h2>
        {isLoading ? (
          <div className={styles.loading}>Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className={styles.noPosts}>No posts yet. Be the first to post!</div>
        ) : (
          <>
            <div className={styles.postsList}>
              {posts.map((post) => (
                <div key={post._id} className={styles.postCard}>
                  <div className={styles.postHeader}>
                    <div className={styles.authorInfo}>
                      <Link to={`/profile/${post.author._id}`} className={styles.authorLink}>
                        <span className={styles.authorName}>{post.author.username}</span>
                      </Link>
                      <span className={styles.postDate}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className={styles.postContent}>{post.content}</p>
                  <div className={styles.postActions}>
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`${styles.actionButton} ${post.likes.includes(user._id) ? styles.actionButtonActive : ''}`}
                    >
                      {post.likes.includes(user._id) ? '❤️' : '🤍'} {post.likes.length}
                    </button>
                    <button
                      onClick={() => toggleComments(post._id)}
                      className={styles.actionButton}
                    >
                      💬 {post.comments.length}
                    </button>
                  </div>

                  {showComments[post._id] && (
                    <div className={styles.commentsSection}>
                      <div className={styles.commentsList}>
                        {post.comments.map((comment) => (
                          <div key={comment._id} className={styles.comment}>
                            <div className={styles.commentHeader}>
                              <Link to={`/profile/${comment.user._id}`} className={styles.commentAuthor}>
                                <span>{comment.user.username}</span>
                              </Link>
                              <span className={styles.commentDate}>
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className={styles.commentContent}>{comment.content}</p>
                          </div>
                        ))}
                      </div>
                      <div className={styles.commentForm}>
                        <textarea
                          value={commentContent[post._id] || ''}
                          onChange={(e) => setCommentContent(prev => ({ ...prev, [post._id]: e.target.value }))}
                          placeholder="Write a comment..."
                          className={styles.commentTextarea}
                          maxLength={MAX_CONTENT_LENGTH}
                        />
                        <button
                          onClick={() => handleComment(post._id)}
                          disabled={!commentContent[post._id]?.trim()}
                          className={`${styles.commentButton} ${!commentContent[post._id]?.trim() ? styles.disabled : ''}`}
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  )}
        </div>
      ))}
            </div>
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Home
