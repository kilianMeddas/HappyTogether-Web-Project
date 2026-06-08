/**
 * File: MyProfile.js
 * Author: Kilian Meddas (3198575)
 */

const express = require('express')
const { getDB } = require('../db/Connection')
const bcrypt = require('bcryptjs')
const auth = require('../middleware/Auth')

const router = express.Router()

/**
 * GET /myprofile
 * Collect the profile of the user connected by cookie
 */
router.get('/', auth, async (req, res, next) => {
  try {
    const db = getDB()
    const userEmail = req.user // Extract the cookie by Auth.js

    const user = await db.collection('Roommates').findOne({ _id: userEmail })

    if (!user) return res.status(404).json({ message: 'Profil not found' })

    const { password, ...safeUserData } = user
    res.json(safeUserData)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /myprofile/apartmentsList
 * Collect all resident of the apartment
 */
router.get('/apartmentsList', auth, async (req, res, next) => {
  try {
    const db = getDB()
    const userEmail = req.user

    // Find the apartment of th user
    const currentUser = await db
      .collection('Roommates')
      .findOne({ _id: userEmail })
    if (!currentUser) return res.status(404).json({ message: 'User not found' })

    const results = await db
      .collection('Roommates')
      .find({ _GroupId: currentUser._GroupId })
      .project({ password: 0 }) // we exclude others passwords
      .toArray()

    res.json({ groups: results })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /myprofile/check-password
 * Check the password for sensible actions (to change password)
 */
router.post('/check-password', auth, async (req, res, next) => {
  const { password } = req.body
  const userEmail = req.user

  try {
    const db = getDB()
    const user = await db.collection('Roommates').findOne({ _id: userEmail })

    if (!user) return res.status(404).json({ valid: false })

    const isValid = await bcrypt.compare(password, user.password)
    res.json({ valid: isValid })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /myprofile/change-password
 * To change the password
 */
router.patch('/change-password', auth, async (req, res, next) => {
  const { newPassword } = req.body
  const userEmail = req.user

  if (newPassword.trim() === '') {
    res.json({ success: false, message: 'New password empty' })
  } else {
    try {
      const db = getDB()
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      await db
        .collection('Roommates')
        .updateOne({ _id: userEmail }, { $set: { password: hashedPassword } })

      res.json({ success: true, message: 'Password updated' })
    } catch (err) {
      next(err)
    }
  }
})

/**
 * PUT /myprofile/update
 * Update the non sensible information
 */
router.put('/update', auth, async (req, res, next) => {
  const { firstName, name, dateBirth, telephone } = req.body
  const userEmail = req.user

  try {
    const db = getDB()

    const result = await db.collection('Roommates').updateOne(
      { _id: userEmail },
      {
        $set: {
          firstName,
          name,
          dateBirth,
          telephone,
        },
      },
    )

    res.json({ success: true, result })
  } catch (err) {
    next(err)
  }
})

module.exports = router
