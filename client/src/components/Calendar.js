/**
 * File: Calendar.js
 * Author: Anaïs ASSOGANE (3199628), Kilian MEDDAS (3198575)
 *
 * Contributions:
 * - Anaïs ASSOGANE: Modified calendar features including the info button and delete button logic.
 * - Kilian MEDDAS: Implemented the core calendar logic.
 */
import { useEffect, useRef, useState } from 'react'

import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import multiMonthPlugin from '@fullcalendar/multimonth'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'

import MenuBar from './MenuBar'
import './css/CalendarPage.css'

function CalendarPage() {
  const [events, setEvents] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [completedEvents, setCompletedEvents] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
  })

  const calendarRef = useRef(null)

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050'

  const loadEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/calendar`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (err) {
      console.error('Error loading events:', err)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const closeAddModal = () => {
    setFormData({
      title: '',
      start: '',
      end: '',
    })

    setIsModalOpen(false)
  }

  const handleAdd = async () => {
    if (!formData.title || !formData.start) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startDate = new Date(formData.start)
    startDate.setHours(0, 0, 0, 0)

    if (startDate < today) {
      alert('Impossible to add an old task')
      return
    }

    try {
      const res = await fetch(`${API_URL}/calendar/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          start: formData.start,
          end: formData.end || null,
        }),
      })

      if (res.ok) {
        await loadEvents()
        closeAddModal()
      }
    } catch (err) {
      console.error('Error adding event:', err)
    }
  }

  const toggleCompleted = async (event) => {
    const completed = event.extendedProps.completed

    try {
      const res = await fetch(`${API_URL}/calendar/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          completed: !completed,
        }),
      })

      if (res.ok) {
        event.setExtendedProp('completed', !completed)
      } else if (res.status === 403) {
        alert('Only the creator can update this task.')
      }
    } catch (err) {
      console.error('Toggle error:', err)
    }
  }

  const openDeleteModal = () => {
    if (!calendarRef.current) return

    const calendarApi = calendarRef.current.getApi()
    const allEvents = calendarApi.getEvents()

    const completed = allEvents.filter(
      (event) => event.extendedProps.completed === true,
    )

    if (completed.length === 0) {
      alert('No completed tasks to delete.')
      return
    }

    setCompletedEvents(completed)
    setIsDeleteModalOpen(true)
  }

  const deleteCompletedTasks = async () => {
    try {
      for (const event of completedEvents) {
        const res = await fetch(`${API_URL}/calendar/${event.id}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (res.status === 403) {
          alert(
            `You cannot delete "${event.title}". Only the creator can remove it.`,
          )
        }
      }

      await loadEvents()

      setCompletedEvents([])
      setIsDeleteModalOpen(false)
    } catch (err) {
      console.error('Error deleting tasks:', err)
      alert('Error while deleting tasks.')
    }
  }

  return (
    <>
      <MenuBar />

      <div className="calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            multiMonthPlugin,
            interactionPlugin,
          ]}
          initialView="multiMonth"
          duration={{ months: 2 }}
          multiMonthMaxColumns={2}
          events={events}
          height="auto"
          selectable={true}
          headerToolbar={{
            left: 'title',
            center: 'addButton deleteCompletedButton',
            right: 'infoButton today prev,next',
          }}
          customButtons={{
            addButton: {
              text: 'Add Task',
              click: () => setIsModalOpen(true),
            },
            deleteCompletedButton: {
              text: 'Delete completed tasks',
              click: openDeleteModal,
            },
            infoButton: {
              text: 'ⓘ Info',
              click: () => setIsInfoModalOpen(true),
            },
          }}
          dateClick={(info) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const clickedDate = new Date(info.dateStr)
            clickedDate.setHours(0, 0, 0, 0)

            if (clickedDate < today) {
              alert('Date has already passed')
              return
            }

            setFormData({
              title: '',
              start: info.dateStr,
              end: '',
            })

            setIsModalOpen(true)
          }}
          eventClick={(info) => toggleCompleted(info.event)}
          eventClassNames={(arg) =>
            arg.event.extendedProps.completed ? ['event-completed'] : []
          }
          eventContent={(arg) => (
            <span>
              {arg.event.extendedProps.completed ? '✔ ' : ''}
              {arg.event.title}
            </span>
          )}
        />
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add an event</h2>

            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
            />

            <input
              type="date"
              name="start"
              value={formData.start}
              onChange={handleChange}
            />

            <input
              type="date"
              name="end"
              value={formData.end}
              onChange={handleChange}
            />

            <div className="modal-actions">
              <button onClick={handleAdd}>Validate</button>
              <button onClick={closeAddModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal">
          <div className="modal-content delete-modal-content">
            <h2>Delete completed tasks?</h2>

            <p>Are you sure you want to delete:</p>

            <ul className="delete-modal-list">
              {completedEvents.map((event) => (
                <li key={event.id}>{event.title}</li>
              ))}
            </ul>

            <div className="modal-actions">
              <button
                className="delete-confirm-btn"
                onClick={deleteCompletedTasks}
              >
                Delete all
              </button>

              <button
                className="delete-cancel-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isInfoModalOpen && (
        <div className="modal">
          <div className="modal-content info-modal-content">
            <h2>How to use the calendar</h2>

            <div className="info-steps">
              <div className="info-step">
                <span>1</span>
                <p>
                  To add a task, click on <strong>Add Task</strong> or directly
                  click on the day where you want to create it.
                </p>
              </div>

              <div className="info-step">
                <span>2</span>
                <p>
                  You only need to choose a <strong>start date</strong>. The end
                  date is optional.
                </p>
              </div>

              <div className="info-step">
                <span>3</span>
                <p>Click once on a created task to mark it as completed.</p>
              </div>

              <div className="info-step">
                <span>4</span>
                <p>
                  Once your tasks are completed, click{' '}
                  <strong>Delete completed tasks</strong> to remove them.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setIsInfoModalOpen(false)}>Got it</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CalendarPage
