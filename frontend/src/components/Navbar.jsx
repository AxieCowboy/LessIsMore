import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import styles from './Navbar.module.css'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <Link to="/" className={styles.logo}>
          LessIsMore
        </Link>
        
        <button 
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={styles.menuIcon}></span>
          <span className={styles.menuIcon}></span>
          <span className={styles.menuIcon}></span>
        </button>
        
        <div className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}>
          <Link 
            to="/profile" 
            className={`${styles.navLink} ${location.pathname === '/profile' ? styles.active : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Profile
          </Link>
          <Link 
            to="/leaderboard" 
            className={`${styles.navLink} ${location.pathname === '/leaderboard' ? styles.active : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Leaderboard
          </Link>
          <button 
            onClick={() => {
              handleLogout()
              setIsMenuOpen(false)
            }}
            className={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
