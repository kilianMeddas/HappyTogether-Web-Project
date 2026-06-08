/**
 * File:Expense.js
 * Author: Léo HUANG (3198494)
 */

const express = require('express')
const router = express.Router()
const auth = require('../middleware/Auth')
const {
  createExpense,
  getMyExpenses,
  getExpensesByGroup,
} = require('../controllers/ExpenseController')

router.post('/', auth, createExpense)
router.get('/me', auth, getMyExpenses)
router.get('/apartment', auth, getExpensesByGroup)

module.exports = router
