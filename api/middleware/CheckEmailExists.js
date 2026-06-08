/**
 * File: CheckEmailExists.js
 * Author: Kilian Meddas (3198575)
 */

const { getDB } = require('../db/Connection')

async function checkEmailExists(req, res, next) {
  try {
    const db = getDB()
    const roommates = db.collection('Roommates')

    const user = await roommates.findOne({ _id: req.body.mail })

    if (user) {
      return res.status(409).json({ error: 'This email is already used' })
    }

    next()
  } catch (err) {
    next(err)
  }
}

module.exports = checkEmailExists
