import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import styles from './Leaderboard.module.css'

const Leaderboard = () => {
  const { token } = React.useContext(AuthContext)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (token) {
      fetchLeaderboard()
    }
  }, [token])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!token) {
        throw new Error('Authentication token is missing. Please log in again.')
      }

      const response = await fetch(import.meta.env.VITE_Api_URL+'/api/users/leaderboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.')
        } else if (response.status === 503) {
          throw new Error('Service temporarily unavailable. Please try again later.')
        } else {
          throw new Error(errorData.message || 'Failed to fetch leaderboard data')
        }
      }

      const data = await response.json()
      console.log('Leaderboard response:', data)

      if (data && Array.isArray(data)) {
        setLeaderboard(data)
      } else {
        console.error('Unexpected leaderboard data structure:', data)
        throw new Error('Invalid leaderboard data format')
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err)
      setError(err.message || 'Error loading leaderboard. Please try again later.')
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  const formatLastActivity = (date) => {
    const lastActivity = new Date(date)
    const now = new Date()
    const diffInHours = Math.floor((now - lastActivity) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return lastActivity.toLocaleDateString()
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerCard}>
        <h1 className={styles.title}>Today's Leaderboard</h1>
        <p className={styles.subtitle}>Top performers in the last 24 hours</p>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.retryButton} onClick={fetchLeaderboard}>
            Try Again
          </button>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyMessage}>No users found on the leaderboard.</p>
        </div>
      ) : (
        <div className={styles.leaderboardList}>
          {leaderboard.map((user, index) => (
            <div key={user._id} className={styles.userCard}>
              <div className={styles.rankSection}>
                <span className={`${styles.rankNumber} ${index < 3 ? styles.topRank : ''}`}>
                  {index + 1}
                </span>
                <span className={styles.rankLabel}>Rank</span>
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userDetails}>
                  <Link to={`/profile/${user._id}`} className={styles.username}>
                    {user.username}
                  </Link>
                  <div className={styles.stats}>
                    <span>{user.stats?.posts || 0} posts</span>
                    <span>{user.stats?.likes || 0} likes</span>
                    <span>{user.stats?.comments || 0} comments</span>
                  </div>
                  <span className={styles.lastActivity}>
                    Last active: {formatLastActivity(user.lastActivity)}
                  </span>
                </div>
              </div>
              <div className={styles.scoreSection}>
                <span className={styles.score}>{user.stats?.activityScore || 0}</span>
                <span className={styles.scoreLabel}>Score</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Leaderboard 