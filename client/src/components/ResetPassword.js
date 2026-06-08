/**
 * File: ResetPassword.js
 * Author: Kilian MEDDAS (3198575)
 *
 * Contributions:
 * - Kilian MEDDAS: Implemented the password reset form logic and environment detection.
 */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import './css/ResetPassword.css'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050'

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (loading) return

    if (!token) {
      setMessage('Invalid or missing token.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/reset-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: password.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('Password updated successfully! Redirecting...')
        setTimeout(() => navigate('/'), 2500)
      } else {
        if (data.message?.includes('expired')) {
          setMessage('Your reset link has expired. Please request a new one.')
        } else {
          setMessage(data.message || 'Something went wrong.')
        }
      }
    } catch (err) {
      console.error(err)
      setMessage('Server connection error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="resetPage">
      <div className="resetCard">
        {/* LOGO */}
        <div className="resetLogo">
          <img src="..\HappyTogether.png" alt="HappyTogether logo" />
        </div>

        <h2 className="resetTitle">Reset Password</h2>

        <form onSubmit={handleSubmit} className="resetForm">
          <input
            className="resetInput"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            className="resetInput"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            className="resetButton"
            type="submit"
            disabled={loading || !token}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {message && (
          <p
            className={`resetMessage ${
              message.includes('successfully') ? 'success' : 'error'
            }`}
          >
            {message}
          </p>
        )}

        {!token && <p className="resetWarning">Warning: No token provided.</p>}
      </div>
    </div>
  )
}

export default ResetPassword
