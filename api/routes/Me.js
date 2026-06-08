/**
 * File: Me.js
 * Author: Kilian Meddas (3198575)
 */

var express = require('express')
var router = express.Router()
var auth = require('../middleware/Auth')
var { getDB } = require('../db/Connection')

router.get('/', auth, async (req, res) => {
  try {
    const db = getDB()
    const roommates = db.collection('Roommates')

    const user = await roommates.findOne({ _id: req.user })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      mail: user._id,
      firstName: user.firstName,
      name: user.name,
      _GroupId: user._GroupId,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
