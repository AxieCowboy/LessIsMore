import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  if (!user) {
    return <p>You are not logged in. <button onClick={() => navigate('/login')}>Login</button></p>
  }

  return (
    <div>
      <h2>Welcome, {user.username}</h2>
      <p>This is your profile page.</p>
    </div>
  )
}

export default Profile
