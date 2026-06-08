/**
 * File: leaderboard.js
 * Author: Anaïs Assogane (3199628)
 */

const express = require('express')
const router = express.Router()
const { getDB } = require('../db/Connection')
const { ObjectId } = require('mongodb')
const auth = require('../middleware/Auth')

/* =========================================================
Collect all drama entries of the current user's apartment
========================================================= */
router.get('/', auth, async (req, res) => {
  try {
    const db = getDB()
    const userEmail = req.user
    const user = await db.collection('Roommates').findOne({ _id: userEmail })

    if (!user) return res.status(404).json({ error: 'User not found' })

    const dramas = await db
      .collection('dramas')
      .find({ groupId: user._GroupId })
      .sort({ date: -1 })
      .toArray()

    res.json(dramas)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* =========================================================
  Add a new drama entry
========================================================= */
router.post('/', auth, async (req, res) => {
  try {
    const db = getDB()
    const { subject } = req.body
    const userEmail = req.user

    if (!subject || subject.trim() === '') {
      return res.status(400).json({ error: 'Subject is required' })
    }

    const user = await db.collection('Roommates').findOne({ _id: userEmail })

    if (!user) return res.status(404).json({ error: 'User not found' })

    const newDrama = {
      subject: subject.trim(),
      groupId: user._GroupId,
      createdBy: userEmail,
      date: new Date(),
      bad: 0,
      neutral: 0,
      good: 0,
      votes: [],
    }

    const result = await db.collection('dramas').insertOne(newDrama)

    res.json({ ...newDrama, _id: result.insertedId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* =========================================================
  Allow one user to vote on one drama
========================================================= */
router.patch('/:id/vote', auth, async (req, res) => {
  try {
    const db = getDB()
    const { type } = req.body
    const { id } = req.params
    const userEmail = req.user

    if (!['bad', 'neutral', 'good'].includes(type)) {
      return res.status(400).json({ error: 'Invalid vote type' })
    }

    const drama = await db
      .collection('dramas')
      .findOne({ _id: new ObjectId(id) })

    if (!drama) return res.status(404).json({ error: 'Drama not found' })

    const existingVote = (drama.votes || []).find(
      (v) => v.userEmail === userEmail,
    )

    if (existingVote) {
      if (existingVote.type === type) return res.json(drama)

      const updateOps = {
        [existingVote.type]: -1,
        [type]: 1,
      }

      await db.collection('dramas').updateOne(
        { _id: new ObjectId(id), 'votes.userEmail': userEmail },
        {
          $inc: updateOps,
          $set: { 'votes.$.type': type },
        },
      )
    } else {
      await db.collection('dramas').updateOne(
        { _id: new ObjectId(id) },
        {
          $inc: { [type]: 1 },
          $push: { votes: { userEmail, type } },
        },
      )
    }

    const updatedDrama = await db
      .collection('dramas')
      .findOne({ _id: new ObjectId(id) })

    res.json(updatedDrama)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* =========================================================
Delete one or more drama entries created by the current user
========================================================= */
router.delete('/', auth, async (req, res) => {
  try {
    const db = getDB()
    const { ids } = req.body
    const userEmail = req.user

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array required' })
    }

    const user = await db.collection('Roommates').findOne({ _id: userEmail })
    const objectIds = ids.map((id) => new ObjectId(id))

    const result = await db.collection('dramas').deleteMany({
      _id: { $in: objectIds },
      groupId: user._GroupId,
      createdBy: userEmail,
    })

    res.json({ deletedCount: result.deletedCount })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
