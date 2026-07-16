import React, { useState, useEffect } from 'react'
import axios from 'axios'
import LEDCalculator from '../components/LEDCalculator'
import { API_URL } from '../App'
import { Tv, Radio, Monitor, Calendar, MessageSquare, Phone, Send, Info, Award, Shield, User, Check } from 'lucide-react'


// Dummy gallery images in case backend is empty
const MOCK_GALLERY = [
  { id: 1, title: 'Grand Wedding Stage Setup', image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Outdoor Live Music Concert', image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: 'Political Rally LED screen', image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800' },
  { id: 4, title: 'High-end Corporate Seminar', image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800' },
]

function Home() {
  const [gallery, setGallery] = useState([])
  const [loadingGallery, setLoadingGallery] = useState(true)
  
  // Inquiry Form state
  const [inquiryName, setInquiryName] = useState('')
  const [inquiryPhone, setInquiryPhone] = useState('')
  const [inquiryEmail, setInquiryEmail] = useState('')
  const [inquiryDate, setInquiryDate] = useState('')
  const [inquiryReqs, setInquiryReqs] = useState('')
  
  // Status states
  const [inquiryStatus, setInquiryStatus] = useState({ type: '', message: '' })
  const [submittingInquiry, setSubmittingInquiry] = useState(false)

  // Fetch gallery images
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get(`${API_URL}/public/gallery/`)
        if (res.data && res.data.length > 0) {
          setGallery(res.data)
        } else {
          setGallery(MOCK_GALLERY)
        }
      } catch (err) {
        console.error("Gallery fetch failed, using fallback mock pictures", err)
        setGallery(MOCK_GALLERY)
      } finally {
        setLoadingGallery(false)
      }
    }
    fetchGallery()
  }, [])

  // Auto-fill inquiry requirements from LED Calculator
  const handleCalculatorData = (calcData) => {
    setInquiryReqs(calcData.requirements)
    setInquiryStatus({ type: 'info', message: 'Calculated requirements copied to inquiry form. Fill your details below to submit!' })
    
    // Smooth scroll to Inquiry section
    const el = document.getElementById('inquiry')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleInquirySubmit = async (e) => {
    e.preventDefault()
    if (!inquiryName || !inquiryPhone || !inquiryReqs) {
      setInquiryStatus({ type: 'error', message: 'Name, Phone, and Requirements are required!' })
      return
    }

    setSubmittingInquiry(true)
    setInquiryStatus({ type: '', message: '' })

    try {
      await axios.post(`${API_URL}/public/inquiry/`, {
        name: inquiryName,
        phone: inquiryPhone,
        email: inquiryEmail,
        event_date: inquiryDate || null,
        requirements: inquiryReqs
      })
      setInquiryStatus({ type: 'success', message: 'Thank you! Your inquiry has been sent successfully. Our team will contact you shortly.' })
      setInquiryName('')
      setInquiryPhone('')
      setInquiryEmail('')
      setInquiryDate('')
      setInquiryReqs('')
    } catch (err) {
      console.error(err)
      setInquiryStatus({ type: 'error', message: 'Failed to submit inquiry. Please try calling the owners directly!' })
    } finally {
      setSubmittingInquiry(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Background neon glows */}
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>

      {/* Hero Section */}
      <section id="hero" style={styles.heroSection}>
        <div className="container" style={styles.heroContainer}>
          <div style={styles.heroLeft}>
            <div style={styles.badgePromo} className="glass-panel pulse-glow">
              <Award size={14} style={{ color: 'var(--neon-cyan)' }} />
              <span>Premium Screen Quality Guaranteed</span>
            </div>
            <h1 style={styles.heroTitle}>
              Light Up Your Events With <span className="gradient-text">Krushnam Live</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Experience massive visuals with high-brightness, seamless LED Wall screens on rent. 
              We offer HD Camera Mixers and High-Definition Multi-Platform Live Streaming (YouTube / Facebook) 
              for weddings, concerts, corporate events, and rallies.
            </p>
            <div style={styles.heroCta}>
              <button onClick={() => document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' })} className="btn btn-primary">
                Estimate Rental Cost
              </button>
              <button onClick={() => document.getElementById('inquiry').scrollIntoView({ behavior: 'smooth' })} className="btn btn-secondary">
                Submit Inquiry
              </button>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.mockLedWallFrame} className="neon-border-cyan pulse-glow">
              <img 
                src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=800" 
                alt="Stage Setup" 
                style={styles.heroImage}
              />
              <div style={styles.ledScreenOverlay}>
                <span style={styles.overlayText}>KRUSHNAM LIVE</span>
                <span style={styles.overlaySubText}>ULTRA HD DISPLAY P2 / P3 / P4</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section style={styles.trustSection}>
        <div className="container" style={styles.trustGrid}>
          <div style={styles.trustCard} className="glass-panel">
            <Shield size={24} style={{ color: 'var(--neon-cyan)' }} />
            <div>
              <h5 style={styles.trustTitle}>100% Reliable Setup</h5>
              <p style={styles.trustDesc}>Backup controllers and tech crew present at every event.</p>
            </div>
          </div>
          <div style={styles.trustCard} className="glass-panel">
            <Tv size={24} style={{ color: 'var(--neon-pink)' }} />
            <div>
              <h5 style={styles.trustTitle}>Vibrant Pixel Clarity</h5>
              <p style={styles.trustDesc}>High refresh-rate modules with rich, cinematic colors.</p>
            </div>
          </div>
          <div style={styles.trustCard} className="glass-panel">
            <Radio size={24} style={{ color: 'var(--neon-purple)' }} />
            <div>
              <h5 style={styles.trustTitle}>Live Broadcast Crew</h5>
              <p style={styles.trustDesc}>Full HD lag-free streams to YouTube & Facebook.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-padding" style={styles.servicesSection}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag} className="glow-text-cyan">WHAT WE OFFER</span>
            <h2 style={styles.sectionTitle}>Our Premium Services</h2>
            <p style={styles.sectionSubtitle}>We handle full stage visual & broadcasting installations</p>
          </div>

          <div style={styles.servicesGrid}>
            {/* LED Wall */}
            <div className="glass-panel neon-border-cyan" style={styles.serviceCard}>
              <div style={styles.serviceIconContainer}>
                <Tv size={28} style={{ color: 'var(--neon-cyan)' }} />
              </div>
              <h3 style={styles.serviceTitle}>LED Wall Screen Rental</h3>
              <p style={styles.serviceDesc}>
                Premium high-refresh rate LED Walls. Available in custom aspect ratios and sizes 
                (e.g., 10x8, 12x8, 16x9, 20x10). Built with high-brightness modules suitable for both 
                indoor weddings and outdoor sunlight rallies.
              </p>
              <ul style={styles.bulletList}>
                <li style={styles.bulletItem}><Check size={14} style={{ color: 'var(--neon-cyan)' }} /> High Refresh Rate (No camera flicker)</li>
                <li style={styles.bulletItem}><Check size={14} style={{ color: 'var(--neon-cyan)' }} /> Indoor P2.5/P3 & Outdoor P4/P4.8 options</li>
                <li style={styles.bulletItem}><Check size={14} style={{ color: 'var(--neon-cyan)' }} /> Seamless assembly panels</li>
              </ul>
            </div>

            {/* Live Streaming */}
            <div className="glass-panel neon-border-pink" style={styles.serviceCard}>
              <div style={styles.serviceIconContainer}>
                <Radio size={28} style={{ color: 'var(--neon-pink)' }} />
              </div>
              <h3 style={styles.serviceTitle}>YouTube & Facebook Live</h3>
              <p style={styles.serviceDesc}>
                Broadcast your event live to millions on social platforms in crisp 1080p full high-definition. 
                Using multi-sim connections to ensure stable, buffer-free streaming even in rural locations.
              </p>
              <ul style={styles.bulletList}>
                <li style={styles.bulletItem}><Check size={14} style={{ color: 'var(--neon-pink)' }} /> Multi-camera sync streaming</li>
                <li style={styles.bulletItem}><Check size={14} style={{ color: 'var(--neon-pink)' }} /> Multi-sim redundancy backup internet</li>
                <li style={styles.bulletItem}><Check size={14} style={{ color: 'var(--neon-pink)' }} /> Clean digital audio integration</li>
              </ul>
            </div>

            {/* Camera Mixer */}
            <div className="glass-panel" style={{ ...styles.serviceCard, border: '1px solid var(--neon-purple-glow)' }}>
              <div style={styles.serviceIconContainer}>
                <Monitor size={28} style={{ color: 'var(--neon-purple)' }} />
              </div>
              <h3 style={styles.serviceTitle}>HD Camera Mixer & Crane</h3>
              <p style={styles.serviceDesc}>
                Multi-camera setup with professional operators, camera cranes, and hardware digital video mixers. 
                Switch between crane shots, close-ups, and live text overlays on the LED screen seamlessly.
              </p>
              <ul style={styles.bulletList}>
                <li style={styles.bulletItem}><Check size={14} style={{ color: 'var(--neon-purple)' }} /> Multi-channel video switcher mixers</li>
                <li style={styles.bulletItem}><Check size={14} style={{ color: 'var(--neon-purple)' }} /> Professional jimmy jib / crane cameras</li>
                <li style={styles.bulletItem}><Check size={14} style={{ color: 'var(--neon-purple)' }} /> Instant replay & slow-motion capabilities</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="section-padding" style={styles.calculatorSection}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag} className="glow-text-cyan">BUDGET ESTIMATION</span>
            <h2 style={styles.sectionTitle}>Calculate Rental Costs</h2>
            <p style={styles.sectionSubtitle}>Plan your budget instantly using our LED size and multi-day configurator</p>
          </div>
          <LEDCalculator onEnquireWithData={handleCalculatorData} />
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="section-padding" style={styles.gallerySection}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag} className="glow-text-pink">PORTFOLIO Showcase</span>
            <h2 style={styles.sectionTitle}>Event Photo Gallery</h2>
            <p style={styles.sectionSubtitle}>Photos of our recent LED Wall setups and live streaming stages</p>
          </div>

          {loadingGallery ? (
            <div className="flex-center" style={{ height: '200px' }}>
              <span className="glow-text-cyan">Loading gallery assets...</span>
            </div>
          ) : (
            <div style={styles.galleryGrid}>
              {gallery.map((item) => (
                <div key={item.id} className="glass-panel" style={styles.galleryCard}>
                  <img src={item.image_url} alt={item.title} style={styles.galleryImage} />
                  <div style={styles.galleryCardOverlay}>
                    <h4 style={styles.galleryCardTitle}>{item.title || 'Krushnam Live Event'}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="inquiry" className="section-padding" style={styles.inquirySection}>
        <div className="container" style={styles.inquiryContainer}>
          <div style={styles.inquiryLeft}>
            <span style={styles.sectionTag} className="glow-text-cyan">BOOKING INQUIRY</span>
            <h2 style={styles.inquiryTitle}>Start Planning Your Visual Stage</h2>
            <p style={styles.inquiryText}>
              Need custom-sized LED displays, camera crane setups, or live streaming configurations? 
              Fill out this inquiry form, and Dhanveer or Jaimin will get in touch with you 
              immediately with details.
            </p>
            <div style={styles.quickContactHelp}>
              <Info size={16} className="glow-text-cyan" />
              <span>Tip: You can use the LED Calculator above to automatically pre-fill your specifications here!</span>
            </div>
          </div>

          <div style={styles.inquiryRight} className="glass-panel neon-border-cyan">
            <h3 style={styles.inquiryFormTitle}>Submit Inquiry</h3>
            {inquiryStatus.message && (
              <div style={{
                ...styles.inquiryAlert,
                backgroundColor: inquiryStatus.type === 'success' ? 'rgba(16,185,129,0.1)' : 
                                inquiryStatus.type === 'info' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                color: inquiryStatus.type === 'success' ? '#10b981' : 
                       inquiryStatus.type === 'info' ? '#3b82f6' : '#ef4444',
                borderColor: inquiryStatus.type === 'success' ? '#10b981' : 
                             inquiryStatus.type === 'info' ? '#3b82f6' : '#ef4444',
              }}>
                {inquiryStatus.message}
              </div>
            )}

            <form onSubmit={handleInquirySubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  value={inquiryName} 
                  onChange={(e) => setInquiryName(e.target.value)} 
                  className="form-input" 
                  placeholder="Enter your name" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  value={inquiryPhone} 
                  onChange={(e) => setInquiryPhone(e.target.value)} 
                  className="form-input" 
                  placeholder="Enter contact number" 
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Email (Optional)</label>
                  <input 
                    type="email" 
                    value={inquiryEmail} 
                    onChange={(e) => setInquiryEmail(e.target.value)} 
                    className="form-input" 
                    placeholder="Enter email address" 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Event Date</label>
                  <input 
                    type="date" 
                    value={inquiryDate} 
                    onChange={(e) => setInquiryDate(e.target.value)} 
                    className="form-input" 
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Requirements / Details</label>
                <textarea 
                  value={inquiryReqs} 
                  onChange={(e) => setInquiryReqs(e.target.value)} 
                  className="form-input" 
                  rows="4" 
                  placeholder="e.g. Need 12x8 LED Wall for 2 days. Also need crane camera mixer..." 
                  required
                />
              </div>

              <button type="submit" disabled={submittingInquiry} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                {submittingInquiry ? 'Sending...' : 'Send Inquiry Details'}
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Owners/Contact Footer Section */}
      <section id="contact" style={styles.contactSection} className="glass-panel">
        <div className="container">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag} className="glow-text-pink">CONTACT THE OWNERS</span>
            <h2 style={styles.sectionTitle}>Meet Our Admins & Team</h2>
            <p style={styles.sectionSubtitle}>Get in touch directly with the founders for instant bookings</p>
          </div>

          <div style={styles.ownersGrid}>
            {/* Owner 1: Dhanveer */}
            <div className="glass-panel neon-border-cyan" style={styles.ownerCard}>
              <div style={styles.avatarContainer}>
                <User size={36} style={{ color: 'var(--neon-cyan)' }} />
              </div>
              <h3 style={styles.ownerName}>Dhanveer</h3>
              <p style={styles.ownerTitle}>Founder & Technical Director</p>
              <div style={styles.contactDetails}>
                <p style={styles.contactItem}><Phone size={14} /> +91 9313276505</p>
              </div>
              <div style={styles.ownerActionRow}>
                <a href="tel:9313276505" className="btn btn-secondary" style={styles.ownerActionBtn}>
                  Call Directly
                </a>
                <a 
                  href="https://wa.me/919313276505?text=Hello%20Dhanveer,%20I%20am%20interested%20in%20renting%20an%20LED%20Wall..." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-neon-pink" 
                  style={{ ...styles.ownerActionBtn, border: '1px solid #25d366', color: '#25d366', boxShadow: 'none' }}
                >
                  WhatsApp Chat
                </a>
              </div>
            </div>

            {/* Owner 2: Jaimin Ramani */}
            <div className="glass-panel neon-border-pink" style={styles.ownerCard}>
              <div style={styles.avatarContainer}>
                <User size={36} style={{ color: 'var(--neon-pink)' }} />
              </div>
              <h3 style={styles.ownerName}>Jaimin Ramani</h3>
              <p style={styles.ownerTitle}>Co-Founder & Stage Coordinator</p>
              <div style={styles.contactDetails}>
                <p style={styles.contactItem}><Phone size={14} /> +91 9081247935</p>
              </div>
              <div style={styles.ownerActionRow}>
                <a href="tel:9081247935" className="btn btn-secondary" style={styles.ownerActionBtn}>
                  Call Directly
                </a>
                <a 
                  href="https://wa.me/919081247935?text=Hello%20Jaimin,%20I%20am%20interested%20in%20renting%20an%20LED%20Wall..." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-neon-pink" 
                  style={{ ...styles.ownerActionBtn, border: '1px solid #25d366', color: '#25d366', boxShadow: 'none' }}
                >
                  WhatsApp Chat
                </a>
              </div>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <p>© {new Date().getFullYear()} Krushnam Live. All rights reserved.</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
              Premium event visual systems setup. Developed by Antigravity.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

const styles = {
  page: {
    position: 'relative',
    overflow: 'hidden',
  },
  heroSection: {
    padding: '7rem 0 4rem 0',
  },
  heroContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '3rem',
    zIndex: 2,
    position: 'relative',
  },
  heroLeft: {
    flex: 1.1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  badgePromo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    alignSelf: 'flex-start',
    padding: '0.4rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    color: '#fff',
    fontWeight: '500',
    backgroundColor: 'rgba(0, 242, 254, 0.05)',
    border: '1px solid rgba(0, 242, 254, 0.2)',
  },
  heroTitle: {
    fontSize: '3.5rem',
    lineHeight: '1.15',
    color: '#fff',
  },
  heroSubtitle: {
    fontSize: '1.05rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
  },
  heroCta: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  heroRight: {
    flex: 0.9,
    display: 'flex',
    justifyContent: 'center',
  },
  mockLedWallFrame: {
    position: 'relative',
    borderRadius: '20px',
    padding: '6px',
    backgroundColor: '#000',
    width: '100%',
    aspectRatio: '16/10',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '14px',
    filter: 'brightness(0.95) contrast(1.15)',
  },
  ledScreenOverlay: {
    position: 'absolute',
    bottom: '1rem',
    left: '1rem',
    right: '1rem',
    padding: '1.25rem',
    borderRadius: '12px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.4))',
    border: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  overlayText: {
    fontFamily: 'var(--font-heading)',
    fontWeight: '800',
    fontSize: '1.1rem',
    letterSpacing: '0.1em',
    color: 'var(--neon-cyan)',
  },
  overlaySubText: {
    fontSize: '0.7rem',
    color: '#fff',
    fontWeight: '500',
    letterSpacing: '0.05em',
  },
  trustSection: {
    padding: '2rem 0',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    background: 'rgba(0,0,0,0.15)',
  },
  trustGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  trustCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem 1.5rem',
  },
  trustTitle: {
    fontSize: '0.95rem',
    color: '#fff',
    fontWeight: '600',
  },
  trustDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '0.2rem',
  },
  servicesSection: {
    background: 'linear-gradient(to bottom, transparent, rgba(12,12,22,0.4))',
  },
  sectionHeader: {
    textAlign: 'center',
    maxWidth: '650px',
    margin: '0 auto 4rem auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  sectionTag: {
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: '2.25rem',
    color: '#fff',
  },
  sectionSubtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
  },
  serviceCard: {
    padding: '2.5rem 2rem',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    height: '100%',
  },
  serviceIconContainer: {
    alignSelf: 'flex-start',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  serviceTitle: {
    fontSize: '1.35rem',
    color: '#fff',
    fontWeight: '700',
  },
  serviceDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
  },
  bulletList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.03)',
  },
  bulletItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  calculatorSection: {
    background: 'rgba(0,0,0,0.1)',
  },
  gallerySection: {
    background: 'linear-gradient(to bottom, rgba(12,12,22,0.4), transparent)',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
  },
  galleryCard: {
    position: 'relative',
    height: '240px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  galleryCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '1.25rem',
    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
    display: 'flex',
    alignItems: 'flex-end',
  },
  galleryCardTitle: {
    fontSize: '0.9rem',
    color: '#fff',
    fontWeight: '600',
  },
  inquirySection: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  inquiryContainer: {
    display: 'grid',
    gridTemplateColumns: '1.10fr 0.90fr',
    gap: '4rem',
    alignItems: 'center',
  },
  inquiryLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inquiryTitle: {
    fontSize: '2.5rem',
    color: '#fff',
    lineHeight: '1.2',
  },
  inquiryText: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
  },
  quickContactHelp: {
    display: 'flex',
    gap: '0.6rem',
    alignItems: 'center',
    padding: '0.85rem 1.2rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(0, 242, 254, 0.05)',
    border: '1px solid rgba(0, 242, 254, 0.12)',
    fontSize: '0.8rem',
    color: '#fff',
  },
  inquiryRight: {
    padding: '2.5rem',
    borderRadius: '24px',
    backgroundColor: 'var(--bg-card)',
  },
  inquiryFormTitle: {
    fontSize: '1.5rem',
    color: '#fff',
    marginBottom: '1.5rem',
    fontWeight: '700',
  },
  inquiryAlert: {
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
    lineHeight: '1.4',
  },
  contactSection: {
    marginTop: '6rem',
    padding: '5rem 0 3rem 0',
    borderRadius: '36px 36px 0 0',
    backgroundColor: '#0a0a0f',
    borderBottom: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  ownersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '3rem',
    maxWidth: '900px',
    margin: '0 auto 4rem auto',
  },
  ownerCard: {
    padding: '2rem',
    borderRadius: '20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
  },
  avatarContainer: {
    padding: '1rem',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    width: '72px',
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerName: {
    fontSize: '1.4rem',
    color: '#fff',
    fontWeight: '700',
  },
  ownerTitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  contactDetails: {
    marginTop: '0.5rem',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.95rem',
    color: '#fff',
    fontWeight: '600',
  },
  ownerActionRow: {
    display: 'flex',
    gap: '0.75rem',
    width: '100%',
    marginTop: '1rem',
  },
  ownerActionBtn: {
    flex: 1,
    padding: '0.65rem',
    fontSize: '0.85rem',
    borderRadius: '12px',
  },
  footerBottom: {
    textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    paddingTop: '2.5rem',
    color: 'var(--text-dim)',
    fontSize: '0.85rem',
  },
}

// Media Query adjustments
const homeStyle = document.createElement('style')
homeStyle.innerHTML = `
  @media (max-width: 968px) {
    div[style*="heroContainer"] {
      flex-direction: column !important;
      text-align: center !important;
      gap: 2rem !important;
    }
    div[style*="badgePromo"] {
      align-self: center !important;
    }
    div[style*="heroCta"] {
      justify-content: center !important;
    }
    h1[style*="heroTitle"] {
      font-size: 2.5rem !important;
    }
    div[style*="trustGrid"] {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
    }
    div[style*="servicesGrid"] {
      grid-template-columns: 1fr !important;
      gap: 1.5rem !important;
    }
    div[style*="galleryGrid"] {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 1rem !important;
    }
    div[style*="inquiryContainer"] {
      grid-template-columns: 1fr !important;
      gap: 2rem !important;
    }
    div[style*="ownersGrid"] {
      grid-template-columns: 1fr !important;
      gap: 2rem !important;
    }
    div[style*="ownerActionRow"] {
      flex-direction: column !important;
    }
  }
  .glass-panel[style*="galleryCard"]:hover img {
    transform: scale(1.08);
  }
`
document.head.appendChild(homeStyle)

export default Home
