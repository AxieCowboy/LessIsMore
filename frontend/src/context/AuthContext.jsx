import { createContext, useState, useEffect } from "react"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  let storedUser = localStorage.getItem("user")
  let storedToken = localStorage.getItem("token")

  if (storedUser === "undefined" || storedUser === null) {
    storedUser = null
  } else {
    try {
      storedUser = JSON.parse(storedUser)
    } catch (error) {
      console.error("Invalid JSON in localStorage:", error)
      storedUser = null
    }
  }

  const [user, setUser] = useState(storedUser)
  const [token, setToken] = useState(storedToken)

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }, [user])

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token)
    } else {
      localStorage.removeItem("token")
    }
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      setUser(data.user)
      setToken(data.token)
      return true
    } catch (error) {
      console.error("Login Error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider