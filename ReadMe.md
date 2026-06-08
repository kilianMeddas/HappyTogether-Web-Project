# 🏠 HappyTogether – Roommate Management System

**HappyTogether** is a full-stack web application designed to simplify shared living.
It allows roommates to manage **expenses, chores, decisions, and interactions** in one centralized platform.

---

## 📌 Table of Contents

- [Project Overview](#️project-overview)
- [Technical Stack](#️technical-stack)
- [📁 Project Structure](#-project-structure)
- [Features](#features)
- [🔗 API Endpoints](#-api-endpoints)
- [Authentication & Security](#authentication--security)
- [🗄️ Database Schema](#️-database-schema)
- [Email System (Mailtrap)](#email-system-mailtrap)
- [🚀 Getting Started](#-getting-started)
- [How to Test](#how-to-test)
- [Live Demo](#live-demo)
- [API Documentation](#api-documentation)
- [📚 References](#-references)

---

## Project overview

HappyTogether is composed of:

- **Backend API** (Node.js + Express)
- **Frontend Client** (React)
- **Email System** (Mailtrap sandbox for testing emails)

It supports:

- Expense tracking
- Task management
- Group decisions
- Social interactions (Drama Tracker)

---

## Technical stack

### Backend

- Node.js
- Express.js
- MongoDB (Native Driver)
- bcryptjs
- cookie-parser

### Frontend

- React.js
- React Router
- CSS Modules
- FullCalendar
- Fetch API

### Tools

- Mailtrap (Email testing)
- Render (Deployment)

---

## 📁 Project structure

```
/backend (api)
 ├── controllers
 ├── middleware
 ├── db
 ├── routes

/frontend (client)
 ├── src/components
 ├── src/css
 ├── App.js
 ├── index.js
```

---

## Features

### 🔐 Authentication

- Login / Registration
- Session-based authentication (cookies)
- Secure password hashing

### 👤 Profile

- Edit user info
- Change password
- View roommates

### 💰 Expenses & Balance

- Add expenses
- Track debts
- View balances per apartment

### 📅 Calendar & Chores

- Task management
- Add / update / delete tasks
- Completion tracking

### 🧠 Decision Making

- Create votes
- Vote on options
- Card & table views

### 🎭 Leaderboard (Drama Tracker)

- Post interactions
- Vote (good / neutral / bad)
- Community ranking

---

## API Endpoints

### Authentication

- `POST /registration`
- `POST /login`

### Profile

- `GET /me`
- `PUT /myprofile/update`

### Apartments

- `GET /apartments`
- `POST /apartments/create`

### Expenses

- `POST /expenses`
- `GET /expenses/me`
- `GET /balances/apartment`

### Calendar

- `GET /calendar`
- `POST /calendar/add`
- `PUT /calendar/:id`
- `DELETE /calendar/:id`

### Decision Making

- `GET /DecisionMaking`
- `POST /DecisionMaking/create`
- `POST /DecisionMaking/vote`

### Leaderboard

- `GET /leaderboard`
- `POST /leaderboard`
- `PATCH /leaderboard/:id/vote`

---

## Authentication & security

- HTTP-only signed cookies
- Protected routes via middleware
- Password hashing with bcrypt
- No sensitive data returned in responses

---

## Database schema

### Collections:

**Roommates**

- firstName, name, email, password (hashed), groupId

**Apartments**

- maxPeople, currentPeople

**Expenses**

- label, cost, buyer, groupId, createdAt

**Chores**

- title, start, end, completed

**Leaderboard**

- subject, votes, author, createdAt

**DecisionMaking**

- question, options, votes, voters

---

## Email system (Mailtrap)

⚠️ This part is for the localhost part, I'm using **free** Render and **free** Mailtrap so I can't add new users.
However, if you want to test directly in Render, you can follow the Setup and email **kilian.meddas@student.griffith.ie** the different prerequise (see below) so I can change the .env in Render.

Used to simulate email sending (password reset).

### Setup

1. Go to [https://mailtrap.io/](https://mailtrap.io/)
2. Select **Node.js**
3. Open **Email Sandbox → My Sandbox**
4. Go to **SMTP**
5. Copy credentials

### Environment Variables (in api/.env)

```env
MAIL_USER=your_username
MAIL_PASS=your_password
MAIL_PORT=2525
```

---

## 🚀 Getting Started

### 1. Clone the project

```bash
git clone https://github.com/IA-Institut-Group-Project/HappyTogether
```

---

### 2. Backend Setup

```bash
cd api
npm install
```

Create `.env`:

```env
MONGO_URI=your_mongo_uri
MAIL_USER=your_mailtrap_user
MAIL_PASS=your_mailtrap_pass
MAIL_PORT=2525
```

Run backend:

```bash
npm start
```

---

### 3. Frontend Setup

```bash
cd client
npm install
```

Create `.env`:

```env
REACT_APP_API_URL=http://localhost:5050
```

Run frontend:

```bash
npm start
```

---

## 🌐 Live Demo

- Frontend: [https://happytogether-website.onrender.com](https://happytogether-website.onrender.com)
- Backend: [https://happytogether.onrender.com](https://happytogether.onrender.com)

⚠️ The backend may take time to start (cold start on Render)

---

## API Documentation

Swagger documentation (local and "production"):

👉 [https://happytogether.onrender.com/api-docs/](https://happytogether.onrender.com/api-docs/)

---

## 📚 References

- MongoDB Documentation
- Express.js
- React Docs
- FullCalendar
- MDN Web Docs

---

## Advanced Features

- Full OpenAPI (Swagger) documentation
- Modular architecture (frontend & backend)
- Secure cookie-based authentication
- Real-time UI updates
- Responsive SPA
- Email simulation with Mailtrap
