/**
 * File: DecisionMaking.js
 * Author: Anaïs ASSOGANE (3199628), Nathan PRIGENT (3199547)
 * 
 * Contributions:
 * - Nathan: Built the card view.
 * - Anaïs ASSOGANE: Designed and improved the UI and overall layout of the page (everything else).

 */
import { useEffect, useMemo, useRef, useState } from 'react'

import MenuBar from './MenuBar'
import styles from './css/DecisionMaking.module.css'

function DecisionMaking() {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050'

  const [votes, setVotes] = useState([])
  const [filter, setFilter] = useState('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [displayMode, setDisplayMode] = useState('cards')

  const [formData, setFormData] = useState({
    question: '',
  })

  const filterRef = useRef(null)

  /* =========================
     LOAD VOTES
  ========================= */
  const loadVotes = async () => {
    try {
      const res = await fetch(`${API_URL}/DecisionMaking`, {
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to load votes')

      const data = await res.json()
      setVotes(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading votes:', err)
    }
  }

  useEffect(() => {
    loadVotes()
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
     INPUT HANDLING
  ========================= */
  const handleQuestionChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      question: e.target.value,
    }))
  }

  /* =========================
     CREATE VOTE
  ========================= */
  const handleCreate = async () => {
    if (!formData.question.trim()) {
      alert('Fill all fields')
      return
    }

    try {
      const res = await fetch(`${API_URL}/DecisionMaking/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question: formData.question.trim() }),
      })

      if (!res.ok) throw new Error('Failed to create vote')

      await loadVotes()
      closeModal()
    } catch (err) {
      console.error('Error creating vote:', err)
    }
  }

  /* =========================
     VOTE
  ========================= */
  const handleVote = async (voteId, optionIndex) => {
    try {
      const res = await fetch(`${API_URL}/DecisionMaking/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ voteId, optionIndex }),
      })

      if (res.ok) {
        await loadVotes()
      } else {
        const data = await res.json()
        alert(data.message || 'Unable to vote')
      }
    } catch (err) {
      console.error('Vote error:', err)
    }
  }

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (voteId) => {
    const confirmDelete = window.confirm('Delete this vote?')
    if (!confirmDelete) return

    try {
      const res = await fetch(`${API_URL}/DecisionMaking/${voteId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        await loadVotes()
      } else {
        const data = await res.json()
        alert(data.message || 'Unable to delete')
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  /* =========================
     MODAL
  ========================= */
  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setFormData({ question: '' })
    setIsModalOpen(false)
  }

  /* =========================
     HELPERS
  ========================= */
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

  const getCreatedAt = (vote) => vote.createdAt || vote.date || null
  const hasCurrentUserVoted = (vote) => Boolean(vote.currentUserHasVoted)

  /* =========================
     FILTERED + SORTED VOTES
  ========================= */
  const displayedVotes = useMemo(() => {
    const copied = [...votes]

    const filtered = copied.filter((vote) => {
      if (filter === 'voted') return hasCurrentUserVoted(vote)
      if (filter === 'notVoted') return !hasCurrentUserVoted(vote)
      return true
    })

    filtered.sort((a, b) => {
      const dateA = getCreatedAt(a) ? new Date(getCreatedAt(a)).getTime() : 0
      const dateB = getCreatedAt(b) ? new Date(getCreatedAt(b)).getTime() : 0
      return dateB - dateA
    })

    return filtered
  }, [votes, filter])

  return (
    <div className="decision">
      <MenuBar />

      <div className={styles.decision}>
        <div className={styles['decision-making']}>
          <div className={styles.decision_create}>
            <div className={styles.topBar}>
              <div className={styles.topBarText}></div>

              <div className={styles.topBarActions}>
                <div className={styles.decision_filterWrapper} ref={filterRef}>
                  <button
                    className={styles.decision_filterBtn}
                    onClick={() => setShowFilterMenu((prev) => !prev)}
                  >
                    Filter
                  </button>

                  {showFilterMenu && (
                    <div className={styles.decision_filterMenu}>
                      <button
                        onClick={() => {
                          setFilter('all')
                          setShowFilterMenu(false)
                        }}
                      >
                        All votes
                      </button>

                      <button
                        onClick={() => {
                          setFilter('voted')
                          setShowFilterMenu(false)
                        }}
                      >
                        I voted
                      </button>

                      <button
                        onClick={() => {
                          setFilter('notVoted')
                          setShowFilterMenu(false)
                        }}
                      >
                        I didn’t vote
                      </button>
                    </div>
                  )}
                </div>

                <button
                  className={styles.displaySwitchBtn}
                  onClick={() =>
                    setDisplayMode((prev) =>
                      prev === 'cards' ? 'table' : 'cards',
                    )
                  }
                >
                  {displayMode === 'cards' ? 'Table view' : 'Card view'}
                </button>

                <button
                  className={styles['decision_create-button']}
                  onClick={openModal}
                >
                  Create vote
                </button>
              </div>
            </div>
          </div>

          <div className={styles.content}>
            {displayedVotes.length === 0 ? (
              <div className={styles.emptyState}>
                <h2 className={styles.emptyTitle}>No votes yet</h2>
                <p className={styles.emptyText}>
                  Create the first apartment vote and let everyone participate.
                </p>
                <button className={styles.emptyButton} onClick={openModal}>
                  Create vote
                </button>
              </div>
            ) : displayMode === 'cards' ? (
              <div className={styles.voteList}>
                {displayedVotes.map((vote) => (
                  <div key={vote._id} className={styles['vote-part']}>
                    <div className={styles.decision_headers}>
                      <div className={styles.voteHeaderText}>
                        <div className={styles.voteMetaRow}>
                          <span className={styles.voteDate}>
                            {formatDate(getCreatedAt(vote))}
                          </span>

                          {vote.creatorName && (
                            <span className={styles.creatorBadge}>
                              Created by: {vote.creatorName}
                            </span>
                          )}

                          {vote.currentUserHasVoted && (
                            <span className={styles.votedBadge}>Voted</span>
                          )}
                        </div>

                        <h3 className={styles.voteQuestion}>{vote.question}</h3>
                      </div>

                      {vote.creator && (
                        <button
                          className={styles['decision_delete-button']}
                          onClick={() => handleDelete(vote._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <div className={styles.decision_options}>
                      {vote.options?.map((opt, index) => (
                        <button
                          key={index}
                          className={styles.optionButton}
                          onClick={() => handleVote(vote._id, index)}
                        >
                          <span className={styles.optionText}>{opt.text}</span>
                          <span className={styles.optionVotes}>
                            {opt.votes} {opt.votes === 1 ? 'vote' : 'votes'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <div className={styles.tableHeaderDecision}>
                  <div>Date</div>
                  <div>Subject</div>
                  <div>Votes</div>
                  <div>Status</div>
                </div>

                <div className={styles.tableBodyDecision}>
                  {displayedVotes.map((vote) => (
                    <div key={vote._id} className={styles.decisionRow}>
                      <div className={styles.colDecisionDate}>
                        <div className={styles.tableDateText}>
                          {formatDate(getCreatedAt(vote))}
                        </div>

                        {vote.creatorName && (
                          <div className={styles.creatorInlineText}>
                            Created by: {vote.creatorName}
                          </div>
                        )}
                      </div>

                      <div className={styles.colDecisionSubject}>
                        <div className={styles.subjectTextDecision}>
                          {vote.question}
                        </div>
                      </div>

                      <div className={styles.colDecisionOptions}>
                        {vote.options?.map((opt, index) => (
                          <button
                            key={index}
                            className={styles.nameVotePill}
                            onClick={() => handleVote(vote._id, index)}
                          >
                            <span className={styles.nameVoteText}>
                              {opt.text}
                            </span>
                            <span className={styles.nameVoteCount}>
                              {opt.votes}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className={styles.colDecisionAction}>
                        {vote.currentUserHasVoted ? (
                          <span className={styles.votedBadgeTable}>Voted</span>
                        ) : (
                          <span className={styles.noActionText}>Not voted</span>
                        )}

                        {vote.creator && (
                          <button
                            className={styles.tableDeleteBtn}
                            onClick={() => handleDelete(vote._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.decision_modal} onClick={closeModal}>
          <div
            className={styles['decision_modal-vote']}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create vote</h2>
            </div>

            <div className={styles.modalBody}>
              <input
                id="vote-question"
                className={styles.input}
                type="text"
                placeholder="What should the apartment decide?"
                value={formData.question}
                onChange={handleQuestionChange}
              />
            </div>

            <div className={styles['decision_modal-actions']}>
              <button className={styles.confirmButton} onClick={handleCreate}>
                Create
              </button>
              <button className={styles.cancelButton} onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DecisionMaking
