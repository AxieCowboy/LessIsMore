import React, { useState, useContext } from "react"
import AuthContext from "../context/AuthContext"

const Login = () => {
  const { login } = useContext(AuthContext)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [message, setMessage] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(formData.email, formData.password)
      setMessage("Login successful!")
    } catch (error) {
      setMessage("Login failed. Please try again.")
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}

export default Login
