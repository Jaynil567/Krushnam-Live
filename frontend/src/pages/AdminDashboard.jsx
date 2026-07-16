import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../App'
import { 
  LayoutDashboard, Tv, Calendar, FileText, Search, PlusCircle, Check, 
  Trash2, X, AlertCircle, Edit, DollarSign, Users, Mail, Image, Upload
} from 'lucide-react'

function AdminDashboard({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview') // overview, bookings, new_booking, gallery
  
  // Dashboard statistics
  const [stats, setStats] = useState({
    total_orders: 0,
    total_revenue: 0,
    total_received: 0,
    total_pending: 0,
    pending_inquiries: 0,
    unpaid_orders_count: 0
  })

  // Data lists
  const [orders, setOrders] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [galleryItems, setGalleryItems] = useState([])
  
  // Loading states
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingInquiries, setLoadingInquiries] = useState(true)
  const [loadingGallery, setLoadingGallery] = useState(true)

  // Filters & Search
  const [orderSearch, setOrderSearch] = useState('')
  const [orderFilterStatus, setOrderFilterStatus] = useState('')

  // Create Order state
  const [custPhone, setCustPhone] = useState('')
  const [custName, setCustName] = useState('')
  const [ledSize, setLedSize] = useState('12x8 ft')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [eventType, setEventType] = useState('Wedding')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentReceived, setPaymentReceived] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('Unpaid')
  const [orderDesc, setOrderDesc] = useState('')
  const [orderFormStatus, setOrderFormStatus] = useState({ type: '', msg: '' })
  
  // Lookup state
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupMessage, setLookupMessage] = useState('')

  // Edit Order state
  const [editingOrder, setEditingOrder] = useState(null)
  
  // Gallery upload state
  const [galleryTitle, setGalleryTitle] = useState('')
  const [galleryFile, setGalleryFile] = useState(null)
  const [galleryUploadStatus, setGalleryUploadStatus] = useState({ type: '', msg: '' })
  const [uploadingGallery, setUploadingGallery] = useState(false)

  // Fetch metrics & core stats
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/stats/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data)
    } catch (err) {
      console.error("Stats fetching failed", err)
    } finally {
      setLoadingStats(false)
    }
  }

  // Fetch orders
  const fetchOrders = async () => {
    try {
      let url = `${API_URL}/admin/orders/`
      const params = []
      if (orderSearch) params.push(`search=${orderSearch}`)
      if (orderFilterStatus) params.push(`payment_status=${orderFilterStatus}`)
      if (params.length > 0) url += `?${params.join('&')}`

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingOrders(false)
    }
  }

  // Fetch inquiries
  const fetchInquiries = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/inquiries/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setInquiries(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingInquiries(false)
    }
  }

  // Fetch gallery list
  const fetchGallery = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/gallery/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGalleryItems(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingGallery(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchStats()
      fetchOrders()
      fetchInquiries()
      fetchGallery()
    }
  }, [token, activeTab])

  // Trigger search on filter changes
  useEffect(() => {
    fetchOrders()
  }, [orderSearch, orderFilterStatus])

  // Custom customer lookup when phone number input changes
  const handlePhoneLookup = async (phone) => {
    setCustPhone(phone)
    if (phone.length >= 10) {
      setLookupLoading(true)
      setLookupMessage('')
      try {
        const res = await axios.get(`${API_URL}/admin/lookup/?phone=${phone}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.found) {
          setCustName(res.data.name)
          setLookupMessage('Existing client found! Details auto-filled.')
        } else {
          setLookupMessage('New client. Enter details manually.')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLookupLoading(false)
      }
    } else {
      setLookupMessage('')
    }
  }

  // Handle inquiry status update (Pending -> Contacted)
  const handleContactedInquiry = async (inqId) => {
    try {
      await axios.patch(`${API_URL}/admin/inquiries/${inqId}/`, {
        status: 'Contacted'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchInquiries()
      fetchStats()
    } catch (err) {
      console.error(err)
    }
  }

  // Convert Inquiry details directly to a new order
  const handleConvertInquiryToOrder = (inq) => {
    setCustPhone(inq.phone)
    setCustName(inq.name)
    setLedSize('12x8 ft')
    if (inq.event_date) setEventDate(inq.event_date)
    setOrderDesc(`Inquiry details: ${inq.requirements}`)
    setActiveTab('new_booking')
  }

  // Create Order Submission handler
  const handleCreateOrder = async (e) => {
    e.preventDefault()
    if (!custPhone || !custName || !eventDate || !paymentAmount) {
      setOrderFormStatus({ type: 'error', msg: 'Please fill in Name, Phone, Date, and Total Amount' })
      return
    }

    setOrderFormStatus({ type: '', msg: '' })
    
    // Auto-calculate payment status if not explicitly overridden
    let resolvedStatus = paymentStatus
    const paidAmount = parseFloat(paymentReceived || 0)
    const totalAmount = parseFloat(paymentAmount)

    if (paidAmount === 0) resolvedStatus = 'Unpaid'
    else if (paidAmount >= totalAmount) resolvedStatus = 'Paid'
    else resolvedStatus = 'Partial'

    try {
      await axios.post(`${API_URL}/admin/orders/`, {
        customer_phone: custPhone,
        customer_name: custName,
        led_size: ledSize,
        payment_amount: totalAmount,
        payment_received: paidAmount,
        payment_status: resolvedStatus,
        event_date: eventDate,
        event_time: eventTime || null,
        event_type: eventType,
        description: orderDesc
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setOrderFormStatus({ type: 'success', msg: 'Booking order placed successfully!' })
      // Clear forms
      setCustPhone('')
      setCustName('')
      setLedSize('12x8 ft')
      setEventDate('')
      setEventTime('')
      setEventType('Wedding')
      setPaymentAmount('')
      setPaymentReceived('')
      setPaymentStatus('Unpaid')
      setOrderDesc('')
      setLookupMessage('')
      fetchStats()
    } catch (err) {
      console.error(err)
      setOrderFormStatus({ type: 'error', msg: 'Failed to place booking. Try again.' })
    }
  }

  // Update order (from Edit Modal)
  const handleUpdateOrder = async (e) => {
    e.preventDefault()
    try {
      let resolvedStatus = editingOrder.payment_status
      const paidAmount = parseFloat(editingOrder.payment_received || 0)
      const totalAmount = parseFloat(editingOrder.payment_amount)

      if (paidAmount === 0) resolvedStatus = 'Unpaid'
      else if (paidAmount >= totalAmount) resolvedStatus = 'Paid'
      else resolvedStatus = 'Partial'

      await axios.put(`${API_URL}/admin/orders/${editingOrder.id}/`, {
        ...editingOrder,
        payment_status: resolvedStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setEditingOrder(null)
      fetchOrders()
      fetchStats()
    } catch (err) {
      console.error(err)
      alert("Failed to update order details")
    }
  }

  // Delete booking order
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to permanently delete this order?")) {
      try {
        await axios.delete(`${API_URL}/admin/orders/${orderId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchOrders()
        fetchStats()
      } catch (err) {
        console.error(err)
      }
    }
  }

  // Gallery file uploading handler
  const handleGalleryUpload = async (e) => {
    e.preventDefault()
    if (!galleryFile) {
      setGalleryUploadStatus({ type: 'error', msg: 'Please select an image file to upload.' })
      return
    }

    setUploadingGallery(true)
    setGalleryUploadStatus({ type: '', msg: '' })

    const formData = new FormData()
    formData.append('title', galleryTitle)
    formData.append('image', galleryFile)

    try {
      await axios.post(`${API_URL}/admin/gallery/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      setGalleryUploadStatus({ type: 'success', msg: 'Image uploaded successfully to gallery!' })
      setGalleryTitle('')
      setGalleryFile(null)
      // Reset input element
      document.getElementById('galleryFileInput').value = ''
      fetchGallery()
    } catch (err) {
      console.error(err)
      setGalleryUploadStatus({ type: 'error', msg: 'Upload failed. Check file dimensions or size settings.' })
    } finally {
      setUploadingGallery(false)
    }
  }

  // Delete gallery item
  const handleDeleteGalleryItem = async (itemId) => {
    if (window.confirm("Delete this photo from gallery?")) {
      try {
        await axios.delete(`${API_URL}/admin/gallery/${itemId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchGallery()
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <div className="dashboard-grid">
      {/* Sidebar Controls */}
      <aside style={styles.sidebar} className="glass-panel">
        <div style={styles.sidebarHeader}>
          <LayoutDashboard size={20} className="glow-text-cyan" />
          <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: '700' }}>Admin Controls</h3>
        </div>
        <p style={styles.adminRoleText}>Logged: {user.name}</p>

        <nav style={styles.sidebarNav}>
          <button 
            onClick={() => setActiveTab('overview')} 
            style={{ ...styles.sidebarBtn, ...(activeTab === 'overview' ? styles.sidebarBtnActive : {}) }}
          >
            Dashboard Stats
          </button>
          <button 
            onClick={() => setActiveTab('bookings')} 
            style={{ ...styles.sidebarBtn, ...(activeTab === 'bookings' ? styles.sidebarBtnActive : {}) }}
          >
            Manage Bookings
          </button>
          <button 
            onClick={() => setActiveTab('new_booking')} 
            style={{ ...styles.sidebarBtn, ...(activeTab === 'new_booking' ? styles.sidebarBtnActive : {}) }}
          >
            Create New Booking
          </button>
          <button 
            onClick={() => setActiveTab('gallery')} 
            style={{ ...styles.sidebarBtn, ...(activeTab === 'gallery' ? styles.sidebarBtnActive : {}) }}
          >
            Gallery Portfolio
          </button>
        </nav>

        <button onClick={onLogout} className="btn btn-neon-pink" style={styles.logoutBtn}>
          Exit Admin Mode
        </button>
      </aside>

      {/* Main Panel Content Area */}
      <main style={styles.mainContent}>
        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={styles.tabTitle}>Dashboard Metrics</h2>
            
            {/* Top Cards Grid */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricCard} className="glass-panel">
                <DollarSign size={24} style={{ color: '#10b981' }} />
                <div>
                  <span style={styles.metricLabel}>Total Revenue</span>
                  <h4 style={styles.metricVal}>₹{stats.total_revenue.toLocaleString('en-IN')}</h4>
                </div>
              </div>

              <div style={styles.metricCard} className="glass-panel">
                <Check size={24} style={{ color: 'var(--neon-cyan)' }} />
                <div>
                  <span style={styles.metricLabel}>Payments Received</span>
                  <h4 style={{ ...styles.metricVal, color: 'var(--neon-cyan)' }}>₹{stats.total_received.toLocaleString('en-IN')}</h4>
                </div>
              </div>

              <div style={styles.metricCard} className="glass-panel">
                <AlertCircle size={24} style={{ color: '#ef4444' }} />
                <div>
                  <span style={styles.metricLabel}>Pending Balance</span>
                  <h4 style={{ ...styles.metricVal, color: '#ef4444' }}>₹{stats.total_pending.toLocaleString('en-IN')}</h4>
                </div>
              </div>

              <div style={styles.metricCard} className="glass-panel">
                <Users size={24} style={{ color: 'var(--neon-purple)' }} />
                <div>
                  <span style={styles.metricLabel}>Total Events</span>
                  <h4 style={styles.metricVal}>{stats.total_orders}</h4>
                </div>
              </div>
            </div>

            {/* Inquiries Inbox Section */}
            <div style={styles.inboxSection}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Customer Inquiries Inbox</h3>
                <span className="badge badge-unpaid">{stats.pending_inquiries} Unread / Pending</span>
              </div>

              {loadingInquiries ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading inquiries data...</p>
              ) : inquiries.length === 0 ? (
                <div style={styles.emptyInbox} className="glass-panel">
                  <Mail size={32} style={{ color: 'var(--text-dim)', marginBottom: '0.5rem' }} />
                  <p>Inbox is empty. No new inquiries submitted.</p>
                </div>
              ) : (
                <div style={styles.inquiriesList}>
                  {inquiries.map((inq) => (
                    <div key={inq.id} style={styles.inquiryCard} className={`glass-panel ${inq.status === 'Pending' ? 'neon-border-cyan' : ''}`}>
                      <div style={styles.inquiryCardHeader}>
                        <div>
                          <h4 style={styles.inquiryClientName}>{inq.name}</h4>
                          <p style={styles.inquiryClientPhone}>Phone: {inq.phone} {inq.email ? `| Email: ${inq.email}` : ''}</p>
                        </div>
                        <span className={`badge ${inq.status === 'Pending' ? 'badge-unpaid' : 'badge-paid'}`}>
                          {inq.status}
                        </span>
                      </div>

                      <p style={styles.inquiryDetailsText}><strong>Requirements:</strong> {inq.requirements}</p>

                      <div style={styles.inquiryActions}>
                        {inq.event_date && (
                          <span style={styles.inquiryEventDate}>Event target date: {inq.event_date}</span>
                        )}
                        <div style={styles.inquiryActionButtons}>
                          {inq.status === 'Pending' && (
                            <button onClick={() => handleContactedInquiry(inq.id)} className="btn btn-secondary" style={styles.actionBtn}>
                              Mark Contacted
                            </button>
                          )}
                          <button onClick={() => handleConvertInquiryToOrder(inq)} className="btn btn-primary" style={styles.actionBtn}>
                            Place Order
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE BOOKINGS */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={styles.tabTitle}>Manage Booking Records</h2>
            
            {/* Search & Filter Controls */}
            <div style={styles.filterRow}>
              <div style={styles.searchBar}>
                <Search size={16} style={styles.searchIcon} />
                <input 
                  type="text" 
                  value={orderSearch} 
                  onChange={(e) => setOrderSearch(e.target.value)} 
                  className="form-input" 
                  placeholder="Search name, phone, event type..."
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <select 
                value={orderFilterStatus} 
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="form-input"
                style={styles.filterDropdown}
              >
                <option value="">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            {/* Orders Table */}
            {loadingOrders ? (
              <p>Fetching bookings database...</p>
            ) : orders.length === 0 ? (
              <div style={styles.emptyInbox} className="glass-panel">
                <p>No orders found matching filters.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Customer Details</th>
                      <th>Event Specs</th>
                      <th>Scheduled Date</th>
                      <th>Total Billing</th>
                      <th>Paid / Bal</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => {
                      const balance = ord.payment_amount - ord.payment_received
                      return (
                        <tr key={ord.id}>
                          <td>
                            <strong>{ord.customer_name}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ord.customer_phone}</div>
                          </td>
                          <td>
                            <strong>{ord.led_size}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ord.event_type}</div>
                          </td>
                          <td>
                            <div>{ord.event_date}</div>
                            {ord.event_time && <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{ord.event_time}</div>}
                          </td>
                          <td>₹{parseFloat(ord.payment_amount).toLocaleString('en-IN')}</td>
                          <td>
                            <div>₹{parseFloat(ord.payment_received).toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: '0.8rem', color: balance > 0 ? '#ef4444' : '#10b981' }}>
                              Bal: ₹{balance.toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              ord.payment_status === 'Paid' ? 'badge-paid' : 
                              ord.payment_status === 'Partial' ? 'badge-partial' : 'badge-unpaid'
                            }`}>
                              {ord.payment_status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={styles.tableActions}>
                              <button onClick={() => setEditingOrder(ord)} style={styles.iconBtn} title="Edit booking details">
                                <Edit size={16} style={{ color: 'var(--neon-cyan)' }} />
                              </button>
                              <button onClick={() => handleDeleteOrder(ord.id)} style={styles.iconBtn} title="Delete booking">
                                <Trash2 size={16} style={{ color: '#ef4444' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATE NEW BOOKING */}
        {activeTab === 'new_booking' && (
          <div style={styles.newBookingContainer}>
            <h2 style={styles.tabTitle}>Place New LED Order</h2>

            <div style={styles.newBookingGrid}>
              {/* Form panel */}
              <div className="glass-panel neon-border-cyan" style={styles.formPanel}>
                {orderFormStatus.msg && (
                  <div style={{
                    ...styles.inquiryAlert,
                    backgroundColor: orderFormStatus.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: orderFormStatus.type === 'success' ? '#10b981' : '#ef4444',
                    borderColor: orderFormStatus.type === 'success' ? '#10b981' : '#ef4444',
                  }}>
                    {orderFormStatus.msg}
                  </div>
                )}

                <form onSubmit={handleCreateOrder}>
                  <div className="form-row" style={styles.formRow}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Phone Number *</label>
                      <input 
                        type="tel" 
                        value={custPhone} 
                        onChange={(e) => handlePhoneLookup(e.target.value)} 
                        className="form-input" 
                        placeholder="e.g. 9313276505"
                        required
                      />
                      {lookupLoading && <span style={styles.helperText}>Searching profiles...</span>}
                      {lookupMessage && (
                        <span style={{ 
                          ...styles.helperText, 
                          color: lookupMessage.includes('found') ? '#10b981' : 'var(--neon-cyan)' 
                        }}>
                          {lookupMessage}
                        </span>
                      )}
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Customer Name *</label>
                      <input 
                        type="text" 
                        value={custName} 
                        onChange={(e) => setCustName(e.target.value)} 
                        className="form-input" 
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row" style={styles.formRow}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">LED size *</label>
                      <input 
                        type="text" 
                        value={ledSize} 
                        onChange={(e) => setLedSize(e.target.value)} 
                        className="form-input" 
                        placeholder="e.g. 12x8 ft, 16x9 ft"
                        required
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Event Type *</label>
                      <input 
                        type="text" 
                        value={eventType} 
                        onChange={(e) => setEventType(e.target.value)} 
                        className="form-input" 
                        placeholder="e.g. Wedding, Live Stream, Concert"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row" style={styles.formRow}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Event Date *</label>
                      <input 
                        type="date" 
                        value={eventDate} 
                        onChange={(e) => setEventDate(e.target.value)} 
                        className="form-input" 
                        style={{ colorScheme: 'dark' }}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Event Time (Optional)</label>
                      <input 
                        type="time" 
                        value={eventTime} 
                        onChange={(e) => setEventTime(e.target.value)} 
                        className="form-input" 
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>

                  <div className="form-row" style={styles.formRow}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Total Amount (₹) *</label>
                      <input 
                        type="number" 
                        value={paymentAmount} 
                        onChange={(e) => setPaymentAmount(e.target.value)} 
                        className="form-input" 
                        placeholder="Enter total amount"
                        required
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Payment Received (₹)</label>
                      <input 
                        type="number" 
                        value={paymentReceived} 
                        onChange={(e) => setPaymentReceived(e.target.value)} 
                        className="form-input" 
                        placeholder="Enter amount received"
                      />
                    </div>
                  </div>

                  {paymentAmount && (
                    <div style={styles.balanceCalculationBanner} className="glass-panel">
                      <span>Remaining Balance: </span>
                      <strong style={{ color: (paymentAmount - (paymentReceived || 0)) > 0 ? '#ef4444' : '#10b981' }}>
                        ₹{(paymentAmount - (paymentReceived || 0)).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Description / Extra Details</label>
                    <textarea 
                      value={orderDesc} 
                      onChange={(e) => setOrderDesc(e.target.value)} 
                      className="form-input" 
                      rows="4" 
                      placeholder="Enter setup coordinates, backup requirements or payment details..."
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                    <PlusCircle size={18} />
                    <span>Place Order Booking</span>
                  </button>
                </form>
              </div>

              {/* Informative helper sidebar */}
              <div style={styles.helpSidebar} className="glass-panel">
                <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '1rem' }}>Order Rules Reminder</h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', listStyle: 'none' }}>
                  <li style={styles.helpItem}>
                    <Check size={14} style={{ color: 'var(--neon-cyan)', flexShrink: 0 }} />
                    <span>Customers don't need accounts to order; phone numbers serve as lookup keys automatically.</span>
                  </li>
                  <li style={styles.helpItem}>
                    <Check size={14} style={{ color: 'var(--neon-cyan)', flexShrink: 0 }} />
                    <span>If customer registers later with the same phone, they will immediately see this history.</span>
                  </li>
                  <li style={styles.helpItem}>
                    <Check size={14} style={{ color: 'var(--neon-cyan)', flexShrink: 0 }} />
                    <span>Payment statuses (Paid vs Partial vs Unpaid) compute dynamically based on fields.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GALLERY MANAGEMENT */}
        {activeTab === 'gallery' && (
          <div>
            <h2 style={styles.tabTitle}>Gallery Manager (Cloudinary Backend)</h2>

            <div style={styles.galleryContainerGrid}>
              {/* Image Uploader Panel */}
              <div className="glass-panel neon-border-cyan" style={styles.galleryUploadFormPanel}>
                <h3 style={{ ...styles.sectionTitle, marginBottom: '1.25rem' }}>Upload Photo to Portfolio</h3>
                
                {galleryUploadStatus.msg && (
                  <div style={{
                    ...styles.inquiryAlert,
                    backgroundColor: galleryUploadStatus.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: galleryUploadStatus.type === 'success' ? '#10b981' : '#ef4444',
                    borderColor: galleryUploadStatus.type === 'success' ? '#10b981' : '#ef4444',
                  }}>
                    {galleryUploadStatus.msg}
                  </div>
                )}

                <form onSubmit={handleGalleryUpload}>
                  <div className="form-group">
                    <label className="form-label">Photo Description / Title</label>
                    <input 
                      type="text" 
                      value={galleryTitle} 
                      onChange={(e) => setGalleryTitle(e.target.value)} 
                      className="form-input" 
                      placeholder="e.g. Wedding Hall 12x8 LED Setup" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Choose Image File *</label>
                    <input 
                      id="galleryFileInput"
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setGalleryFile(e.target.files[0])} 
                      className="form-input" 
                      style={{ padding: '0.65rem' }}
                      required
                    />
                  </div>

                  <button type="submit" disabled={uploadingGallery} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                    <Upload size={18} />
                    <span>{uploadingGallery ? 'Uploading to Cloudinary...' : 'Upload Image'}</span>
                  </button>
                </form>
              </div>

              {/* Gallery Items List */}
              <div className="glass-panel" style={styles.galleryListPanel}>
                <h3 style={{ ...styles.sectionTitle, marginBottom: '1.25rem' }}>Current Images Portfolio</h3>
                {loadingGallery ? (
                  <p>Loading portfolio images...</p>
                ) : galleryItems.length === 0 ? (
                  <p style={{ color: 'var(--text-dim)' }}>No uploads yet. Default pictures are shown on homepage.</p>
                ) : (
                  <div style={styles.adminGalleryItemsGrid}>
                    {galleryItems.map((item) => (
                      <div key={item.id} style={styles.adminGalleryCard} className="glass-panel">
                        <img src={item.image_url} alt={item.title} style={styles.adminGalleryImg} />
                        <div style={styles.adminGalleryDetails}>
                          <span style={styles.adminGalleryTitle}>{item.title || 'Untitled Image'}</span>
                          <button onClick={() => handleDeleteGalleryItem(item.id)} style={styles.adminGalleryDeleteBtn}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Order Modal Overlay */}
      {editingOrder && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel neon-border-cyan" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ color: '#fff', fontWeight: '700' }}>Edit Booking Details</h3>
              <button onClick={() => setEditingOrder(null)} style={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateOrder}>
              <div className="form-row" style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Customer Name</label>
                  <input 
                    type="text" 
                    value={editingOrder.customer_name} 
                    onChange={(e) => setEditingOrder({ ...editingOrder, customer_name: e.target.value })} 
                    className="form-input" 
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    value={editingOrder.customer_phone} 
                    onChange={(e) => setEditingOrder({ ...editingOrder, customer_phone: e.target.value })} 
                    className="form-input" 
                    required
                  />
                </div>
              </div>

              <div className="form-row" style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">LED size</label>
                  <input 
                    type="text" 
                    value={editingOrder.led_size} 
                    onChange={(e) => setEditingOrder({ ...editingOrder, led_size: e.target.value })} 
                    className="form-input" 
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Event Type</label>
                  <input 
                    type="text" 
                    value={editingOrder.event_type} 
                    onChange={(e) => setEditingOrder({ ...editingOrder, event_type: e.target.value })} 
                    className="form-input" 
                    required
                  />
                </div>
              </div>

              <div className="form-row" style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Event Date</label>
                  <input 
                    type="date" 
                    value={editingOrder.event_date} 
                    onChange={(e) => setEditingOrder({ ...editingOrder, event_date: e.target.value })} 
                    className="form-input" 
                    style={{ colorScheme: 'dark' }}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Event Time</label>
                  <input 
                    type="time" 
                    value={editingOrder.event_time || ''} 
                    onChange={(e) => setEditingOrder({ ...editingOrder, event_time: e.target.value })} 
                    className="form-input" 
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div className="form-row" style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Total Amount (₹)</label>
                  <input 
                    type="number" 
                    value={editingOrder.payment_amount} 
                    onChange={(e) => setEditingOrder({ ...editingOrder, payment_amount: e.target.value })} 
                    className="form-input" 
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Payment Received (₹)</label>
                  <input 
                    type="number" 
                    value={editingOrder.payment_received} 
                    onChange={(e) => setEditingOrder({ ...editingOrder, payment_received: e.target.value })} 
                    className="form-input" 
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Details</label>
                <textarea 
                  value={editingOrder.description || ''} 
                  onChange={(e) => setEditingOrder({ ...editingOrder, description: e.target.value })} 
                  className="form-input" 
                  rows="3" 
                />
              </div>

              <div style={styles.modalActionButtons}>
                <button type="button" onClick={() => setEditingOrder(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  sidebar: {
    padding: '2rem 1.5rem',
    borderRadius: '0px 24px 24px 0px',
    backgroundColor: '#0a0a0f',
    borderLeft: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '1rem',
  },
  adminRoleText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '-0.5rem',
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    marginTop: '1rem',
    flex: 1,
  },
  sidebarBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.9rem',
    fontWeight: '500',
    fontFamily: 'var(--font-body)',
    transition: 'var(--transition-fast)',
  },
  sidebarBtnActive: {
    background: 'rgba(0, 242, 254, 0.05)',
    color: 'var(--neon-cyan)',
    border: '1px solid rgba(0, 242, 254, 0.15)',
    fontWeight: '600',
  },
  logoutBtn: {
    width: '100%',
    padding: '0.65rem',
    fontSize: '0.85rem',
  },
  mainContent: {
    padding: '2.5rem',
    overflowY: 'auto',
    maxHeight: '100vh',
  },
  tabTitle: {
    fontSize: '1.75rem',
    color: '#fff',
    fontWeight: '700',
    marginBottom: '2rem',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.5rem',
    borderRadius: '16px',
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metricVal: {
    fontSize: '1.35rem',
    color: '#fff',
    fontWeight: '800',
    marginTop: '0.2rem',
  },
  inboxSection: {
    marginTop: '2rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    color: '#fff',
    fontWeight: '700',
  },
  emptyInbox: {
    padding: '3rem',
    textAlign: 'center',
    color: 'var(--text-dim)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  inquiriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inquiryCard: {
    padding: '1.5rem',
    borderRadius: '18px',
    backgroundColor: 'rgba(12, 12, 22, 0.2)',
  },
  inquiryCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    paddingBottom: '0.75rem',
  },
  inquiryClientName: {
    fontSize: '1.1rem',
    color: '#fff',
    fontWeight: '600',
  },
  inquiryClientPhone: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '0.2rem',
  },
  inquiryDetailsText: {
    fontSize: '0.9rem',
    color: 'var(--text-main)',
    margin: '1rem 0',
    lineHeight: '1.5',
  },
  inquiryActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: '0.75rem',
  },
  inquiryEventDate: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  inquiryActionButtons: {
    display: 'flex',
    gap: '0.75rem',
  },
  actionBtn: {
    padding: '0.45rem 1rem',
    fontSize: '0.8rem',
    borderRadius: '10px',
  },
  filterRow: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  searchBar: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-dim)',
  },
  filterDropdown: {
    width: '240px',
    background: '#151525',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  tableActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
  iconBtn: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '0.45rem',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-fast)',
  },
  newBookingContainer: {
    maxWidth: '900px',
  },
  newBookingGrid: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 0.7fr',
    gap: '2.5rem',
  },
  formPanel: {
    padding: '2.25rem',
    borderRadius: '20px',
    backgroundColor: 'rgba(12, 12, 22, 0.4)',
  },
  formRow: {
    display: 'flex',
    gap: '1.25rem',
    marginBottom: '0.5rem',
  },
  helperText: {
    fontSize: '0.75rem',
    marginTop: '0.15rem',
    display: 'block',
  },
  balanceCalculationBanner: {
    padding: '0.85rem 1.25rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginBottom: '1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    border: '1px solid rgba(255,255,255,0.02)',
  },
  helpSidebar: {
    padding: '1.75rem',
    borderRadius: '18px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    alignSelf: 'flex-start',
  },
  helpItem: {
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  galleryContainerGrid: {
    display: 'grid',
    gridTemplateColumns: '0.8fr 1.2fr',
    gap: '2.5rem',
  },
  galleryUploadFormPanel: {
    padding: '2rem',
    borderRadius: '20px',
    backgroundColor: 'rgba(12, 12, 22, 0.4)',
    alignSelf: 'flex-start',
  },
  galleryListPanel: {
    padding: '2rem',
    borderRadius: '20px',
  },
  adminGalleryItemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  adminGalleryCard: {
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  adminGalleryImg: {
    width: '100%',
    height: '110px',
    objectFit: 'cover',
  },
  adminGalleryDetails: {
    padding: '0.65rem 0.85rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.2)',
  },
  adminGalleryTitle: {
    fontSize: '0.75rem',
    color: '#fff',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '80%',
  },
  adminGalleryDeleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.2rem',
    display: 'flex',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1.5rem',
  },
  modalContent: {
    width: '100%',
    maxWidth: '650px',
    backgroundColor: 'var(--bg-dark)',
    borderRadius: '24px',
    padding: '2.25rem',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.75rem',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  modalActionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem',
  },
}

// Media overrides for responsive support
const adminStyle = document.createElement('style')
adminStyle.innerHTML = `
  @media (max-width: 968px) {
    div[style*="dashboard-grid"] {
      grid-template-columns: 1fr !important;
    }
    aside[style*="sidebar"] {
      border-radius: 0px !important;
      border-right: none !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
    }
    div[style*="metricsGrid"] {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 1rem !important;
    }
    div[style*="newBookingGrid"] {
      grid-template-columns: 1fr !important;
      gap: 1.5rem !important;
    }
    div[style*="galleryContainerGrid"] {
      grid-template-columns: 1fr !important;
      gap: 1.5rem !important;
    }
    div[style*="adminGalleryItemsGrid"] {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    div[style*="formRow"] {
      flex-direction: column !important;
      gap: 0.5rem !important;
    }
  }
`
document.head.appendChild(adminStyle)

export default AdminDashboard
