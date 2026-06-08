/**
 * File: BalanceController.js
 * Author: Léo HUANG (3198494)
 */

const { getDB } = require('../db/Connection')

const roundToTwo = (num) => Math.round(num * 100) / 100

const getBalancesByGroup = async (req, res) => {
  try {
    const db = getDB()
    const userEmail = req.user

    const user = await db.collection('Roommates').findOne({ _id: userEmail })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const roommates = await db
      .collection('Roommates')
      .find({ _GroupId: user._GroupId })
      .toArray()

    if (!roommates.length) {
      return res.status(200).json([])
    }

    const expenses = await db
      .collection('Expense')
      .find({ _GroupId: user._GroupId })
      .sort({ createdAt: -1 })
      .toArray()

    const roommateCount = roommates.length

    const balances = roommates.map((roommate) => {
      let total = 0

      for (const expense of expenses) {
        const cost = Number(expense.cost || 0)
        const share = roommateCount > 0 ? cost / roommateCount : 0

        if (expense.buyer === roommate._id) {
          total -= cost - share
        } else {
          total += share
        }
      }

      return {
        user: roommate._id,
        _GroupId: user._GroupId,
        amount: roundToTwo(total),
      }
    })

    res.status(200).json(balances)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch balances',
      error: error.message,
    })
  }
}

const getMyBalances = async (req, res) => {
  try {
    const db = getDB()
    const userEmail = req.user

    const user = await db.collection('Roommates').findOne({
      _id: userEmail,
    })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const roommates = await db
      .collection('Roommates')
      .find({ _GroupId: user._GroupId })
      .toArray()

    if (!roommates.length) {
      return res.status(200).json([])
    }

    const expenses = await db
      .collection('Expense')
      .find({ _GroupId: user._GroupId })
      .sort({ createdAt: -1 })
      .toArray()

    const roommateCount = roommates.length

    let myTotal = 0

    for (const expense of expenses) {
      const cost = Number(expense.cost || 0)
      const share = roommateCount > 0 ? cost / roommateCount : 0

      if (expense.buyer === userEmail) {
        // others owe you money -> negative
        myTotal -= cost - share
      } else {
        // you owe your share -> positive
        myTotal += share
      }
    }

    res.status(200).json([
      {
        user: userEmail,
        _GroupId: user._GroupId,
        amount: roundToTwo(myTotal),
      },
    ])
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch my balances',
      error: error.message,
    })
  }
}

module.exports = {
  getBalancesByGroup,
  getMyBalances,
}
