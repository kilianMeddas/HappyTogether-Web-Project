/**
 * File: ValidateUser.js
 * Author: Kilian Meddas (3198575)
 */

function validateUser(req, res, next) {
  const { firstName, name, mail, password } = req.body
  if (!firstName || !name || !mail || !password) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  next()
}

module.exports = validateUser
