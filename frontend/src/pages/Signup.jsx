import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const Signup = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" })
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", formData)
      setMessage("Registration successful! Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 1000)
    } catch (error) {
      setMessage(error.response?.data?.message || "Signup failed")
    }
  }

  return (
    <div>
      <div>
        <div>
          <h2>
            Create your account
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <div>
              <input
                type="text"
                name="username"
                required
                placeholder="Username"
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                required
                placeholder="Email address"
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
            >
              Sign up
            </button>
          </div>
        </form>
        {message && (
          <p className={`mt-2 text-center text-sm ${message.includes("successful") ? "text-green-600" : "text-red-600"
            }`}>
            {message}
          </p>
        )}
        <div >
          <p >
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}

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
