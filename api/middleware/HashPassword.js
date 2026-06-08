/**
 * File: HashPassword.js
 * Author: Kilian Meddas (3198575)
 */

const bcrypt = require('bcryptjs')

async function hashPassword(req, res, next) {
  try {
    const password = req.body.password
    req.body.password = await bcrypt.hash(password, 10)
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = hashPassword
