/**
 * File: Logout.js
 * Author: Kilian Meddas (3198575)
 */

// Import Express framework
var express = require('express')

// Create a new router instance
var router = express.Router()

// Enable JSON body parsing middleware
router.use(express.json())

router.post('/logout', (req, res) => {
  res.clearCookie('user', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  })

  res.json({ message: 'Logged out' })
})

module.exports = router
