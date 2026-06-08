/**
 * File: Login.js
 * Author: Kilian Meddas (3198575)
 */

// Import Express framework
const express = require('express')

// Import database connection functions
const { connectDB, getDB } = require('../db/Connection')

// Import bcrypt for password comparison
const bcrypt = require('bcryptjs')

// Create a new router instance
const router = express.Router()

// Enable JSON body parsing middleware
router.use(express.json())

// Initialize database connection ONCE
connectDB()
  .then(() => console.log('DB ready'))
  .catch(console.error)

// POST /login - user login route
router.post('/', async (req, res) => {
  try {
    // Get database instance
    const db = getDB()
    // Access "Roommates" collection
    const roommates = db.collection('Roommates')

    // Extract email and password from request body
    const { mail, password } = req.body

    // Check if inputs exist
    if (!mail || !password) {
      return res.status(400).json({ message: 'Missing email or password' })
    }

    // Find user
    const user = await roommates.findOne({ _id: mail })

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ message: 'Bad credentials' })
    }

    // Send cookie
    res.cookie('user', user._id, {
      httpOnly: true,
      secure: true, // set to false  if localhost
      sameSite: 'none', // set to lax if localhost
      signed: true,
    })

    // Send response
    res.json({
      mail: user._id,
      firstName: user.firstName,
      name: user.name,
      _GroupId: user._GroupId,
    })
  } catch (err) {
    // Log server error
    console.error(err)
    // Send generic server error response
    res.status(500).send('Server error')
  }
})

// Export router
module.exports = router
