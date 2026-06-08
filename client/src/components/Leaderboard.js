/**
 * File: Leaderboard.js
 * Author: Anaïs ASSOGANE (3199628)
 */
import { useEffect, useMemo, useRef, useState } from 'react'

import Loading from './Loading.js'
import MenuBar from './MenuBar'
import styles from './css/Leaderboard.module.css'

export default function Leaderboard() {
  const [data, setData] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [comment, setComment] = useState('')
  const [voteId, setVoteId] = useState(null)
  const [deleteMode, setDeleteMode] = useState(false)
  const [selected, setSelected] = useState([])
  const [filter, setFilter] = useState('date')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const filterRef = useRef(null)

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050'
  const API = `${API_URL}/leaderboard`

  /* =========================
     HELPERS
  ========================= */
  const getGoodVotes = (item) => item?.good ?? item?.votes?.good ?? 0
  const getNeutralVotes = (item) => item?.neutral ?? item?.votes?.neutral ?? 0
  const getBadVotes = (item) => item?.bad ?? item?.votes?.bad ?? 0
  const getItemDate = (item) => item?.date ?? item?.createdAt ?? null

  const formatDate = (value) => {
    if (!value) return ''

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    const formattedDate = date.toLocaleDateString('en-IE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    const formattedTime = date.toLocaleTimeString('en-IE', {
      hour: '2-digit',
      minute: '2-digit',
    })

    return `${formattedDate} • ${formattedTime}`
  }

  const toggleSelection = (id, checked) => {
    if (checked) {
      setSelected((prev) => [...prev, id])
    } else {
      setSelected((prev) => prev.filter((itemId) => itemId !== id))
    }
  }

  /* =========================
     FETCH CURRENT USER
  ========================= */
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to fetch user')

      const user = await res.json()
      setUserEmail(user.mail || user.email || '')
    } catch (err) {
      console.error('User fetch error:', err)
    }
  }

  /* =========================
     FETCH LEADERBOARD DATA
  ========================= */
  const loadLeaderboardData = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(API, {
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to fetch leaderboard')

      const result = await res.json()
      setData(Array.isArray(result) ? result : [])
    } catch (err) {
      console.error(err)
      setError('Unable to load leaderboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
    loadLeaderboardData()
  }, [])

  /* =========================
     CLOSE FILTER ON OUTSIDE CLICK
  ========================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  /* =========================
     ADD DRAMA
  ========================= */
  const addDrama = async () => {
    if (!comment.trim()) return

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subject: comment }),
      })

      if (res.ok) {
        const newDrama = await res.json()
        setData((prev) => [newDrama, ...prev])
        setComment('')
        setShowModal(false)
      }
    } catch (err) {
      console.error('Add drama error:', err)
    }
  }

  /* =========================
     HANDLE VOTE
  ========================= */
  const handleVote = async (type) => {
    if (!voteId) return

    try {
      const res = await fetch(`${API}/${voteId}/vote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type }),
      })

      if (res.ok) {
        const updated = await res.json()
        setData((prev) =>
          prev.map((item) => (item._id === updated._id ? updated : item)),
        )
        setVoteId(null)
      }
    } catch (err) {
      console.error('Vote error:', err)
    }
  }

  /* =========================
     DELETE SELECTED DRAMAS
  ========================= */
  const deleteSelected = async () => {
    if (selected.length === 0) return

    try {
      const res = await fetch(API, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: selected }),
      })

      if (res.ok) {
        setData((prev) => prev.filter((item) => !selected.includes(item._id)))
        setSelected([])
        setDeleteMode(false)
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  /* =========================
     SORT DATA
  ========================= */
  const sorted = useMemo(() => {
    const copied = [...data]

    copied.sort((a, b) => {
      if (filter === 'positive') {
        return getGoodVotes(b) - getGoodVotes(a)
      }

      if (filter === 'negative') {
        return getBadVotes(b) - getBadVotes(a)
      }

      const dateA = getItemDate(a) ? new Date(getItemDate(a)).getTime() : 0
      const dateB = getItemDate(b) ? new Date(getItemDate(b)).getTime() : 0
      return dateB - dateA
    })

    return copied
  }, [data, filter])

  if (loading) return <Loading text="Loading leaderboard..." />

  if (error) {
    return <div className={styles.leaderboardStatus}>{error}</div>
  }

  return (
    <div className={styles.leaderboard}>
      <MenuBar />

      <div className={styles.actions}>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          + Add
        </button>

        <div className={styles.filterWrapper} ref={filterRef}>
          <button
            className={styles.filterBtn}
            onClick={() => setShowFilterMenu((prev) => !prev)}
          >
            Filter
          </button>

          {showFilterMenu && (
            <div className={styles.filterMenu}>
              <button
                onClick={() => {
                  setFilter('date')
                  setShowFilterMenu(false)
                }}
              >
                By date
              </button>

              <button
                onClick={() => {
                  setFilter('positive')
                  setShowFilterMenu(false)
                }}
              >
                By positivity
              </button>

              <button
                onClick={() => {
                  setFilter('negative')
                  setShowFilterMenu(false)
                }}
              >
                By negativity
              </button>
            </div>
          )}
        </div>

        <button
          className={styles.deleteIconBtn}
          onClick={() => setDeleteMode((prev) => !prev)}
        >
          🗑
        </button>
      </div>

      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <textarea
              placeholder="Describe the drama..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className={styles.modalActions}>
              <button className={styles.modalBtn} onClick={addDrama}>
                Add
              </button>

              <button
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {voteId && (
        <div className={styles.modalOverlay} onClick={() => setVoteId(null)}>
          <div
            className={`${styles.modal} ${styles.voteModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Cast your vote</h3>
            <p className={styles.voteSubtitle}>
              Choose the reaction that matches this drama best.
            </p>

            <div className={styles.voteBtns}>
              <button onClick={() => handleVote('bad')}>
                <span className={styles.voteEmoji}>😡</span>
                <span>
                  <span className={styles.voteLabel}>Negative</span>
                  <span className={styles.voteHint}>Not okay</span>
                </span>
              </button>

              <button onClick={() => handleVote('neutral')}>
                <span className={styles.voteEmoji}>😐</span>
                <span>
                  <span className={styles.voteLabel}>Neutral</span>
                  <span className={styles.voteHint}>No comment</span>
                </span>
              </button>

              <button onClick={() => handleVote('good')}>
                <span className={styles.voteEmoji}>😊</span>
                <span>
                  <span className={styles.voteLabel}>Positive</span>
                  <span className={styles.voteHint}>Fair enough</span>
                </span>
              </button>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.closeBtn}
                onClick={() => setVoteId(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <div></div>
          <div>Date</div>
          <div>Subject</div>
          <div className={styles.colVotesHeader}>😡</div>
          <div className={styles.colVotesHeader}>😐</div>
          <div className={styles.colVotesHeader}>😊</div>
          <div></div>
        </div>

        <div className={styles.tableBody}>
          {sorted.map((item) => (
            <div className={styles.dramaRow} key={item._id}>
              <div className={styles.colSelect}>
                {deleteMode && item.createdBy === userEmail && (
                  <input
                    type="checkbox"
                    checked={selected.includes(item._id)}
                    onChange={(e) =>
                      toggleSelection(item._id, e.target.checked)
                    }
                  />
                )}
              </div>

              <div className={styles.colDate}>
                {formatDate(getItemDate(item))}
              </div>

              <div className={styles.colSubject}>
                <span className={styles.subjectText}>{item.subject}</span>
              </div>

              <div className={styles.colVote}>{getBadVotes(item)}</div>
              <div className={styles.colVote}>{getNeutralVotes(item)}</div>
              <div className={styles.colVote}>{getGoodVotes(item)}</div>

              <div className={styles.colAction}>
                <button
                  className={styles.voteBtn}
                  onClick={() => setVoteId(item._id)}
                >
                  Vote
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {deleteMode && selected.length > 0 && (
        <button className={styles.deleteBtn} onClick={deleteSelected}>
          Delete selected ({selected.length})
        </button>
      )}
    </div>
  )
}
