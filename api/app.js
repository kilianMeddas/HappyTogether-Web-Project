/**
 * File: app.js
 * Authors: Kilian Meddas, Anaïs Assogane, Nathan PRIGENT, Léo HUANG
 */

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')

const app = express()

// Ensure that "secure: true" (for the cookie) work properly
app.set('trust proxy', 1)

const swaggerDocument = YAML.load('./swagger.yaml')

const allowedOrigins = [
  'http://localhost:3000',
  'https://happytogether-website.onrender.com',
  'https://happytogether.onrender.com',
]

// Configuration CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Authorize request without origin like Postman or mobile devices and the listed origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.use(express.json())

app.use(cookieParser('secret_key'))

// DOCUMENTATION ROUTE
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// API ROUTES
const registration = require('./routes/Registration')
const login = require('./routes/Login')
const calendar = require('./routes/Calendar')
const myprofile = require('./routes/Myprofile')
const leaderboard = require('./routes/Leaderboard')
const DecisionMaking = require('./routes/DecisionMaking')
const Apartments = require('./routes/Apartments')
const expenseRoutes = require('./routes/Expense')
const balanceRoutes = require('./routes/Balance')
const me = require('./routes/Me')
const logout = require('./routes/Logout')
const ForgottenPassword = require('./routes/ForgottenPassword')

app.use('/registration', registration)
app.use('/login', login)
app.use('/calendar', calendar)
app.use('/myprofile', myprofile)
app.use('/leaderboard', leaderboard)
app.use('/DecisionMaking', DecisionMaking)
app.use('/apartments', Apartments)
app.use('/expenses', expenseRoutes)
app.use('/balances', balanceRoutes)
app.use('/me', me)
app.use('/logout', logout)
app.use('/auth', ForgottenPassword)

// ERROR HANDLING

// 404 handler
app.use((req, res) => {
  res.redirect(302, '/api-docs')
})

// 500 handler
app.use((err, req, res) => {
  console.error(err.stack)
  res.status(500).json({ error: res.message })
})

module.exports = app
