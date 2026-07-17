import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CustomerDashboard from './pages/CustomerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/Navbar'

// Base API URL configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://krushnam-live.onrender.com/api'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Load auth from localStorage on boot
    const storedUser = localStorage.getItem('krushnam_user')
    const storedToken = localStorage.getItem('krushnam_token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
  }, [])

  const handleLogin = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('krushnam_user', JSON.stringify(userData))
    localStorage.setItem('krushnam_token', userToken)
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('krushnam_user')
    localStorage.removeItem('krushnam_token')
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar user={user} onLogout={handleLogout} />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route 
              path="/login" 
              element={
                user ? (
                  user.is_staff ? <Navigate to="/admin/dashboard" /> : <Navigate to="/customer/dashboard" />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />
            
            <Route 
              path="/register" 
              element={
                user ? (
                  user.is_staff ? <Navigate to="/admin/dashboard" /> : <Navigate to="/customer/dashboard" />
                ) : (
                  <Register onRegister={handleLogin} />
                )
              } 
            />

            <Route 
              path="/customer/dashboard" 
              element={
                user && !user.is_staff ? (
                  <CustomerDashboard user={user} token={token} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />

            <Route 
              path="/admin/dashboard" 
              element={
                user && user.is_staff ? (
                  <AdminDashboard user={user} token={token} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
