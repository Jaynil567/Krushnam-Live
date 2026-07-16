import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../App'
import { Tv, Phone, Calendar, DollarSign, Clock, FileText, User, ChevronRight } from 'lucide-react'

function CustomerDashboard({ user, token, onLogout }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/customer/orders/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setOrders(res.data)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch order history. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchOrders()
    }
  }, [token])

  // Aggregate stats
  const totalOrders = orders.length
  const totalPaid = orders.reduce((sum, o) => sum + parseFloat(o.payment_received), 0)
  const totalAmount = orders.reduce((sum, o) => sum + parseFloat(o.payment_amount), 0)
  const balanceDue = totalAmount - totalPaid

  return (
    <div className="container" style={styles.container}>
      {/* Header Profile Panel */}
      <div style={styles.profileHeader} className="glass-panel neon-border-cyan">
        <div style={styles.profileDetails}>
          <div style={styles.avatar}>
            <User size={30} style={{ color: 'var(--neon-cyan)' }} />
          </div>
          <div>
            <h2 style={styles.welcomeText}>Welcome, {user.name}!</h2>
            <p style={styles.profilePhone}>Phone: {user.username}</p>
          </div>
        </div>
        <button onClick={onLogout} className="btn btn-neon-pink" style={{ padding: '0.5rem 1.25rem' }}>
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statsCard} className="glass-panel">
          <div style={{ ...styles.statsIcon, backgroundColor: 'rgba(0, 242, 254, 0.05)' }}>
            <Tv size={22} style={{ color: 'var(--neon-cyan)' }} />
          </div>
          <div>
            <span style={styles.statsLabel}>Total Bookings</span>
            <h3 style={styles.statsVal}>{totalOrders}</h3>
          </div>
        </div>

        <div style={styles.statsCard} className="glass-panel">
          <div style={{ ...styles.statsIcon, backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
            <DollarSign size={22} style={{ color: '#10b981' }} />
          </div>
          <div>
            <span style={styles.statsLabel}>Total Paid Amount</span>
            <h3 style={{ ...styles.statsVal, color: '#10b981' }}>₹{totalPaid.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div style={styles.statsCard} className="glass-panel">
          <div style={{ ...styles.statsIcon, backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
            <Clock size={22} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <span style={styles.statsLabel}>Remaining Balance</span>
            <h3 style={{ ...styles.statsVal, color: '#ef4444' }}>₹{balanceDue.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div style={styles.ordersSection}>
        <h3 style={styles.sectionTitle}>Your Booking History</h3>

        {loading ? (
          <div className="flex-center" style={{ height: '200px' }}>
            <span className="glow-text-cyan">Fetching order logs...</span>
          </div>
        ) : error ? (
          <div style={styles.errorContainer} className="glass-panel">
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={styles.emptyContainer} className="glass-panel">
            <Tv size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <h4>No bookings found under phone number: {user.username}</h4>
            <p style={{ marginTop: '0.4rem', color: 'var(--text-dim)' }}>
              If you placed orders offline or with different phone numbers, please contact Dhanveer or Jaimin to merge them.
            </p>
          </div>
        ) : (
          <div style={styles.ordersGrid}>
            {orders.map((order) => {
              const balance = order.payment_amount - order.payment_received
              return (
                <div key={order.id} style={styles.orderCard} className="glass-panel">
                  {/* Card Header */}
                  <div style={styles.orderCardHeader}>
                    <div>
                      <span style={styles.orderLabel} className="glow-text-cyan">{order.event_type}</span>
                      <h4 style={styles.orderTitle}>{order.led_size} LED Wall</h4>
                    </div>
                    <span className={`badge ${
                      order.payment_status === 'Paid' ? 'badge-paid' : 
                      order.payment_status === 'Partial' ? 'badge-partial' : 'badge-unpaid'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>

                  {/* Card Info Details */}
                  <div style={styles.orderCardBody}>
                    <div style={styles.detailRow}>
                      <Calendar size={15} style={styles.detailIcon} />
                      <span>Date & Time: {order.event_date} {order.event_time ? `@ ${order.event_time}` : ''}</span>
                    </div>

                    <div style={styles.detailRow}>
                      <DollarSign size={15} style={styles.detailIcon} />
                      <span>
                        Billing: <strong>₹{parseFloat(order.payment_amount).toLocaleString('en-IN')}</strong> 
                        {' '}(Paid: ₹{parseFloat(order.payment_received).toLocaleString('en-IN')})
                      </span>
                    </div>

                    {balance > 0 && (
                      <div style={{ ...styles.detailRow, color: '#ef4444' }}>
                        <Clock size={15} style={{ ...styles.detailIcon, color: '#ef4444' }} />
                        <span>Balance Pending: <strong>₹{balance.toLocaleString('en-IN')}</strong></span>
                      </div>
                    )}

                    {order.description && (
                      <div style={styles.descriptionBox}>
                        <FileText size={14} style={{ color: 'var(--text-dim)', flexShrink: 0, marginTop: '2px' }} />
                        <p style={styles.descriptionText}>{order.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Support Details */}
      <div style={styles.supportContainer} className="glass-panel neon-border-pink">
        <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem' }}>Need to update event details or make payments?</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Please contact our support admins immediately:
        </p>
        <div style={styles.supportContacts}>
          <div style={styles.contactItem}>
            <span>Dhanveer: <strong>9313276505</strong></span>
            <a href="tel:9313276505" className="btn btn-secondary" style={styles.miniCallBtn}>Call</a>
          </div>
          <div style={styles.contactItem}>
            <span>Jaimin Ramani: <strong>9081247935</strong></span>
            <a href="tel:9081247935" className="btn btn-secondary" style={styles.miniCallBtn}>Call</a>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    paddingTop: '3rem',
    paddingBottom: '5rem',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem 2rem',
    borderRadius: '18px',
    marginBottom: '2rem',
    backgroundColor: 'rgba(18, 18, 29, 0.4)',
  },
  profileDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  avatar: {
    padding: '0.5rem',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  welcomeText: {
    fontSize: '1.3rem',
    color: '#fff',
    fontWeight: '700',
  },
  profilePhone: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  statsCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.5rem 1.75rem',
    borderRadius: '16px',
  },
  statsIcon: {
    padding: '0.75rem',
    borderRadius: '12px',
  },
  statsLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statsVal: {
    fontSize: '1.5rem',
    color: '#fff',
    fontWeight: '700',
    marginTop: '0.2rem',
  },
  ordersSection: {
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    color: '#fff',
    marginBottom: '1.5rem',
    fontWeight: '700',
  },
  ordersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  orderCard: {
    padding: '1.75rem',
    borderRadius: '18px',
    backgroundColor: 'rgba(12, 12, 22, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  orderCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  orderTitle: {
    fontSize: '1.2rem',
    color: '#fff',
    fontWeight: '700',
    marginTop: '0.25rem',
  },
  orderCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: '1rem',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  detailIcon: {
    color: 'var(--neon-cyan)',
  },
  descriptionBox: {
    display: 'flex',
    gap: '0.5rem',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.02)',
    marginTop: '0.25rem',
  },
  descriptionText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  errorContainer: {
    padding: '2rem',
    textAlign: 'center',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.15)',
  },
  emptyContainer: {
    padding: '3rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  supportContainer: {
    padding: '2rem',
    borderRadius: '20px',
    backgroundColor: 'rgba(255, 0, 127, 0.015)',
  },
  supportContacts: {
    display: 'flex',
    gap: '2rem',
    marginTop: '1.25rem',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.95rem',
  },
  miniCallBtn: {
    padding: '0.25rem 0.75rem',
    fontSize: '0.8rem',
    borderRadius: '8px',
  },
}

// Media Query Style overrides
const custDashboardStyle = document.createElement('style')
custDashboardStyle.innerHTML = `
  @media (max-width: 968px) {
    div[style*="statsGrid"] {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
    }
    div[style*="ordersGrid"] {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
    }
    div[style*="supportContacts"] {
      flex-direction: column !important;
      gap: 1rem !important;
    }
    div[style*="profileHeader"] {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 1rem !important;
    }
  }
`
document.head.appendChild(custDashboardStyle)

export default CustomerDashboard
