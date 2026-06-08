/**
 * File: Auth.js
 * Author: Kilian Meddas (3198575)
 */

module.exports = function (req, res, next) {
  const user = req.signedCookies.user

  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  req.user = user

  next()
}
