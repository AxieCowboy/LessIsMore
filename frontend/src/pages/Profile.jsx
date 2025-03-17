import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import styles from './Profile.module.css'

const Profile = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
  const { user, token } = useContext(AuthContext)
  const [userDetails, setUserDetails] = useState(null)
  const [posts, setPosts] = useState([])
  const [error, setError] = useState('')
  const [commentContent, setCommentContent] = useState({})
  const [showComments, setShowComments] = useState({})

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    fetchUserDetails()
    fetchUserPosts()
  }, [userId, token, navigate])

  const fetchUserDetails = async () => {
    try {
      const targetUserId = userId || user.id
      const response = await fetch(`http://localhost:5000/api/users/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setUserDetails(data)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to fetch user details')
    }
  }

  const fetchUserPosts = async () => {
    try {
      const targetUserId = userId || user.id
      const response = await fetch(`http://localhost:5000/api/posts/user/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setPosts(data)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to fetch user posts')
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

      // Update the posts state to toggle the like
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? {
                ...post,
                likes: post.likes?.includes(user.id)
                  ? post.likes.filter(id => id !== user.id)
                  : [...(post.likes || []), user.id]
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
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentContent[postId] })
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      const newComment = await response.json()
      
      // Update the posts state to include the new comment
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? {
                ...post,
                comments: [...(post.comments || []), {
                  _id: newComment._id,
                  content: newComment.content,
                  user: {
                    _id: user.id,
                    username: user.username
                  }
                }]
              }
            : post
        )
      )

      // Clear the comment input
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

  if (!userDetails) {
    return <div className={styles.loading}>Loading...</div>
  }

  const isOwnProfile = !userId || userId === user.id

  return (
    <div className={styles.profileContainer}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeMessage}>
          {isOwnProfile ? 'Welcome' : ''}, {userDetails?.username}!
        </h1>
        <p className={styles.userSince}>
          User since {new Date(userDetails?.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
      <div className={styles.profileContent}>
        <h2>{isOwnProfile ? 'Your Posts' : `${userDetails?.username}'s Posts`}</h2>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.postsContainer}>
          {posts.length === 0 ? (
            <p className={styles.noPosts}>
              {isOwnProfile 
                ? "You haven't created any posts yet."
                : `${userDetails?.username} hasn't created any posts yet.`}
            </p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <span className={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.postContent}>
                  {post.content}
                </div>
                <div className={styles.postActions}>
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`${styles.actionButton} ${post.likes?.includes(user.id) ? styles.actionButtonActive : ''}`}
                  >
                    {post.likes?.includes(user.id) ? '❤️' : '🤍'} {post.likes?.length || 0}
                  </button>
                  <button
                    onClick={() => toggleComments(post._id)}
                    className={`${styles.actionButton} ${showComments[post._id] ? styles.actionButtonActive : ''}`}
                  >
                    💬 {post.comments?.length || 0} comments
                  </button>
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
                        Comment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
