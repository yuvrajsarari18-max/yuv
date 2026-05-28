import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="logo">
            <span className="logo-main">L'ÉTOILE</span>
            <span className="logo-sub">SaaS PLATFORM</span>
          </Link>
          <nav className="nav-links">
            <Link href="/login" className="btn btn-outline btn-sm">Sign In</Link>
            <Link href="/register" className="btn btn-gold btn-sm">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '8rem 2rem 5rem',
        textAlign: 'center',
        background: 'linear-gradient(to bottom, #0d0d0d 0%, #050505 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.03)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{
            fontSize: '0.8rem',
            letterSpacing: '0.3em',
            color: '#d4af37',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>Launch Your Online Booking Portal</span>
          
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '3.5rem',
            margin: '1.5rem 0',
            lineHeight: '1.2'
          }}>
            Give Your Salon a <span className="text-gold">Premium</span> Digital Experience
          </h1>
          
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.15rem',
            marginBottom: '3rem',
            fontWeight: '300'
          }}>
            Set up a gorgeous booking page for your salon in 2 minutes. Let customers schedule bookings online and receive instant details directly on your Telegram app for free.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link href="/register" className="btn btn-gold">Create Your Salon Profile</Link>
            <Link href="/login" className="btn btn-outline">Manage Dashboard</Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '6rem 2rem', background: '#0a0a0a' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem' }}>Everything You Need to Run Your Salon Online</h2>
            <div style={{ width: '50px', height: '2px', background: 'var(--gold-primary)', margin: '1rem auto' }}></div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem'
          }}>
            {/* Feature 1 */}
            <div style={{
              background: '#121212',
              padding: '2.5rem',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1.5rem' }}>✨</span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '0.8rem', color: '#d4af37' }}>
                Bespoke Luxury Design
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                A pre-styled dark-gold visual theme that matches the high-end standard of your salon, loaded automatically for your clients.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              background: '#121212',
              padding: '2.5rem',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1.5rem' }}>🔔</span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '0.8rem', color: '#d4af37' }}>
                Free Telegram Alerts
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Never pay for expensive SMS notifications. Integrate your custom Telegram bot and get booking alerts instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              background: '#121212',
              padding: '2.5rem',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1.5rem' }}>💼</span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '0.8rem', color: '#d4af37' }}>
                Business Management Panel
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Add your custom services, edit prices, list your barbers/stylists, and view your appointments log in a clean, unified dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-light)',
        padding: '3rem 2rem',
        textAlign: 'center',
        background: '#070707',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <p>&copy; 2026 L'Étoile SaaS Platform. All Rights Reserved. Built for high-end styling centers.</p>
      </footer>
    </div>
  );
}
