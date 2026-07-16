import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../App'
import { Tv, User, Phone, Lock, Mail, UserPlus, AlertCircle } from 'lucide-react'

function Register({ onRegister }) {
  const navigate = useNavigate()
  
  // Input fields
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !phoneNumber || !password) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Submit registration request
      await axios.post(`${API_URL}/auth/register/`, {
        name: name.trim(),
        phone_number: phoneNumber.trim(),
        email: email.trim(),
        password: password
      })

      setSuccessMsg('Registration successful! Logging you in...')

      // 2. Automate login for frictionless UX
      const loginRes = await axios.post(`${API_URL}/auth/login/`, {
        username: phoneNumber.trim(),
        password: password
      })

      const { user, access } = loginRes.data
      
      // Delay navigation slightly so they read the success message
      setTimeout(() => {
        onRegister(user, access)
        navigate('/customer/dashboard')
      }, 1000)

    } catch (err) {
      console.error(err)
      if (err.response && err.response.data) {
        // Handle serialization errors
        const errorData = err.response.data
        if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0]
          const errVal = errorData[firstKey]
          if (Array.isArray(errVal)) {
            setError(`${firstKey.toUpperCase()}: ${errVal[0]}`)
          } else {
            setError(JSON.stringify(errorData))
          }
        } else {
          setError('Registration failed. Try again.')
        }
      } else {
        setError('Connection failed. Please check internet connections.')
      }
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>

      <div style={styles.registerCard} className="glass-panel neon-border-cyan">
        <div style={styles.logoHeader}>
          <div style={styles.logoIcon} className="glass-panel">
            <Tv size={26} className="glow-text-cyan" />
          </div>
          <h2 style={styles.logoText}>
            KRUSHNAM<span style={{ color: 'var(--neon-cyan)' }}>LIVE</span>
          </h2>
          <p style={styles.subtitle}>Register to show your order history instantly</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={styles.successAlert}>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={styles.inputContainer}>
              <User size={18} style={styles.inputIcon} />
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="form-input" 
                placeholder="Enter your full name" 
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <div style={styles.inputContainer}>
              <Phone size={18} style={styles.inputIcon} />
              <input 
                type="tel" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                className="form-input" 
                placeholder="Enter phone number" 
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Optional)</label>
            <div style={styles.inputContainer}>
              <Mail size={18} style={styles.inputIcon} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="form-input" 
                placeholder="Enter email address" 
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={styles.inputContainer}>
              <Lock size={18} style={styles.inputIcon} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="form-input" 
                placeholder="Minimum 6 characters" 
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={styles.submitBtn}>
            {loading ? 'Creating Account...' : 'Register'}
            <UserPlus size={18} />
          </button>
        </form>

        <div style={styles.cardFooter}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={styles.footerLink}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
    position: 'relative',
    marginTop: '-4rem',
    zIndex: 1,
  },
  registerCard: {
    width: '100%',
    maxWidth: '430px',
    padding: '2.5rem',
    borderRadius: '24px',
    backgroundColor: 'rgba(12, 12, 22, 0.85)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  },
  logoHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  logoIcon: {
    padding: '0.65rem',
    borderRadius: '12px',
    marginBottom: '0.75rem',
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontWeight: '800',
    fontSize: '1.6rem',
    color: '#fff',
    letterSpacing: '0.05em',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '0.4rem',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#ef4444',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
  },
  successAlert: {
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-dim)',
  },
  submitBtn: {
    width: '100%',
    marginTop: '0.75rem',
  },
  cardFooter: {
    marginTop: '2rem',
    textAlign: 'center',
  },
  footerLink: {
    color: 'var(--neon-cyan)',
    fontWeight: '600',
    textDecoration: 'underline',
  },
}

export default Register
