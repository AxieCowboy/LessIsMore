import { createContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token") || "")

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password })
      const { token, userId } = res.data

      localStorage.setItem("token", token)
      setToken(token)
      fetchUserData(userId)
    } catch (error) {
      console.error("Login failed", error.response?.data?.message)
    }
  }

  const fetchUserData = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(res.data)
    } catch (error) {
      console.error("Failed to fetch user data", error)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken("")
    setUser(null)
  }

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:5000/api/auth/current", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => logout()) 
    }
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
