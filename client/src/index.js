import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Calendar from './components/Calendar.js'
import Dashboard from './components/Dashboard.js'
import DecisionMaking from './components/DecisionMaking.js'
import Leaderboard from './components/Leaderboard'
import Login from './components/Login'
import MyBalance from './components/MyBalance'
import MyProfile from './components/MyProfile'
import NewAccount from './components/NewAccount'
import ResetPassword from './components/ResetPassword'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<NewAccount />} />
      <Route path="/login" element={<Login />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/myprofile" element={<MyProfile />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/DecisionMaking" element={<DecisionMaking />} />
      <Route path="/balance" element={<MyBalance />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  </BrowserRouter>,
)
