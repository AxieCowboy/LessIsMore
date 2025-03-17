import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import Leaderboard from "./pages/Leaderboard"
import { useContext } from "react"
import { AuthContext } from "./context/AuthContext"

function App() {
  const { user } = useContext(AuthContext)
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoginPage && <Navbar />}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" replace />} />
          
          <Route
            path="/"
            element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
          />
          
          <Route
            path="/home"
            element={user ? <Home /> : <Navigate to="/login" replace />}
          />
          
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" replace />}
          />
          
          <Route
            path="/profile/:userId"
            element={user ? <Profile /> : <Navigate to="/login" replace />}
          />
          
          <Route
            path="/leaderboard"
            element={user ? <Leaderboard /> : <Navigate to="/login" replace />}
          />
          
          <Route
            path="*"
            element={
              user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
