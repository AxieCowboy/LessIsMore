import { createContext, useState, useEffect } from "react"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  
  let storedUser = localStorage.getItem("user")

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

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }, [user])

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error("Login Error:", error)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider