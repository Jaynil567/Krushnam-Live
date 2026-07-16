import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Tv, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react'

function Navbar({ user, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleScroll = (id) => {
    setMobileOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLogoutClick = () => {
    onLogout()
    navigate('/')
  }

  return (
    <nav style={styles.navContainer} className="glass-panel">
      <div style={styles.navContent}>
        {/* Logo */}
        <Link to="/" style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <Tv size={22} className="glow-text-cyan" />
          </div>
          <span style={styles.logoText}>
            KRUSHNAM<span style={styles.logoAccent}>LIVE</span>
          </span>
        </Link>

        {/* Navigation Items (Desktop) */}
        <div style={styles.desktopMenu}>
          <button onClick={() => handleScroll('hero')} style={styles.navLink}>Home</button>
          <button onClick={() => handleScroll('services')} style={styles.navLink}>Services</button>
          <button onClick={() => handleScroll('calculator')} style={styles.navLink}>Calculator</button>
          <button onClick={() => handleScroll('gallery')} style={styles.navLink}>Gallery</button>
          <button onClick={() => handleScroll('contact')} style={styles.navLink}>Contact</button>
          
          {user ? (
            <div style={styles.authActions}>
              <Link 
                to={user.is_staff ? "/admin/dashboard" : "/customer/dashboard"} 
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <button 
                onClick={handleLogoutClick} 
                className="btn btn-neon-pink"
                style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="btn btn-neon-pink"
              style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <User size={16} />
              <span>Login / History</span>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button style={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={styles.mobileMenu} className="glass-panel">
          <button onClick={() => handleScroll('hero')} style={styles.mobileNavLink}>Home</button>
          <button onClick={() => handleScroll('services')} style={styles.mobileNavLink}>Services</button>
          <button onClick={() => handleScroll('calculator')} style={styles.mobileNavLink}>Calculator</button>
          <button onClick={() => handleScroll('gallery')} style={styles.mobileNavLink}>Gallery</button>
          <button onClick={() => handleScroll('contact')} style={styles.mobileNavLink}>Contact</button>
          
          {user ? (
            <div style={styles.mobileAuthActions}>
              <Link 
                to={user.is_staff ? "/admin/dashboard" : "/customer/dashboard"} 
                className="btn btn-primary"
                onClick={() => setMobileOpen(false)}
                style={{ width: '100%' }}
              >
                Dashboard
              </Link>
              <button 
                onClick={() => { setMobileOpen(false); handleLogoutClick(); }} 
                className="btn btn-neon-pink"
                style={{ width: '100%' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="btn btn-neon-pink"
              onClick={() => setMobileOpen(false)}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              Login / History
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}

const styles = {
  navContainer: {
    position: 'sticky',
    top: '1rem',
    left: '1.5rem',
    right: '1.5rem',
    margin: '1rem auto 0 auto',
    maxWidth: '1200px',
    borderRadius: '16px',
    zIndex: 100,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    width: 'calc(100% - 3rem)',
  },
  navContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 1.5rem',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  logoIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.4rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontWeight: '800',
    fontSize: '1.3rem',
    letterSpacing: '0.05em',
    color: '#fff',
  },
  logoAccent: {
    color: 'var(--neon-cyan)',
    textShadow: '0 0 10px rgba(0, 242, 254, 0.4)',
  },
  desktopMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navLink: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    transition: 'var(--transition-fast)',
    padding: '0.25rem 0.5rem',
  },
  authActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginLeft: '0.5rem',
  },
  mobileToggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  },
  mobileMenu: {
    position: 'absolute',
    top: '4.5rem',
    left: 0,
    right: 0,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  mobileNavLink: {
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    fontSize: '1.1rem',
    fontWeight: '600',
    textAlign: 'left',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  mobileAuthActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
}

// Add a media query hook or dynamically inject a stylesheet override for display options:
const styleTag = document.createElement('style')
styleTag.innerHTML = `
  @media (max-width: 968px) {
    div[style*="desktopMenu"] {
      display: none !important;
    }
    button[style*="mobileToggle"] {
      display: block !important;
    }
  }
`
document.head.appendChild(styleTag)

export default Navbar
