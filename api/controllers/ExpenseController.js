/**
 * File: ExpenseController.js
 * Author: Léo HUANG (3198494)
 */

const { getDB } = require('../db/Connection')

const createExpense = async (req, res) => {
  try {
    const db = getDB()
    const userEmail = req.user
    const { label, cost } = req.body

    if (
      !label ||
      cost === undefined ||
      cost === null ||
      Number.isNaN(parseFloat(cost))
    ) {
      return res.status(400).json({ message: 'Label and cost are required' })
    }

    const user = await db.collection('Roommates').findOne({ _id: userEmail })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const newExpense = {
      label: String(label).trim(),
      cost: parseFloat(cost),
      buyer: userEmail,
      _GroupId: user._GroupId,
      createdAt: new Date(),
    }

    const result = await db.collection('Expense').insertOne(newExpense)

    res.status(201).json({
      message: 'Expense created',
      id: result.insertedId,
      expense: newExpense,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create expense',
      error: error.message,
    })
  }
}

const getMyExpenses = async (req, res) => {
  try {
    const db = getDB()
    const userEmail = req.user

    const expenses = await db
      .collection('Expense')
      .find({ buyer: userEmail })
      .sort({ createdAt: -1 })
      .toArray()

    res.status(200).json(expenses)
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching expenses',
      error: error.message,
    })
  }
}

const getExpensesByGroup = async (req, res) => {
  try {
    const db = getDB()
    const userEmail = req.user

    const user = await db.collection('Roommates').findOne({ _id: userEmail })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const expenses = await db
      .collection('Expense')
      .find({ _GroupId: user._GroupId })
      .sort({ createdAt: -1 })
      .toArray()

    const roommates = await db
      .collection('Roommates')
      .find({ _GroupId: user._GroupId })
      .toArray()

    const expensesWithNames = expenses.map((expense) => {
      const buyerRoommate = roommates.find(
        (roommate) => roommate._id === expense.buyer,
      )

      return {
        ...expense,
        buyerName: buyerRoommate
          ? `${buyerRoommate.firstName || ''} ${buyerRoommate.name || ''}`.trim()
          : expense.buyer,
      }
    })

    res.status(200).json(expensesWithNames)
  } catch (error) {
    res.status(404).json({
      message: 'Error fetching group expenses',
      error: error.message,
    })
  }
}

module.exports = {
  createExpense,
  getMyExpenses,
  getExpensesByGroup,
}
