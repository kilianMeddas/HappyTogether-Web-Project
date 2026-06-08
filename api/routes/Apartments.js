/**
 * File: Apartments.js
 * Author: Nathan PRIGENT (3199547)
 */

const express = require('express')
const { getDB } = require('../db/Connection')
const auth = require('../middleware/Auth') // Import security middleware

const router = express.Router()

// Creates a new apartment (Group)
router.post('/create', auth, async (req, res, next) => {
  const { _id, maxPeople, currentPeople = 0 } = req.body

  // Basic validation
  if (!_id || !maxPeople) {
    return res.status(400).json({ message: 'ID and max people needed' })
  }

  try {
    const db = getDB()
    const apartments = db.collection('Apartments')

    // Check if the ID (apartment name) already exists
    const existing = await apartments.findOne({ _id })

    if (existing) {
      return res.status(400).json({ message: 'Already exists' })
    }

    const newApartment = {
      _id, // The ID here is the chosen name (e.g., "Coloc_Paris_15")
      maxPeople: parseInt(maxPeople),
      currentPeople: parseInt(currentPeople),
      createdAt: new Date(),
    }

    await apartments.insertOne(newApartment)

    res.json({ message: 'Apartment created successfully', id: _id })
  } catch (err) {
    console.error('Apartment creation error:', err)
    next(err)
  }
})

// Lists all available apartments
router.get('/', async (req, res, next) => {
  try {
    const db = getDB()
    // Return only necessary info for selection
    const apartments = await db
      .collection('Apartments')
      .find({}, { projection: { _id: 1, currentPeople: 1, maxPeople: 1 } })
      .toArray()

    res.json(apartments)
  } catch (err) {
    next(err)
  }
})

// Retrieves details for a specific apartment
router.get('/:id', auth, async (req, res, next) => {
  try {
    const db = getDB()

    const apartment = await db.collection('Apartments').findOne({
      _id: req.params.id,
    })

    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' })
    }

    res.json(apartment)
  } catch (err) {
    next(err)
  }
})

module.exports = router
