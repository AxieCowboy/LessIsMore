import { useState, useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { Link } from "react-router-dom"
import styles from './Home.module.css'

const MAX_CONTENT_LENGTH = 500

const Home = () => {
  const { user, token } = useContext(AuthContext)
  const [content, setContent] = useState("")
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [commentContent, setCommentContent] = useState({})
  const [showComments, setShowComments] = useState({})

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("http://localhost:5000/api/posts", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch posts')
      }

      const data = await response.json()
      console.log('Posts response:', data)
      
      if (data && Array.isArray(data)) {
        setPosts(data)
      } else if (data && Array.isArray(data.posts)) {
        setPosts(data.posts)
      } else {
        console.error('Unexpected posts data structure:', data)
        setPosts([])
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      setError("Failed to load posts. Please try again later.")
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
      const response = await fetch("http://localhost:5000/api/posts", {
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
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to like post')
      }

      const updatedPost = await response.json()
      setPosts(posts.map(post => 
        post._id === postId ? updatedPost : post
      ))
    } catch (error) {
      console.error('Error liking post:', error)
      setError('Failed to like post. Please try again.')
    }
  }

  const handleComment = async (postId) => {
    if (!commentContent[postId]?.trim()) return

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
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

      const newComment = await response.json()
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const updatedComments = post.comments || []
          return {
            ...post,
            comments: [...updatedComments, {
              _id: newComment._id,
              content: newComment.content,
              user: {
                _id: user.id,
                username: user.username
              },
              createdAt: new Date().toISOString()
            }]
          }
        }
        return post
      }))
      
      setCommentContent(prev => ({
        ...prev,
        [postId]: ''
      }))
    } catch (error) {
      console.error('Error adding comment:', error)
      setError('Failed to add comment. Please try again.')
    }
  }

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  const isLiked = (post) => {
    if (!post.likes || !Array.isArray(post.likes)) return false
    return post.likes.some(like => 
      (typeof like === 'string' && like === user?.id) || 
      (like._id === user?.id)
    )
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.createPostCard}>
        <h2 className={styles.createPostTitle}>Create a Post</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.textareaWrapper}>
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
          </div>
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

      <div className={styles.postsSection}>
        <h3 className={styles.sectionTitle}>Recent Posts</h3>
        {error && (
          <div className={styles.errorAlert}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}
        {isLoading && <p className={styles.loadingText}>Loading posts...</p>}
        {posts.length === 0 && !isLoading && !error && (
          <p className={styles.emptyText}>No posts yet. Be the first to post!</p>
        )}
        {posts.map((post) => (
          <div key={post._id} className={styles.postCard}>
            <div className={styles.postHeader}>
              <div className={styles.authorInfo}>
                <div className="ml-3">
                  <Link 
                    to={`/profile/${post.author?._id}`}
                    className={styles.authorName}
                  >
                    {post.author?.username || 'Unknown User'}
                  </Link>
                  <p className={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
            <p className={styles.postContent}>{post.content}</p>
            <div className={styles.postFooter}>
              <div className={styles.postStats}>
                <span>{post.likes?.length || 0} likes</span>
                <span>{post.comments?.length || 0} comments</span>
              </div>
              <div className={styles.actionButtons}>
                <button 
                  onClick={() => handleLike(post._id)}
                  className={`${styles.actionButton} ${isLiked(post) ? styles.actionButtonActive : ''}`}
                >
                  {isLiked(post) ? '❤️' : '🤍'}
                </button>
                <button 
                  onClick={() => toggleComments(post._id)}
                  className={`${styles.actionButton} ${showComments[post._id] ? styles.actionButtonActive : ''}`}
                >
                  💬 Comment
                </button>
              </div>
            </div>
            
            {showComments[post._id] && (
              <div className={styles.commentsSection}>
                <div className={styles.commentsList}>
                  {post.comments?.map((comment) => (
                    <div key={comment._id} className={styles.commentItem}>
                      <div className={styles.commentContent}>
                        <Link 
                          to={`/profile/${comment.user?._id}`}
                          className={styles.commentAuthor}
                        >
                          {comment.user?.username || 'Unknown User'}
                        </Link>
                        <p className={styles.commentText}>{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.addComment}>
                  <textarea
                    value={commentContent[post._id] || ''}
                    onChange={(e) => setCommentContent(prev => ({
                      ...prev,
                      [post._id]: e.target.value
                    }))}
                    placeholder="Write a comment..."
                    className={styles.commentInput}
                  />
                  <button
                    onClick={() => handleComment(post._id)}
                    disabled={!commentContent[post._id]?.trim()}
                    className={styles.commentButton}
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
