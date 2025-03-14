import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setMessage('') 
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        navigate('/profile')
      } else {
        setMessage('Invalid email or password')
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div >
      <div >
        <div>
          <h2 >
            Sign in to your account
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div >
            <div>
              <input
                type="email"
                name="email"
                required
                placeholder="Email address"
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading 
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        {message && (
          <p className={`mt-2 text-center text-sm text-red-600`}>
            {message}
          </p>
        )}
        <div >
          <p >
            Don't have an account?{" "}
            <button
              onClick={() => navigate('/signup')}
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
