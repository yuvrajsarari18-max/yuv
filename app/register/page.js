'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [salonName, setSalonName] = useState('');
  const [salonSlug, setSalonSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSlugChange = (val) => {
    // Replace spaces/special chars with hyphens, convert to lowercase
    const formatted = val.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    setSalonSlug(formatted);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !salonName || !salonSlug) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // 1. Sign up the user in Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("Could not create user account.");

      // 2. Insert the Salon details into the salons table
      const { error: dbError } = await supabase.from('salons').insert({
        owner_id: user.id,
        name: salonName,
        slug: salonSlug,
        theme_color: 'gold'
      });

      if (dbError) {
        // If inserting salon config fails, we should notify them (e.g. slug already taken)
        if (dbError.code === '23505') {
          throw new Error("This Salon URL Link is already taken. Please choose another slug.");
        }
        throw dbError;
      }

      // 3. Navigate to the dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="logo">
            <span className="logo-main">L'ÉTOILE</span>
            <span className="logo-sub">SaaS PLATFORM</span>
          </Link>
        </div>
      </header>

      <div className="auth-wrapper">
        <div className="auth-card">
          <h2 className="auth-title">Register Your Salon</h2>
          <p className="auth-subtitle">Launch your premium client booking portal in minutes.</p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="salonName">Salon Name</label>
              <input 
                type="text" 
                id="salonName" 
                placeholder="E.g., Royal Style Barbers" 
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="salonSlug">Salon URL Link Slug</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '0.85rem', 
                  marginRight: '0.25rem',
                  whiteSpace: 'nowrap'
                }}>/s/</span>
                <input 
                  type="text" 
                  id="salonSlug" 
                  placeholder="royal-style" 
                  value={salonSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                placeholder="owner@domain.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                placeholder="At least 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-gold btn-block" 
              disabled={loading}
            >
              {loading ? 'Creating Salon Profile...' : 'Register and Setup'}
            </button>
          </form>

          <p className="auth-switch">
            Already have a salon account? <Link href="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
