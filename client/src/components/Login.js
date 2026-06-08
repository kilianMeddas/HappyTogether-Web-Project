/**
 * File: Login.js
 * Author: Anaïs ASSOGANE (3199628), Kilian MEDDAS (3199547)
 *
 * Contributions:
 * - Anaïs ASSOGANE: Slightly improved the UI and layout of the login page.
 *
 * - Kilian MEDDAS: Implemented the login logic and authentication flow, including API integration and navigation handling.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './css/SubmitPage.module.css'

function Login() {
  // State for email and password inputs
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false)

  const [forgotMessage, setForgotMessage] = useState('')
  const [loadingForgot, setLoadingForgot] = useState(false)

  // Hook for navigation between pages
  const navigate = useNavigate()
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050'

  // Handle login form submission

  /**
   * Forgot password handler
   */
  const handleForgotPassword = async (e) => {
    e.preventDefault()

    if (!mail) {
      setForgotMessage('Please enter your email first.')
      return
    }

    if (loadingForgot) return

    setLoadingForgot(true)
    setForgotMessage('')

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: mail }),
      })

      const data = await res.json()

      setForgotMessage(
        data.message || 'If an account exists, a recovery email has been sent.',
      )
    } catch (err) {
      console.error(err)
      setForgotMessage('Error sending recovery email.')
    } finally {
      setLoadingForgot(false)
    }
  }
  const Submit = async (e) => {
    e.preventDefault()

    // Prepare data to send to backend
    const Data = { mail, password }

    try {
      // Send login request
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Data),
      })

      // Parse JSON FIRST
      const data = await response.json()

      // Handle errors properly
      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      console.log(data)
      // Redirect
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }

  const Registration = () => {
    navigate('/')
  }

  return (
    <div className={styles.SubmitForm}>
      <h2>Log in</h2>

      <form onSubmit={Submit}>
        <div className={styles['form-row']}>
          {/* Email input */}
          <input
            type="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            placeholder="E-mail"
            required
          />

          {/* Password input with visibility toggle */}
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          {/* Checkbox to show/hide password */}
          <div className={styles.showpassword_box}>
            <input
              type="checkbox"
              id="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <label htmlFor="checkbox">Show password</label>
          </div>

          {/* Submit button */}
          <button type="submit">Connexion</button>

          {/* Forgot password link */}
          <p
            className={styles.forgot}
            onClick={handleForgotPassword}
            style={{
              cursor: mail ? 'pointer' : 'not-allowed',
              opacity: mail ? 1 : 0.5,
            }}
          >
            {loadingForgot ? 'Sending...' : 'Forgot your password?'}
          </p>

          {/* Message */}
          {forgotMessage && (
            <p style={{ textAlign: 'center', marginTop: '10px' }}>
              {forgotMessage}
            </p>
          )}
          {/* Navigate to registration */}
          <button onClick={Registration}>Create an account</button>
        </div>
      </form>
    </div>
  )
}

export default Login
