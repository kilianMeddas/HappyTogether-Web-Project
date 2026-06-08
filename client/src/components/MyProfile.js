/**
 * File: MyProfile.js
 * Author: Anaïs ASSOGANE (3199628), Kilian MEDDAS (3199547)
 *
 * Contributions:
 * - Anaïs ASSOGANE: Designed the profile UI and improved layout organization,
 *   placing profile and roommates sections at the same visual level to reduce scrolling,
 *   and adjusting the color palette from orange to a softer blue/purple tone for better readability.
 *
 * - Kilian MEDDAS: Implemented the profile logic, including data fetching, updates, password management,
 *   and group/roommates retrieval.
 */
import { useEffect, useState } from 'react'

import Loading from './Loading.js'
import MenuBar from './MenuBar'
import './css/MyProfile.css'

const MyProfile = () => {
  const [profile, setProfile] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    name: '',
    dateBirth: '',
    telephone: '',
  })
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [canChange, setCanChange] = useState(false)
  const [message, setMessage] = useState('')
  const [groupMembers, setGroupMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050'

  const API_BASE = `${API_URL}/myprofile`

  /**
   * FETCH PROFILE
   * The backend identifies the user via the secure session cookie.
   */
  const getProfileData = async () => {
    try {
      setLoading(true)

      const res = await fetch(API_BASE, {
        method: 'GET',
        credentials: 'include', // Vital for sending the session cookie
      })

      if (!res.ok) throw new Error('Session expired or unauthorized')

      const data = await res.json()
      setProfile(data)
      setFormData({
        firstName: data.firstName || '',
        name: data.name || '',
        dateBirth: data.dateBirth || '',
        telephone: data.telephone || '',
      })

      await fetchGroupMembers()
    } catch (err) {
      console.error('Profile fetch error:', err)
      setMessage('Please log in again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * FETCH GROUP MEMBERS
   * No need to send GroupId; the server finds it from the session.
   */
  const fetchGroupMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/apartmentsList`, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await res.json()
      setGroupMembers(data.groups || [])
    } catch (err) {
      console.error('Group members fetch error:', err)
    }
  }

  useEffect(() => {
    getProfileData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /**
   * UPDATE PROFILE
   */
  const updateProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (data.success) {
        setMessage('Profile updated successfully!')
        setEditMode(false)
        getProfileData() // Refresh UI
      }
    } catch (err) {
      console.error(err)
      setMessage('Error updating profile.')
    }
  }

  /**
   * VERIFY CURRENT PASSWORD
   */
  const checkPassword = async () => {
    try {
      const res = await fetch(`${API_BASE}/check-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      })

      const data = await res.json()
      if (data.valid) {
        setCanChange(true)
        setMessage('')
      } else {
        setMessage('Incorrect current password.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * CHANGE TO NEW PASSWORD
   */
  const changePassword = async () => {
    try {
      const res = await fetch(`${API_BASE}/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage(data.message)
        setCanChange(false)
        setPassword('')
        setNewPassword('')
      } else {
        setMessage(data.message)
        setCanChange(false)
        setPassword('')
        setNewPassword('')
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <Loading text="Loading profile..." />

  return (
    <>
      <MenuBar />
      <div className="profile-container">
        <div className="profile-card">
          <h2>My Profile</h2>
          {profile ? (
            <div className="profile-info">
              <div className="field-group">
                <label>Email:</label>
                <span>{profile._id}</span>
              </div>

              <div className="field-group">
                <label>First Name:</label>
                {editMode ? (
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.firstName}</span>
                )}
              </div>

              <div className="field-group">
                <label>Last Name:</label>
                {editMode ? (
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.name}</span>
                )}
              </div>

              <div className="field-group">
                <label>Birth Date:</label>
                {editMode ? (
                  <input
                    type="date"
                    name="dateBirth"
                    value={formData.dateBirth}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.dateBirth}</span>
                )}
              </div>

              <div className="field-group">
                <label>Phone:</label>
                {editMode ? (
                  <input
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.telephone}</span>
                )}
              </div>

              <div className="button-group">
                {!editMode ? (
                  <button
                    className="primary-btn"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button className="save-btn" onClick={updateProfile}>
                      Save Changes
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

              <hr />

              <div className="password-section">
                <h3>Security</h3>
                {!canChange ? (
                  <div className="verify-area">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={checkPassword}>Verify</button>
                  </div>
                ) : (
                  <div className="change-area">
                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button className="save-btn" onClick={changePassword}>
                      Confirm New Password
                    </button>
                  </div>
                )}
              </div>

              {message && (
                <p
                  className={`status-message ${message.toLowerCase().includes('incorrect') ? 'error' : ''}`}
                >
                  {message}
                </p>
              )}
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </div>

        <div className="group-card">
          {profile ? (
            <>
              <h2>Apartment: {profile._GroupId}</h2>
              <h3>Roommates:</h3>
              {groupMembers.length > 0 ? (
                <ul className="member-list">
                  {groupMembers.map((member, index) => (
                    <li
                      key={index}
                      className={
                        member._id === profile._id ? 'current-user' : ''
                      }
                    >
                      {member.firstName} {member.name}{' '}
                      {member._id === profile._id && '(Me)'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No roommates found.</p>
              )}
            </>
          ) : (
            <p>Loading group details...</p>
          )}
        </div>
      </div>
    </>
  )
}

export default MyProfile
