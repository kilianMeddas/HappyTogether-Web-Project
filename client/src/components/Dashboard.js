/**
 * File: Dashboard.js
 * Author: Anaïs ASSOGANE (3199628), Kilian MEDDAS (3198575)
 *
 * Contributions:
 * - Anaïs ASSOGANE: Worked on the hero section and enhanced the card design for a more polished UI.
 * - Kilian MEDDAS: Built the interface and developed the core dashboard functionality.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Loading from './Loading.js'
import MenuBar from './MenuBar.js'
import './css/Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // States pour les previews
  const [tasksCount, setTasksCount] = useState(0)
  const [nextTask, setNextTask] = useState(null)
  const [balance, setBalance] = useState(0)
  const [votesCount, setVotesCount] = useState(0)
  const [lastDrama, setLastDrama] = useState('')
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050'

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IE', {
      day: 'numeric',
      month: 'short',
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Authentification (Critique)
        const userRes = await fetch(`${API_URL}/me`, {
          credentials: 'include',
        })

        if (!userRes.ok) {
          navigate('/') // Go back to the register page if cookie expired
          return
        }

        const userData = await userRes.json()
        setUser(userData)

        // Collect some data for overview

        // CALENDAR
        try {
          const events = await fetch(`${API_URL}/calendar`, {
            credentials: 'include',
          }).then((r) => (r.ok ? r.json() : []))

          const now = new Date()
          now.setHours(0, 0, 0, 0)

          const upcoming = events
            .filter((event) => {
              const date = new Date(event.start)
              date.setHours(0, 0, 0, 0)
              return date >= now && !event.extendedProps?.completed
            })
            .sort((a, b) => new Date(a.start) - new Date(b.start))

          setTasksCount(upcoming.length)
          setNextTask(upcoming.length > 0 ? upcoming[0] : null)
        } catch (e) {
          console.error('Error Calendar Preview:', e)
        }

        // BALANCE
        try {
          const balanceRes = await fetch(`${API_URL}/balances/me`, {
            credentials: 'include',
          })

          const balanceData = await balanceRes.json()

          console.log(balanceData)

          const myBalance = Array.isArray(balanceData)
            ? balanceData.reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0,
              )
            : 0
          setBalance(myBalance)
        } catch (e) {
          console.error('Error Balance Preview:', e)
        }

        // VOTES
        try {
          const votes = await fetch(`${API_URL}/DecisionMaking`, {
            credentials: 'include',
          }).then((r) => (r.ok ? r.json() : []))
          setVotesCount(votes.length)
        } catch (e) {
          console.error('Error Votes Preview:', e)
        }

        // --- LEADERBOARD ---
        try {
          const dramas = await fetch(`${API_URL}/leaderboard`, {
            credentials: 'include',
          }).then((r) => (r.ok ? r.json() : []))
          if (dramas.length > 0) setLastDrama(dramas[0].subject)
        } catch (e) {
          console.error('Error Leaderboard Preview:', e)
        }

        setLoading(false)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        navigate('/')
      }
    }

    fetchData()
  }, [navigate])

  const cards = [
    {
      title: 'Task Management',
      description: nextTask
        ? `Next: ${nextTask.title} (${formatDate(nextTask.start)})`
        : 'No upcoming tasks 🎉',
      sub: `${tasksCount} tasks pending`,
      route: '/calendar',
    },
    {
      title: 'Household Expense',
      description: `Balance: ${balance}€`,
      route: '/balance',
    },
    {
      title: 'Apartment Decisions',
      description: `${votesCount} votes in progress`,
      route: '/DecisionMaking', // Vérifie bien cette route
    },
    {
      title: 'Roommates Score',
      description: lastDrama || 'No drama yet 😇',
      route: '/leaderboard',
    },
  ]

  if (loading) return <Loading text="Loading dashboard..." />

  return (
    <>
      <MenuBar />
      <div className="dashboardPage">
        <div className="dashboardHero">
          <h1>Welcome {user?.firstName || user?.mail} 👋</h1>
          <p>Here&apos;s what&apos;s happening in your apartment</p>
        </div>

        <div className="dashboardGrid">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="dashboardCard"
              onClick={() => navigate(card.route)}
            >
              <div className="cardAccent"></div>
              <div className="cardContent">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                {card.sub && <span className="cardSub">{card.sub}</span>}
              </div>
              <div className="cardHover">Open →</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Dashboard
