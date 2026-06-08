/**
 * File: Registration.js
 * Author: Kilian Meddas (3198575)
 */

// Import Express framework
const express = require('express')
// Import bcrypt library for password hashing (used in middleware)
// Import database connection helper
const { getDB } = require('../db/Connection')

// Import custom middlewares
const validateUser = require('../middleware/ValidateUser') // Checks required fields
const checkEmailExists = require('../middleware/CheckEmailExists') // Ensures email is unique
const hashPassword = require('../middleware/HashPassword') // Hashes password before saving

// Create a new router instance
const router = express.Router()

// Enable JSON body parsing middleware
router.use(express.json())

// POST /registration
router.post(
  '/',
  validateUser, // Middleware: validate request body fields
  checkEmailExists, // Middleware: check if email already exists
  hashPassword, // Middleware: hash the password
  async (req, res, next) => {
    try {
      // Get database instance
      const db = getDB()
      // Access collections
      const roommates = db.collection('Roommates')
      const apartments = db.collection('Apartments') // Collection for apartments

      // Check if the apartment exists
      const apartment = await apartments.findOne({
        _id: req.body.SelectedGroup,
      })

      // If apartment does not exist, return error
      if (!apartment) {
        return res.status(404).json({ error: 'Apartment not found' })
      }

      if (apartment.currentPeople >= apartment.maxPeople) {
        return res.status(400).json({ error: 'Apartment is full' })
      }

      // Create roommate object
      const Data = {
        _id: req.body.mail, // Use email as unique ID
        firstName: req.body.firstName,
        name: req.body.name,
        dateBirth: req.body.dateBirth,
        telephone: req.body.telephone,
        password: req.body.password, // Already hashed by middleware
        _GroupId: req.body.SelectedGroup, // Link to apartment/apartment
      }

      // Insert new roommate into database
      const result = await roommates.insertOne(Data)

      // Increment number of people in the apartment
      await apartments.updateOne(
        { _id: req.body.SelectedGroup },
        { $inc: { currentPeople: 1 } },
      )

      // Send success response with created ID
      res.status(201).json({
        message: 'Roommate added!',
        id: result.insertedId,
      })
    } catch (err) {
      // Pass errors to error handling middleware
      next(err)
    }
  },
)

// Export router to be used in the main application
module.exports = router
