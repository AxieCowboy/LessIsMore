import React, { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Link } from "react-router-dom"

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)

  return (
    <nav className="navbar">
      <h1>LiM</h1>
      <div>
        
        {user ? (
          <>
            <Link to="/Profile">Profile</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
