import { createContext, useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken)
   
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem("token")
          return null
        }
        return decodedToken.user
      } catch (error) {
        console.error("Invalid token:", error)
        localStorage.removeItem("token")
        return null
      }
    }
    return null
  })

  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken)
   
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem("token")
          return null
        }
        return storedToken
      } catch (error) {
        localStorage.removeItem("token")
        return null
      }
    }
    return null
  })

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token)
   
        if (decodedToken.exp * 1000 < Date.now()) {
          setUser(null)
          setToken(null)
          localStorage.removeItem("token")
          return
        }
        setUser(decodedToken.user)
        localStorage.setItem("token", token)
      } catch (error) {
        console.error("Token validation error:", error)
        setUser(null)
        setToken(null)
        localStorage.removeItem("token")
      }
    } else {
      setUser(null)
      localStorage.removeItem("token")
    }
  }, [token])

  const login = async (token) => {
    if (!token) {
      console.error("No token provided")
      return false
    }
    
    try {
      const decodedToken = jwtDecode(token)

      if (decodedToken.exp * 1000 < Date.now()) {
        console.error("Token is expired")
        return false
      }
      if (!decodedToken.user) {
        console.error("Token does not contain user data")
        return false
      }
      setToken(token)
      setUser(decodedToken.user)
      return true
    } catch (error) {
      console.error("Login Error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
  }

  const isAuthenticated = () => {
    if (!token || !user) return false
    try {
      const decodedToken = jwtDecode(token)
      return decodedToken.exp * 1000 > Date.now()
    } catch {
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider