/**
 * File: NewAccount.js
 * Author: Anaïs ASSOGANE (3199628), Kilian MEDDAS (3199547)
 *
 * Contributions:
 * - Anaïs ASSOGANE: Redesigned the sign-up page layout, making it wider and shifting the form to the right.
 *   Added a left panel with a "Welcome to HappyTogether" presentation section to improve UX and onboarding.
 *
 * - Kilian MEDDAS: Implemented the registration logic, including form handling, API integration,
 *   apartment selection fetching, and account creation flow.
 */
// Import hooks and navigation
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './css/SignPage.module.css'

// Component for creating a new account
const NewAccount = () => {
  const navigate = useNavigate()
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050'

  // STATE
  const [form, setForm] = useState({
    firstName: '',
    name: '',
    dateBirth: '',
    mail: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    groupId: '',
  })

  const [groups, setGroups] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // FETCH APARTMENTS
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(`${API_URL}/apartments`)

        if (!res.ok) throw new Error('Failed to fetch apartments')

        const data = await res.json()
        setGroups(data)
      } catch (err) {
        console.error('Error fetching apartments:', err)
      }
    }

    fetchGroups()
  }, [API_URL])

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginRedirect = () => {
    navigate('/login')
  }

  // SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: form.firstName,
          name: form.name,
          dateBirth: form.dateBirth,
          telephone: form.telephone,
          mail: form.mail,
          password: form.password,
          SelectedGroup: form.groupId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          alert('Email already used')
        } else {
          alert(data.error || 'Registration failed')
        }
        return
      }

      alert('Account created successfully!')
      navigate('/login')
    } catch (err) {
      console.error('Registration error:', err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // RENDER
  return (
    <div className={styles.SubmitForm}>
      <div className={styles.leftPanel}>
        <img
          src="/HappyTogether.png"
          alt="HappyTogether logo"
          className={styles.logo}
        />
        <h1 className={styles.brandTitle}>Welcome to HappyTogether</h1>
        <p className={styles.brandSubtitle}>
          Manage chores, shared expenses, apartment decisions and everyday life
          together in one space built for roommates.
        </p>
      </div>

      <div className={styles.rightPanel}>
        <h2>Login</h2>

        <p
          className={styles.loginRedirect}
          onClick={handleLoginRedirect}
          style={{ alignContent: 'center', cursor: 'pointer', opacity: 1 }}
        >
          Already have an account ? Click here to login
        </p>
        <h2>Sign up</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles['form-row']}>
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="name"
              placeholder="Last name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <div className={styles['date-row']}>
              <span>Date of Birth</span>
              <input
                type="date"
                name="dateBirth"
                value={form.dateBirth}
                onChange={handleChange}
                required
              />
            </div>

            <select
              name="groupId"
              value={form.groupId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select an apartment
              </option>

              {groups.map((g) => (
                <option
                  key={g._id}
                  value={g._id}
                  disabled={g.currentPeople >= g.maxPeople}
                >
                  {g._id} ({g.currentPeople}/{g.maxPeople})
                </option>
              ))}
            </select>

            <input
              type="tel"
              name="telephone"
              placeholder="Phone number"
              value={form.telephone}
              onChange={handleChange}
            />

            <input
              type="email"
              name="mail"
              placeholder="Email (example@mail.com)"
              value={form.mail}
              onChange={handleChange}
              required
            />

            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <div className={styles.showpassword_box}>
              <input
                type="checkbox"
                id="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              <label htmlFor="checkbox">Show password</label>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewAccount
