import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./Signup.module.css"

const Signup = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" })
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setMessage("") // Clear any error messages when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Signup failed")
      }

      setMessage("Registration successful! Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 1500)
    } catch (error) {
      setMessage(error.message || "An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Create your account</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="username"
              required
              placeholder="Username"
              onChange={handleChange}
              className={styles.input}
              minLength={3}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <input
              type="email"
              name="email"
              required
              placeholder="Email address"
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              onChange={handleChange}
              className={styles.input}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        {message && (
          <p className={`${styles.message} ${
            message.includes("successful") ? styles.success : styles.error
          }`}>
            {message}
          </p>
        )}

        <div className={styles.footer}>
          <p>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className={styles.link}
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
