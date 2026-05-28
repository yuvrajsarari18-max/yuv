'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

// Theme configurations
const THEME_STYLES = {
  gold: {
    '--bg-primary': '#0a0a0a',
    '--bg-secondary': '#121212',
    '--bg-tertiary': '#1a1a1a',
    '--gold-primary': '#d4af37',
    '--gold-secondary': '#c5a028',
    '--gold-dark': '#8c6d12',
    '--gold-light': '#f3e5ab',
    '--gold-gradient': 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
    '--gold-glow': 'rgba(212, 175, 55, 0.3)',
    '--text-primary': '#f5f5f7',
    '--text-secondary': '#a1a1a6',
    '--text-muted': '#6e6e73',
    '--border-gold': 'rgba(212, 175, 55, 0.15)',
    '--border-gold-focus': 'rgba(212, 175, 55, 0.5)',
    '--border-light': 'rgba(255, 255, 255, 0.08)',
    '--glass-bg': 'rgba(18, 18, 18, 0.8)',
    '--glass-border': 'rgba(255, 255, 255, 0.05)',
    '--glass-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
  },
  green: {
    '--bg-primary': '#fdfbf7', // Pale warm white
    '--bg-secondary': '#f4f1eb', // Soft warm cream
    '--bg-tertiary': '#e9e4db', // Deeper beige
    '--gold-primary': '#2d6a4f', // Forest green
    '--gold-secondary': '#1b4332',
    '--gold-dark': '#081c15',
    '--gold-light': '#52b788',
    '--gold-gradient': 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
    '--gold-glow': 'rgba(45, 106, 79, 0.3)',
    '--text-primary': '#1b4332', // Deep green text
    '--text-secondary': '#40916c', // Mid green text
    '--text-muted': '#74c69d',
    '--border-gold': 'rgba(45, 106, 79, 0.15)',
    '--border-gold-focus': 'rgba(45, 106, 79, 0.5)',
    '--border-light': 'rgba(45, 106, 79, 0.08)',
    '--glass-bg': 'rgba(244, 241, 235, 0.8)',
    '--glass-border': 'rgba(45, 106, 79, 0.05)',
    '--glass-shadow': '0 8px 32px 0 rgba(45, 106, 79, 0.05)'
  }
};

const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", 
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", 
  "06:00 PM", "07:00 PM", "08:00 PM"
];

export default function SalonPublicPage({ params }) {
  const slug = params.slug;
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Salon DB Details
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);

  // Active state
  const [activeCategory, setActiveCategory] = useState('hair');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Form input details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [submitLoading, setSubmitLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // 1. Fetch Custom Salon Data
  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const { data: salonData, error: salonErr } = await supabase
          .from('salons')
          .select('*')
          .eq('slug', slug)
          .single();

        if (salonErr || !salonData) {
          throw new Error("Salon not found");
        }
        setSalon(salonData);

        // Fetch services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('salon_id', salonData.id)
          .order('price', { ascending: true });
        setServices(servicesData || []);

        // Set default category dynamically if services exist
        if (servicesData && servicesData.length > 0) {
          setActiveCategory(servicesData[0].category || 'hair');
        }

        // Fetch stylists
        const { data: stylistsData } = await supabase
          .from('stylists')
          .select('*')
          .eq('salon_id', salonData.id);
        setStylists(stylistsData || []);

      } catch (err) {
        setErrorMsg("This salon profile was not found or is currently inactive.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalon();
  }, [slug]);

  // Handle Form Submission
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!selectedService || !selectedStylist || !selectedDate || !selectedTime || !customerName || !customerPhone) {
      alert("Please fill in all required booking slots.");
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          salon_id: salon.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          service_id: selectedService.id,
          stylist_id: selectedStylist.id,
          booking_date: selectedDate,
          booking_time: selectedTime,
          notes: customerNotes
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowSuccessModal(true);
        // Reset state
        setCustomerName('');
        setCustomerPhone('');
        setCustomerNotes('');
        setSelectedService(null);
        setSelectedStylist(null);
        setSelectedDate('');
        setSelectedTime('');
      } else {
        throw new Error(data.message || "Failed to submit booking.");
      }
    } catch (err) {
      console.error(err);
      setShowErrorModal(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Date Formatting helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading Salon Booking Portal...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>404 Salon Profile Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '450px' }}>{errorMsg}</p>
        <Link href="/" className="btn btn-gold">Build Your Own Salon Website</Link>
      </div>
    );
  }

  // Retrieve theme CSS variables
  const currentTheme = salon?.theme_color === 'green' ? THEME_STYLES.green : THEME_STYLES.gold;

  const categories = [...new Set(services.map(s => s.category))];
  const filteredServices = services.filter(s => s.category === activeCategory);

  return (
    <div style={currentTheme} className="salon-custom-booking-page">
      
      {/* Dynamic Styled Page Wrapper Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .salon-custom-booking-page {
          background-color: var(--bg-primary);
          color: var(--text-primary);
          min-height: 100vh;
        }
        .themed-header {
          border-bottom: 1px solid var(--border-light);
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .themed-header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 80px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .themed-logo {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .themed-tagline {
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          color: var(--text-secondary);
        }
        .card-menu {
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--border-radius-sm);
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: var(--transition);
        }
        .card-menu:hover {
          transform: translateY(-4px);
          border-color: var(--gold-primary);
        }
        .tab-button {
          padding: 0.75rem 1.8rem;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
          color: var(--text-secondary);
          position: relative;
        }
        .tab-button.active {
          color: var(--gold-primary);
        }
        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--gold-gradient);
        }
        .booking-box {
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--border-radius-md);
          padding: 2.5rem;
          box-shadow: var(--glass-shadow);
        }
        .slot-btn {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          padding: 0.8rem;
          font-size: 0.8rem;
          font-weight: 500;
          text-align: center;
          border-radius: var(--border-radius-sm);
          color: var(--text-primary);
          transition: var(--transition);
        }
        .slot-btn:hover {
          border-color: var(--gold-primary);
          color: var(--gold-primary);
        }
        .slot-btn.selected {
          background: var(--gold-gradient);
          color: var(--bg-primary) !important;
          font-weight: 600;
        }
        .btn-theme {
          background: var(--gold-gradient);
          color: var(--bg-primary);
          font-weight: 700;
        }
        .btn-theme:hover {
          opacity: 0.9;
        }
        .stylist-card-select {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-radius: var(--border-radius-sm);
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .stylist-card-select:hover {
          border-color: var(--gold-primary);
        }
        .stylist-card-select.selected {
          border-color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.05);
        }
      ` }} />

      {/* Styled Page Header */}
      <header className="themed-header">
        <div className="themed-header-inner">
          <div>
            <h1 className="themed-logo">{salon.name}</h1>
            <span className="themed-tagline">EXCELLENCE IN STYLING</span>
          </div>
          <a href="#booking-form-start" className="btn btn-outline btn-sm" style={{ borderColor: 'var(--gold-primary)', color: 'var(--gold-primary)' }}>Book Appointment</a>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '8rem 2rem 5rem', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: '750px', margin: '0 auto', zIndex: 2, position: 'relative' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.25em', color: 'var(--gold-primary)', fontWeight: '700', textTransform: 'uppercase' }}>Royal Service</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', margin: '1.2rem 0', fontWeight: '500' }}>Indulge in Premium Care</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '300' }}>Choose our custom spa, haircut, and beard grooming services. Book instantly.</p>
        </div>
      </section>

      {/* Services Section */}
      <section className="container" style={{ paddingBottom: '6rem' }}>
        <div style={{ borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab-button ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {services.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No services listed in the menu yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {filteredServices.map((service) => (
              <div key={service.id} className="card-menu">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>{service.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{service.description}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--gold-primary)' }}>₹{service.price}</span>
                  <button 
                    onClick={() => {
                      setSelectedService(service);
                      document.getElementById('booking-form-start').scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn btn-sm btn-outline"
                    style={{ borderColor: 'var(--gold-primary)', color: 'var(--gold-primary)' }}
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stylist Showcase */}
      {stylists.length > 0 && (
        <section style={{ background: 'var(--bg-secondary)', padding: '6rem 2rem' }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', textAlign: 'center', marginBottom: '3rem' }}>Our Certified Master Stylists</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              {stylists.map((stylist) => (
                <div 
                  key={stylist.id} 
                  className={`stylist-card-select ${selectedStylist?.id === stylist.id ? 'selected' : ''}`}
                  onClick={() => setSelectedStylist(stylist)}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-secondary)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--gold-primary)' }}>✂️</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>{stylist.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{stylist.specialty}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking Form Scheduler */}
      <section id="booking-form-start" className="container" style={{ padding: '8rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'start' }}>
          
          {/* Summary */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Secure Your Appointment</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Complete the booking form. We will record the details and notify the salon owner instantly via Telegram Bot.</p>

            <div className="booking-box" style={{ border: '1px solid var(--border-gold)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--gold-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Selected Service Summary</h3>
              {selectedService ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Service:</span> <strong>{selectedService.title}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Stylist:</span> <strong>{selectedStylist ? selectedStylist.name : 'Any available stylist'}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Date:</span> <strong>{selectedDate ? formatDate(selectedDate) : '-'}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Time:</span> <strong>{selectedTime ? selectedTime : '-'}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <span>Total Price:</span> <strong>₹{selectedService.price}</strong>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Please click on "Select" on any service above to populate your summary card.</p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitBooking} className="booking-box" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Select Service *</label>
              <select 
                value={selectedService?.id || ''} 
                onChange={(e) => setSelectedService(services.find(s => s.id === e.target.value))}
                required
              >
                <option value="" disabled>Choose a service</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.title} (₹{s.price})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Select Stylist *</label>
              <select 
                value={selectedStylist?.id || ''} 
                onChange={(e) => setSelectedStylist(stylists.find(st => st.id === e.target.value))}
                required
              >
                <option value="" disabled>Choose a stylist</option>
                {stylists.map(st => <option key={st.id} value={st.id}>{st.name} ({st.specialty})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Choose Date *</label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]} 
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
                required 
              />
            </div>

            <div className="form-group">
              <label>Available Hours *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '0.5rem' }}>
                {selectedDate ? (
                  TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`slot-btn ${selectedTime === slot ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <p style={{ gridColumn: '1/-1', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Please pick a date first to render time slots.</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input 
                type="text" 
                placeholder="E.g., Ramesh Kumar" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input 
                type="tel" 
                placeholder="E.g., +91 98765 43210" 
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Special Requests (Optional)</label>
              <textarea 
                placeholder="Details or allergies..." 
                rows="2" 
                value={customerNotes} 
                onChange={(e) => setCustomerNotes(e.target.value)} 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-theme btn-block" 
              style={{ padding: '1rem' }}
              disabled={submitLoading}
            >
              {submitLoading ? 'Sending Appointment Request...' : 'Book Royal Appointment'}
            </button>
          </form>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--gold-primary)', borderRadius: 'var(--border-radius-md)', padding: '3rem 2.5rem', maxWidth: '460px', width: '100%', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>✓</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', margin: '1rem 0' }}>Booking Request Sent!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Your appointment request was saved. The salon owner has been notified via Telegram.
            </p>
            <button onClick={() => setShowSuccessModal(false)} className="btn btn-gold btn-block">Done</button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid #ff4d4d', borderRadius: 'var(--border-radius-md)', padding: '3rem 2.5rem', maxWidth: '460px', width: '100%', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', color: '#ff4d4d' }}>⚠️</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', margin: '1rem 0' }}>Booking Failed</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              We could not process your booking. Please try again or contact the salon directly.
            </p>
            <button onClick={() => setShowErrorModal(false)} className="btn btn-outline btn-block" style={{ color: 'var(--text-primary)' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
