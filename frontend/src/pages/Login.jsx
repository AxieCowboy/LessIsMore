import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import styles from './Login.module.css'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return false
    }
    if (!isLogin && !formData.username) {
      setError('Username is required for registration')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    try {
      setIsLoading(true)
      const endpoint = isLogin ? 'login' : 'signup'
      console.log('Attempting to', endpoint, 'with email:', formData.email)
      
      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()
      console.log('Server response:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed')
      }

      if (!data.token) {
        throw new Error('No token received from server')
      }

      console.log('Login successful, setting token...')
      const loginSuccess = await login(data.token)
      if (!loginSuccess) {
        throw new Error('Failed to set authentication token')
      }
      console.log('Token set, navigating to home...')
      navigate('/')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred during authentication')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <div className={styles.logo}>LessIsMore</div>
          <h2 className={styles.title}>
            {isLogin ? 'Sign in' : 'Create a new account'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            {!isLogin && (
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className={styles.input}
                autoComplete="username"
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              autoComplete="email"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? (
              <div className={styles.loadingSpinner}>⌛</div>
            ) : (
              isLogin ? 'Sign in' : 'Sign up'
            )}
          </button>
        </form>

        <div className={styles.toggleContainer}>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
                setFormData({
                  username: '',
                  email: '',
                  password: ''
                })
              }}
              className={styles.toggleLink}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
