# HappyTogether Client

The **HappyTogether Client** is the frontend application of the platform.
It provides a modern and interactive interface for managing shared living: expenses, chores, decision-making, profiles, and group interactions.

---

## 📌 Table of Contents

- [📁 Project Structure](#-project-structure)
- [🧩 Main Features](#-main-features)
- [⚙️ Technical Stack](#️-technical-stack)
- [🔗 Backend Integration](#-backend-integration)
- [🎨 UI/UX Overview](#-uiux-overview)
- [🚀 Getting Started](#-getting-started)
- [🔗 Render URL](#-render-url)
- [📄 Pages Overview](#-pages-overview)
- [🔒 Authentication Flow](#-authentication-flow)
- [📚 References](#-references)

---


## 📁 Project Structure

```
/src
 ├── components
 │   ├── Dashboard.js
 │   ├── Calendar.js
 │   ├── MyProfile.js
 │   ├── Login.js
 │   ├── NewAccount.js
 │   ├── DecisionMaking.js
 │   ├── MyBalance.js
 │   ├── EventModal.js
 │   ├── Leaderboard.js
 │   └── MenuBar.js
 │
 ├── css
 │   ├── Dashboard.css
 │   ├── CalendarPage.css
 │   ├── MyProfile.css
 │   ├── SignPage.module.css
 │   ├── SubmitPage.module.css
 │   ├── Leaderboard.module.css
 │   ├── MenuBar.css
 │   ├── MyBalance.css
 │   └── DecisionMaking.module.css
 │
 ├── index.js
 └── App.js
```

---

## 🧩 Main Features

### 📊 Dashboard

- Overview of application activity
- Improved card-based UI (lightly enhanced design)
- Central navigation hub

### 📅 Calendar

- Task management system
- Add / delete / complete tasks
- Info modal + improved UI buttons

### 🧠 Decision Making

- Voting system for apartment decisions
- Two views:
  - Card view (default)
  - Table view

- Real-time voting interactions

### 💰 My Balance

- Expense tracking
- Balance calculation per user
- Expense history

### 👤 Profile

- Editable user profile
- Password change system
- Roommates display at same level (reduced scrolling)
- Updated color theme (orange → soft blue/purple)

### 🔐 Authentication

- Login / Sign-up system
- Session-based authentication (cookies)

---

## ⚙️ Technical Stack

- React.js
- React Router
- CSS Modules + global CSS
- FullCalendar
- Fetch API
- Environment variables (.env)

---

## 🔗 Backend Integration

The frontend communicates with the backend via REST API:

- Authentication: `/login`, `/registration`
- Profile: `/myprofile`
- Calendar: `/calendar`
- Expenses: `/expenses`, `/balances`
- Decision Making: `/DecisionMaking`
- Apartments: `/apartments`

All requests use:

```js
credentials: 'include'
```

---

## 🎨 UI/UX Overview

- Responsive layout
- Improved readability across all pages
- Consistent design system
- Color refinements for accessibility (softer tones)
- Reduced scrolling on profile page
- Dual view system (cards + tables where needed)

---

## 🚀 Getting Started

```bash
npm install
```

```bash
npm start
```

### Environment variable

```bash
REACT_APP_API_URL=http://localhost:5050
```

---

## 🔗 Render URL

To acces the project online, please use : **https://happytogether-website.onrender.com**

Don't forget to turn on the server here : **https://happytogether.onrender.com** (can take some time)

## 📄 Pages Overview

- `/` → Login
- `/registration` → Sign up
- `/dashboard` → Main dashboard
- `/calendar` → Task calendar
- `/decision` → Voting system
- `/balance` → Expenses & balance
- `/profile` → User profile

---

## 🔒 Authentication Flow

- User logs in → server returns session cookie
- Cookie stored automatically in browser
- All protected routes use:
  - `credentials: "include"`

- Logout clears session server-side

---

## 📚 References

- React Documentation
- FullCalendar Docs
- MDN Web Docs
- Fetch API Specification

---

## Advanced Features

- Card/Table view switching system
- Modular component-based architecture
- Session-based authentication
- Real-time UI updates after API calls
- Fully responsive multi-page SPA
