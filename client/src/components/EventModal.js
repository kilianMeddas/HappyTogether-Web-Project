/**
 * File: EventModal.js
 * Author: Anaïs ASSOGANE (3199628), Kilian MEDDAS (3198575)
 *
 * Contributions:
 * - Anaïs ASSOGANE: Improved the design.
 * - Kilian MEDDAS: Implemented the logic.
 */
import { useState } from 'react'

import PropTypes from 'prop-types'

function EventModal({ onClose, onSubmit }) {
  // State for event title and date
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    // Prevent submission if fields are empty
    if (!title || !date) return

    // Send event data to parent component
    onSubmit({ title, date })

    // Reset form fields
    setTitle('')
    setDate('')
  }

  return (
    // Overlay closes modal when clicked
    <div className="event-modal-overlay" onClick={onClose}>
      {/* Stop propagation to prevent closing when clicking inside modal */}
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add a task</h2>

        {/* Event creation form */}
        <form onSubmit={handleSubmit}>
          {/* Input for event title */}
          <input
            type="text"
            placeholder="Title of the event"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Input for event date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          {/* Submit button */}
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  )
}

EventModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default EventModal
