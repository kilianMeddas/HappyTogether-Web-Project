import { Outlet } from 'react-router-dom'

import './App.css'

// Outlet permet d'avoir des pages "filles"
function App() {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default App
