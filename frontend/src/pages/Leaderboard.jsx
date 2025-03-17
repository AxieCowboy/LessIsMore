import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './Leaderboard.module.css'

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/leaderboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch leaderboard data')
      }

      console.log('Leaderboard response:', data) 

      if (data && Array.isArray(data.users)) {
        setLeaderboard(data.users)
      } else {
        console.error('Unexpected leaderboard data structure:', data)
        throw new Error('Invalid leaderboard data format')
      }

      setError(null)
    } catch (err) {
      setError('Error loading leaderboard. Please try again later.')
      console.error('Leaderboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerCard}>
        <h1 className={styles.title}>Today's Leaderboard</h1>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
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
                <span className={styles.rankNumber}>{index + 1}</span>
                <span className={styles.rankLabel}>Rank</span>
              </div>
              <div className={styles.userInfo}>
                <Link to={`/profile/${user._id}`} className={styles.username}>
                  {user.username}
                </Link>
                <div className={styles.stats}>
                  <span>{user.stats.posts} posts</span>
                  <span>{user.stats.likes} likes</span>
                  <span>{user.stats.comments} comments</span>
                </div>
              </div>
              <div className={styles.scoreSection}>
                <span className={styles.scoreNumber}>{user.stats.activityScore}</span>
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
