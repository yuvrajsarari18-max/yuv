'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to manage your salon bookings and services.</p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                placeholder="E.g., owner@gmail.com" 
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
                placeholder="••••••••" 
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
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            New to L'Étoile? <Link href="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
