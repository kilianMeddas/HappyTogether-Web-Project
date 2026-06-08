/**
 * File: Calendar.js
 * Author: Kilian Meddas (3198575)
 */

const express = require('express')
const router = express.Router()
const { getDB } = require('../db/Connection')
const { ObjectId } = require('mongodb')
const auth = require('../middleware/Auth')

/**
 * GET /calendar
 * Collect all tasks from the apartment
 */
router.get('/', auth, async (req, res) => {
  try {
    const db = getDB()
    const chores = db.collection('Chores')
    const roommates = db.collection('Roommates')

    const userEmail = req.user

    const user = await roommates.findOne({ _id: userEmail })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    const groupId = user._GroupId

    const result = await chores.find({ _GroupId: groupId }).toArray()

    const events = result.map((event) => ({
      id: event._id.toString(),
      title: event.title,
      start: event.start,
      end: event.end || null,
      extendedProps: {
        completed: event.completed || false,
        createdBy: event.createdBy,
      },
    }))

    res.json(events)
  } catch (err) {
    console.error('Error GET /calendar:', err)
    res
      .status(500)
      .json({ error: 'Error during the collection of the calendar' })
  }
})

/**
 * POST /calendar/add
 * Add a new task (stores the creator's email)
 */
router.post('/add', auth, async (req, res, next) => {
  try {
    const db = getDB()
    const chores = db.collection('Chores')
    const roommates = db.collection('Roommates')

    const { title, start, end } = req.body
    const userEmail = req.user

    if (!title || !start) {
      return res
        .status(400)
        .json({ error: 'Title and/or start date not given' })
    }

    const user = await roommates.findOne({ _id: userEmail })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const newEvent = {
      title,
      start,
      end: end || null,
      completed: false,
      _GroupId: user._GroupId,
      createdBy: userEmail,
    }

    const result = await chores.insertOne(newEvent)

    res.json({
      id: result.insertedId.toString(),
      ...newEvent,
    })
  } catch (err) {
    console.error('Error POST /calendar/add:', err)
    next(err)
  }
})

/**
 * DELETE /calendar/:id
 * Delete a task - Restricted to the creator ONLY
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = getDB()
    const userEmail = req.user
    const taskId = req.params.id

    const task = await db
      .collection('Chores')
      .findOne({ _id: new ObjectId(taskId) })

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Ownership check: only the creator can delete
    if (task.createdBy !== userEmail) {
      return res
        .status(403)
        .json({ error: 'Unauthorized: You can only delete your own tasks' })
    }

    await db.collection('Chores').deleteOne({
      _id: new ObjectId(taskId),
    })

    res.json({ success: true, message: 'Task deleted' })
  } catch (err) {
    console.error('Error DELETE /calendar:', err)
    res.status(500).json({ error: 'Error during the removal' })
  }
})

/**
 * PUT /calendar/:id
 * Update task status - Open to EVERYONE in the apartment
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const db = getDB()
    const { completed } = req.body
    const taskId = req.params.id

    // Check if task exists
    const task = await db
      .collection('Chores')
      .findOne({ _id: new ObjectId(taskId) })

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // No ownership check here: anyone can update the "completed" status
    const result = await db
      .collection('Chores')
      .updateOne(
        { _id: new ObjectId(taskId) },
        { $set: { completed: !!completed } },
      )

    res.json({ success: true, completed: !!completed })
  } catch (err) {
    console.error('Error PUT /calendar:', err)
    res.status(500).json({ error: 'Error during update' })
  }
})

module.exports = router
