import { createContext, useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      if (storedToken && storedUser) {
        try {
          const decodedToken = jwtDecode(storedToken)
          if (decodedToken.exp * 1000 > Date.now()) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
          } else {
            // Token expired, clear storage
            localStorage.removeItem("token")
            localStorage.removeItem("user")
          }
        } catch (error) {
          console.error("Auth initialization error:", error)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Login failed")
      }

      const data = await response.json()
      
      if (!data.token || !data.user) {
        throw new Error("Invalid response from server")
      }

      // Store token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      // Update state
      setToken(data.token)
      setUser(data.user)
      
      return data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const signup = async (username, email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Signup failed")
      }

      const data = await response.json()
      
      if (!data.token || !data.user) {
        throw new Error("Invalid response from server")
      }

      // Store token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      // Update state
      setToken(data.token)
      setUser(data.user)
      
      return data
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  const isAuthenticated = () => {
    if (!token) return false
    try {
      const decodedToken = jwtDecode(token)
      return decodedToken.exp * 1000 > Date.now()
    } catch {
      return false
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      signup, 
      isAuthenticated,
      isLoading: loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider