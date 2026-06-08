/**
 * File: MenuBar.js
 * Author: Kilian MEDDAS (3199547)
 *
 */
import { useNavigate } from 'react-router-dom'

import './css/MenuBar.css'

const MenuBar = () => {
  const navigate = useNavigate()

  const logout = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    navigate('/')
  }

  return (
    <div className="menu-bar">
      <button onClick={() => navigate('/dashboard')}>Home</button>
      <button onClick={() => navigate('/myprofile')}>My profile</button>
      <button onClick={() => navigate('/calendar')}>Calendar</button>
      <button onClick={() => navigate('/balance')}>Balance</button>
      <button onClick={() => navigate('/DecisionMaking')}>
        Apartment <br />
        decision
      </button>
      <button onClick={() => navigate('/leaderboard')}>Gossip</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default MenuBar
