/**
 * File: Balance.js
 * Author: Léo HUANG (3198494)
 */

const express = require('express')
const router = express.Router()
const auth = require('../middleware/Auth')
const {
  getBalancesByGroup,
  getMyBalances,
} = require('../controllers/BalanceController')

router.get('/apartment', auth, getBalancesByGroup)

router.get('/me', auth, getMyBalances)

module.exports = router
