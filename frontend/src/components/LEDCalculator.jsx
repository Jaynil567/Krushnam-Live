import React, { useState, useEffect } from 'react'
import { Calculator, Check, ArrowRight, Info } from 'lucide-react'

function LEDCalculator({ onEnquireWithData }) {
  const [width, setWidth] = useState(12)
  const [height, setHeight] = useState(8)
  const [days, setDays] = useState(1)
  const [pitch, setPitch] = useState('p3-in') // p2-in, p3-in, p4-out, p4.8-out
  
  // Add-ons
  const [liveStream, setLiveStream] = useState(false)
  const [mixer, setMixer] = useState(false)
  const [operator, setOperator] = useState(true)

  const [results, setResults] = useState({
    sqft: 96,
    baseRate: 120,
    firstDayCost: 11520,
    subsequentDaysCost: 0,
    addonsCost: 1500, // Operator cost default
    total: 13020,
    aspectRatio: '1.50'
  })

  // Rates configuration (per Sq. Ft. per day in INR)
  const pitchRates = {
    'p2-in': { name: 'P2.5 Premium Indoor', rate: 150 },
    'p3-in': { name: 'P3.0 Standard Indoor', rate: 120 },
    'p4-out': { name: 'P4.0 Outdoor Bright', rate: 130 },
    'p4.8-out': { name: 'P4.8 Standard Outdoor', rate: 110 }
  }

  // Calculate pricing whenever state changes
  useEffect(() => {
    const sqft = width * height
    const baseRate = pitchRates[pitch].rate
    
    // First day cost
    const firstDay = sqft * baseRate
    
    // Multi-day discount: 2nd day is 50% discount, 3rd day onwards is 70% discount
    let subsequentDays = 0
    if (days > 1) {
      // 2nd day
      subsequentDays += firstDay * 0.5
      // 3rd day onwards
      if (days > 2) {
        subsequentDays += firstDay * 0.3 * (days - 2)
      }
    }

    // Addons
    let addons = 0
    if (liveStream) addons += 5000  // YouTube/FB Live Streaming setup
    if (mixer) addons += 8000       // Camera Mixer + 2 cameras
    if (operator) addons += 1500 * days  // Operator cost per day

    const total = firstDay + subsequentDays + addons
    const aspect = (width / height).toFixed(2)

    setResults({
      sqft,
      baseRate,
      firstDayCost: Math.round(firstDay),
      subsequentDaysCost: Math.round(subsequentDays),
      addonsCost: Math.round(addons),
      total: Math.round(total),
      aspectRatio: aspect
    })
  }, [width, height, days, pitch, liveStream, mixer, operator])

  const getAspectRecommendation = () => {
    const ratio = parseFloat(results.aspectRatio)
    if (Math.abs(ratio - 1.77) < 0.1) return 'Perfect 16:9 Widescreen (Cinema/Presentation Standard)'
    if (Math.abs(ratio - 1.33) < 0.1) return 'Traditional 4:3 Aspect (Standard Stage)'
    if (ratio > 2) return 'Ultra-Wide Panoramic Band'
    if (ratio < 1) return 'Vertical Portrait Billboard'
    return 'Custom Aspect Ratio'
  }

  const handleQuickEnquire = () => {
    if (onEnquireWithData) {
      onEnquireWithData({
        requirements: `LED Wall Estimate Request:
- Size: ${width}x${height} feet (${results.sqft} sq.ft)
- Pixel Pitch: ${pitchRates[pitch].name}
- Duration: ${days} Day(s)
- Add-ons: Live Stream: ${liveStream ? 'Yes' : 'No'}, Camera Mixer: ${mixer ? 'Yes' : 'No'}, Operator: ${operator ? 'Yes' : 'No'}
- Total Estimated Price: ₹${results.total.toLocaleString('en-IN')}`
      })
    }
  }

  return (
    <div style={styles.container} className="glass-panel neon-border-cyan">
      <div style={styles.header}>
        <div style={styles.headerIcon} className="glass-panel">
          <Calculator size={24} className="glow-text-cyan" />
        </div>
        <div>
          <h3 style={styles.title}>LED Rental Cost Estimator</h3>
          <p style={styles.subtitle}>Get an instant ballpark figure for your stage setup</p>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Controls Section */}
        <div style={styles.controls}>
          <div style={styles.formRow}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Width (feet): {width}</label>
              <input 
                type="range" 
                min="6" 
                max="40" 
                step="2" 
                value={width} 
                onChange={(e) => setWidth(parseInt(e.target.value))} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Height (feet): {height}</label>
              <input 
                type="range" 
                min="4" 
                max="20" 
                step="2" 
                value={height} 
                onChange={(e) => setHeight(parseInt(e.target.value))} 
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Event Duration (Days)</label>
              <select 
                value={days} 
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="form-input"
                style={styles.selectInput}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                  <option key={d} value={d}>{d} Day{d > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">LED Panel Type</label>
              <select 
                value={pitch} 
                onChange={(e) => setPitch(e.target.value)}
                className="form-input"
                style={styles.selectInput}
              >
                {Object.entries(pitchRates).map(([k, v]) => (
                  <option key={k} value={k}>{v.name} (₹{v.rate}/sqft)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Add-ons List */}
          <div style={styles.addonsSection}>
            <h4 style={styles.sectionTitle}>Mixer & Streaming Add-ons</h4>
            <div style={styles.addonsGrid}>
              <label style={styles.addonCard} className={`glass-panel ${liveStream ? 'neon-border-cyan' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={liveStream} 
                  onChange={(e) => setLiveStream(e.target.checked)}
                  style={styles.checkbox}
                />
                <div style={styles.addonDetails}>
                  <span style={styles.addonLabel}>YouTube/FB Live Streaming</span>
                  <span style={styles.addonPrice}>+ ₹5,000 setup</span>
                </div>
              </label>

              <label style={styles.addonCard} className={`glass-panel ${mixer ? 'neon-border-cyan' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={mixer} 
                  onChange={(e) => setMixer(e.target.checked)}
                  style={styles.checkbox}
                />
                <div style={styles.addonDetails}>
                  <span style={styles.addonLabel}>Camera Mixer & 2 Cameras</span>
                  <span style={styles.addonPrice}>+ ₹8,000 setup</span>
                </div>
              </label>

              <label style={styles.addonCard} className={`glass-panel ${operator ? 'neon-border-cyan' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={operator} 
                  onChange={(e) => setOperator(e.target.checked)}
                  style={styles.checkbox}
                />
                <div style={styles.addonDetails}>
                  <span style={styles.addonLabel}>Professional Tech Operator</span>
                  <span style={styles.addonPrice}>+ ₹1,500/day</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Visual & Summary Section */}
        <div style={styles.summaryContainer} className="glass-panel">
          <h4 style={styles.summaryHeader}>Configurator Output</h4>
          
          {/* Visual Wall Aspect Ratio simulation box */}
          <div style={styles.visualizerArea}>
            <div 
              style={{
                ...styles.ledVisualWall,
                aspectRatio: results.aspectRatio,
                maxWidth: '100%',
                maxHeight: '130px',
              }}
              className="pulse-glow"
            >
              <span style={styles.visualWallLabel}>{width}' x {height}' LED Wall</span>
            </div>
            <div style={styles.aspectRecommendation}>
              <Info size={14} style={{ color: 'var(--neon-cyan)' }} />
              <span>{getAspectRecommendation()}</span>
            </div>
          </div>

          <div style={styles.pricingBreakdown}>
            <div style={styles.breakdownRow}>
              <span>Area size:</span>
              <span style={styles.breakdownVal}>{results.sqft} Sq. Ft.</span>
            </div>
            <div style={styles.breakdownRow}>
              <span>Day 1 Cost (Base):</span>
              <span style={styles.breakdownVal}>₹{results.firstDayCost.toLocaleString('en-IN')}</span>
            </div>
            {results.subsequentDaysCost > 0 && (
              <div style={styles.breakdownRow}>
                <span style={{ color: '#10b981' }}>Extra Days Discount (Multi-day):</span>
                <span style={{ ...styles.breakdownVal, color: '#10b981' }}>₹{results.subsequentDaysCost.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={styles.breakdownRow}>
              <span>Services & Add-ons:</span>
              <span style={styles.breakdownVal}>₹{results.addonsCost.toLocaleString('en-IN')}</span>
            </div>
            <div style={styles.totalRow}>
              <span>Estimated Cost:</span>
              <span style={styles.totalVal} className="glow-text-cyan">₹{results.total.toLocaleString('en-IN')}*</span>
            </div>
          </div>

          <p style={styles.disclaimer}>*Est. pricing. Transportation/labor taxes will be calculated manually by admin.</p>

          <button onClick={handleQuickEnquire} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            <span>Book / Inquiry with details</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '2rem',
    borderRadius: '24px',
    backgroundColor: 'rgba(12, 12, 22, 0.75)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },
  headerIcon: {
    padding: '0.75rem',
    borderRadius: '12px',
  },
  title: {
    fontSize: '1.5rem',
    color: '#fff',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '0.2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '2.5rem',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formRow: {
    display: 'flex',
    gap: '1.5rem',
  },
  selectInput: {
    background: '#151525',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  addonsSection: {
    marginTop: '0.5rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    color: '#fff',
    marginBottom: '1rem',
    fontWeight: '600',
    letterSpacing: '0.03em',
  },
  addonsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  addonCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.85rem 1.25rem',
    borderRadius: '12px',
    cursor: 'pointer',
    gap: '1rem',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--neon-cyan)',
    cursor: 'pointer',
  },
  addonDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  addonLabel: {
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  addonPrice: {
    fontSize: '0.85rem',
    color: 'var(--neon-cyan)',
    fontWeight: '600',
  },
  summaryContainer: {
    padding: '1.75rem',
    borderRadius: '18px',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  summaryHeader: {
    fontSize: '1.1rem',
    color: '#fff',
    fontWeight: '600',
    marginBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.5rem',
  },
  visualizerArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    margin: '1rem 0',
  },
  ledVisualWall: {
    backgroundColor: '#111122',
    border: '2px solid var(--neon-cyan)',
    boxShadow: '0 0 20px var(--neon-cyan-glow)',
    borderRadius: '8px',
    width: '75%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-smooth)',
  },
  visualWallLabel: {
    fontSize: '0.8rem',
    fontFamily: 'var(--font-heading)',
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
  },
  aspectRecommendation: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
  pricingBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    margin: '1.25rem 0',
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  breakdownVal: {
    color: '#fff',
    fontWeight: '500',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px dashed rgba(255,255,255,0.1)',
    paddingTop: '1rem',
    marginTop: '0.5rem',
  },
  totalVal: {
    fontSize: '1.35rem',
    fontWeight: '800',
  },
  disclaimer: {
    fontSize: '0.7rem',
    color: 'var(--text-dim)',
    textAlign: 'center',
    lineHeight: '1.3',
  },
}

// Inline CSS inject for responsive handling
const calcStyleTag = document.createElement('style')
calcStyleTag.innerHTML = `
  @media (max-width: 968px) {
    div[style*="grid"] {
      grid-template-columns: 1fr !important;
      gap: 1.5rem !important;
    }
  }
`
document.head.appendChild(calcStyleTag)

export default LEDCalculator
