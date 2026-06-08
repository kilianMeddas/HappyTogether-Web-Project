/**
 * File: Connection.js
 * Author: Kilian Meddas (3198575)
 */

require('dotenv').config() // Load the .env
var { MongoClient } = require('mongodb')

var uri = process.env.MONGO_URI
var client = new MongoClient(uri)
var dbName = 'HappyTogether'
var db

async function connectDB() {
  try {
    await client.connect()
    db = client.db(dbName)
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection error:', err)
  }
}

module.exports = { connectDB, getDB: () => db }
