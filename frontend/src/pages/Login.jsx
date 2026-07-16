import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../App'
import { Tv, Phone, Lock, LogIn, AlertCircle } from 'lucide-react'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!phoneNumber || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await axios.post(`${API_URL}/auth/login/`, {
        username: phoneNumber.trim(),
        password: password
      })

      const { user, access } = res.data
      onLogin(user, access)

      // Redirect depending on user type
      if (user.is_staff) {
        navigate('/admin/dashboard')
      } else {
        navigate('/customer/dashboard')
      }
    } catch (err) {
      console.error(err)
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Login failed. Please check your credentials and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>

      <div style={styles.loginCard} className="glass-panel neon-border-cyan">
        <div style={styles.logoHeader}>
          <div style={styles.logoIcon} className="glass-panel">
            <Tv size={26} className="glow-text-cyan" />
          </div>
          <h2 style={styles.logoText}>
            KRUSHNAM<span style={{ color: 'var(--neon-cyan)' }}>LIVE</span>
          </h2>
          <p style={styles.subtitle}>Enter your phone number to access your account</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={styles.inputContainer}>
              <Phone size={18} style={styles.inputIcon} />
              <input 
                type="tel" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                className="form-input" 
                placeholder="e.g. 9313276505"
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={styles.inputContainer}>
              <Lock size={18} style={styles.inputIcon} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="form-input" 
                placeholder="••••••••"
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={styles.submitBtn}>
            {loading ? 'Logging in...' : 'Sign In'}
            <LogIn size={18} />
          </button>
        </form>

        <div style={styles.cardFooter}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            New customer?{' '}
            <Link to="/register" style={styles.footerLink}>
              Register here
            </Link>{' '}
            to view past orders.
          </p>
          <div style={styles.adminHelp}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Admin Users (Dhanveer & Jaimin) can log in here using their registered phone numbers.
            </p>
          </div>
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
    marginTop: '-4rem', // Offset header padding
    zIndex: 1,
  },
  loginCard: {
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
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  footerLink: {
    color: 'var(--neon-cyan)',
    fontWeight: '600',
    textDecoration: 'underline',
  },
  adminHelp: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1rem',
  },
}

export default Login
