/**
 * File: MyBalance.js
 * Author: Anaïs ASSOGANE (3199628), Léo HUANG (3198494)
 *
 * Contributions:
 * - Anaïs ASSOGANE: Designed and structured the dashboard layout for balance, expenses, and history sections.
 *   Also improved UI elements and color adjustments for better readability (based on Léo’s logic).
 *
 * - Léo HUANG: Implemented the core balance and expense logic, including calculations and data management.
 */
import { useEffect, useMemo, useState } from 'react'

import Loading from './Loading.js'
import MenuBar from './MenuBar'
import './css/MyBalance.css'

const MyBalance = () => {
  const [myBalance, setMyBalance] = useState(0)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    label: '',
    cost: '',
  })

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050'

  useEffect(() => {
    fetchBalanceData()
  }, [])

  const fetchBalanceData = async () => {
    try {
      setLoading(true)
      setError('')

      const [myRes, expenseRes] = await Promise.all([
        fetch(`${API_URL}/balances/me`, {
          credentials: 'include',
        }),
        fetch(`${API_URL}/expenses/apartment`, {
          credentials: 'include',
        }),
      ])

      const myData = await myRes.json()
      const expenseData = await expenseRes.json()

      if (!myRes.ok) {
        setError(myData.message || myData.error || 'Failed to load balance.')
        setMyBalance(0)
      } else {
        setMyBalance(
          Array.isArray(myData)
            ? myData.reduce((sum, item) => sum + Number(item.amount || 0), 0)
            : 0,
        )
      }

      if (!expenseRes.ok) {
        setError(
          (prev) =>
            prev ||
            expenseData.message ||
            expenseData.error ||
            'Failed to load expenses.',
        )
        setExpenses([])
      } else {
        setExpenses(Array.isArray(expenseData) ? expenseData : [])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load balance data.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()

    setMessage('')
    setError('')

    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          label: form.label,
          cost: parseFloat(form.cost),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to add expense.')
        return
      }

      setMessage('Expense added successfully.')
      setForm({
        label: '',
        cost: '',
      })

      fetchBalanceData()
    } catch (err) {
      console.error(err)
      setError('Failed to add expense.')
    }
  }

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0)
      const dateB = new Date(b.createdAt || b.date || 0)
      return dateB - dateA
    })
  }, [expenses])

  const latestExpense = sortedExpenses[0]

  const totalExpenses = sortedExpenses.reduce(
    (sum, expense) => sum + Number(expense.cost || 0),
    0,
  )

  if (loading) return <Loading text="Loading balance..." />

  return (
    <>
      <MenuBar />

      <div className="myBalancePage">
        {message && (
          <div className="balanceMessage successMessage">{message}</div>
        )}

        {error && <div className="balanceMessage errorMessage">{error}</div>}

        <div className="dashboardGrid">
          <div className="dashboardWidget">
            <h2>My Balance</h2>

            <p
              className={myBalance < 0 ? 'negativeBalance' : 'positiveBalance'}
            >
              {myBalance.toFixed(2)}€
            </p>

            <span>
              {myBalance < 0
                ? 'Others owe you money'
                : myBalance > 0
                  ? 'You currently owe money'
                  : 'Your balance is settled'}
            </span>
          </div>

          <div className="dashboardWidget">
            <h2>Total Expenses</h2>

            <p>{totalExpenses.toFixed(2)}€</p>

            <span>
              {sortedExpenses.length} expense
              {sortedExpenses.length !== 1 ? 's' : ''} recorded
            </span>
          </div>

          <div className="dashboardWidget">
            <h2>Latest Expense</h2>

            {latestExpense ? (
              <>
                <p>{latestExpense.label || 'Expense'}</p>

                <span>
                  {Number(latestExpense.cost || 0).toFixed(2)}€
                  {latestExpense.createdAt || latestExpense.date
                    ? ` • ${new Date(
                        latestExpense.createdAt || latestExpense.date,
                      ).toLocaleDateString()}`
                    : ''}
                </span>
              </>
            ) : (
              <>
                <p>No expenses</p>
                <span>Add your first expense</span>
              </>
            )}
          </div>

          <div className="dashboardWidget addExpenseWidget">
            <h2>Add Expense</h2>

            <form className="expenseForm" onSubmit={handleAddExpense}>
              <input
                type="text"
                name="label"
                placeholder="Expense label"
                value={form.label}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                step="0.01"
                name="cost"
                placeholder="Amount"
                value={form.cost}
                onChange={handleChange}
                required
              />

              <button type="submit">Add Expense</button>
            </form>
          </div>

          <div className="dashboardWidget historyWidget">
            <h2>Expense History</h2>

            {sortedExpenses.length === 0 ? (
              <span>No expense history yet</span>
            ) : (
              <div className="expenseHistoryList">
                {sortedExpenses.map((expense, index) => (
                  <div
                    className="expenseHistoryItem"
                    key={expense._id || index}
                  >
                    <div className="expenseHistoryText">
                      <strong>{expense.label || 'Expense'}</strong>

                      <span>
                        {expense.buyerName || expense.buyer || 'Unknown'} •{' '}
                        {expense.createdAt || expense.date
                          ? new Date(
                              expense.createdAt || expense.date,
                            ).toLocaleDateString()
                          : 'No date'}
                      </span>
                    </div>

                    <div className="expenseHistoryAmount">
                      {Number(expense.cost || 0).toFixed(2)}€
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default MyBalance
