# HappyTogether API

The **HappyTogether** API is a backend solution designed to streamline shared living. It manages expenses, chores, group decisions, and includes a "Leaderboard" system (Drama Tracker) for shared interactions.

---

## 📌 Table of Contents

- [Structure](#structure)
- [API Endpoints](#api-endpoints)
- [💻 Technical Stack](#-technical-stack)
- [Database Schema](#️database-schema)
- [Security](#security)
- [✅ Assignment Requirements Coverage](#-assignment-requirements-coverage)
- [Changes from Assignment 1](#changes-from-assignment-1)
- [Validation](#validation)
- [📄 API Documentation (Swagger)](#-api-documentation-swagger)
- [Getting Started](#getting-started)
- [How to Test the API](#how-to-test-the-api)
- [🌐 Live Demo](#-live-demo)
- [📚 References](#-references)

---

## Structure

### 1. Database Configuration (`/db`)

- `connection.js`: Manages MongoDB connection using environment variables.

### 2. Middleware

- `Auth.js`: Protects routes using signed HTTP-only cookies
- `ValidateUser.js`: Validates registration inputs
- `CheckEmailExists.js`: Prevents duplicate accounts
- `HashPassword.js`: Hashes passwords using bcryptjs

### 3. Controllers (`/controllers`)

- `BalanceController.js`: Calculates debts and balances
- `ExpenseController.js`: Manages expense logic

---

## API Endpoints

### 1. Authentication & Registration

- `POST /registration`
- `POST /login`

### 2. Profile

- `GET /me`
- `GET /myprofile`
- `PUT /myprofile/update`

### 3. Apartments

- `GET /apartments`
- `POST /apartments/create`

### 4. Expenses & Balances

- `POST /expenses`
- `GET /expenses/me`
- `GET /expenses/apartment`
- `GET /balances/me`
- `GET /balances/apartment`

### 5. Calendar & Chores

- `GET /calendar`
- `POST /calendar/add`
- `PUT /calendar/:id`
- `DELETE /calendar/:id`

### 6. Decision Making

- `GET /DecisionMaking`
- `POST /DecisionMaking/create`
- `POST /DecisionMaking/vote`

### 7. Leaderboard (Drama System)

- `GET /leaderboard`
- `POST /leaderboard`
- `DELETE /leaderboard`
- `PATCH /leaderboard/:id/vote`

---

## 💻 Technical Stack

- Node.js
- Express.js
- MongoDB (Native Driver)
- bcryptjs
- cookie-parser

---

## Database Schema

### Collections:

**Roommates**

- `_id`
- `firstName`
- `name`
- `dateBirth`
- `telephone`
- `password` (hashed)
- `_GroupId`

**Apartments**

- `_id`
- `maxPeople`
- `currentPeople`

**Expense**

- `_id`
- `label`
- `cost`
- `buyer`
- `_GroupId`
- `createdAt`

**Chores**

- `_id`
- `title`
- `start`
- `end` (nullable)
- `createBy`
- `completed`

**Leaderboard (dramas)**

- `_id`
- `subject`
- `_GroupId`
- `author`
- `votes (good / neutral / bad)`
- `createdAt`

**DecisionMaking**

- `_id`
- `question`
- `_GroupId`
- `options (text, votes)`
- `voters `
- `currentUserHasVoted`
- `createdAt`

---

## Security

- Authentication is handled using signed HTTP-only cookies
- Protected routes require authentication (`cookieAuth`)
- Sessions are maintained using cookies
- Passwords are hashed using bcryptjs
- Sensitive data is never returned in responses

---

## ✅ Assignment Requirements Coverage

- Users Management: Authentication + profile system
- CRUD: Full CRUD across multiple modules
- Validation: Server-side validation via middleware
- Sessions: Implemented using cookies
- Cookies: Used for authentication and state
- Database: MongoDB with persistent storage
- Deployment: API hosted online

---

## Changes from Assignment 1

- Added full backend API with Express
- Implemented authentication system using cookies
- database

---

## Validation

- All inputs are validated server-side
- Required fields are enforced
- Duplicate emails are prevented
- Errors are returned as structured JSON responses

---

## 📄 API Documentation (Swagger)

The API is fully documented using OpenAPI 3.0.

👉 https://happytogether.onrender.com/api-docs/

---

## Getting Started

```bash
npm install
```

```bash
MONGO_URI=mongodb://guest:HappyTogether@ac-n7jyhcp-shard-00-00.aiuvdfo.mongodb.net:27017,ac-n7jyhcp-shard-00-01.aiuvdfo.mongodb.net:27017,ac-n7jyhcp-shard-00-02.aiuvdfo.mongodb.net:27017/?ssl=true&replicaSet=atlas-ccotin-shard-0&authSource=admin&appName=web-tech-project
```

```bash
npm start
```

---

## How to Test the API

Example:

```json
POST /login
{
  "mail": "test@test.com",
  "password": "123456"
}
```

---

## 🌐 Live Demo

https://happytogether.onrender.com

---

## 📚 References

- MongoDB Node.js Driver
- Express.js
- bcryptjs
- FullCalendar

---

## Advanced Features

- Full OpenAPI (Swagger) documentation
- Modular backend architecture
- Secure cookie-based authentication
- Multi-user system
- Custom Leaderboard (Drama system)
