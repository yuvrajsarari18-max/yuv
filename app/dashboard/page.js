'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'services', 'stylists', 'settings'
  
  // Data State
  const [salon, setSalon] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);

  // Form inputs
  const [serviceForm, setServiceForm] = useState({ title: '', description: '', price: '', category: 'hair' });
  const [stylistForm, setStylistForm] = useState({ name: '', specialty: '' });
  const [settingsForm, setSettingsForm] = useState({ name: '', telegram_token: '', telegram_chat_id: '', theme_color: 'gold' });
  
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Auth & Data Fetching
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      setErrorMsg('');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Fetch Salon profile
        const { data: salonData, error: salonErr } = await supabase
          .from('salons')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (salonErr) throw salonErr;
        setSalon(salonData);
        setSettingsForm({
          name: salonData.name,
          telegram_token: salonData.telegram_token || '',
          telegram_chat_id: salonData.telegram_chat_id || '',
          theme_color: salonData.theme_color || 'gold'
        });

        // Fetch dependent data
        await fetchSalonDetails(salonData.id);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setErrorMsg("Failed to load dashboard data. Please try logging in again.");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, []);

  const fetchSalonDetails = async (salonId) => {
    // 1. Bookings (joined with service and stylist titles)
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*, services(title), stylists(name)')
      .eq('salon_id', salonId)
      .order('booking_date', { ascending: false });
    setBookings(bookingsData || []);

    // 2. Services
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: true });
    setServices(servicesData || []);

    // 3. Stylists
    const { data: stylistsData } = await supabase
      .from('stylists')
      .select('*')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: true });
    setStylists(stylistsData || []);
  };

  // --- CRUD Actions ---

  // Add Service
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceForm.title || !serviceForm.price) return;
    setActionLoading(true);

    try {
      const { data, error } = await supabase.from('services').insert({
        salon_id: salon.id,
        title: serviceForm.title,
        description: serviceForm.description,
        price: parseFloat(serviceForm.price),
        category: serviceForm.category
      }).select();

      if (error) throw error;
      setServices([...services, ...data]);
      setServiceForm({ title: '', description: '', price: '', category: 'hair' });
    } catch (err) {
      alert("Error adding service: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Service
  const handleDeleteService = async (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      setServices(services.filter(s => s.id !== id));
    } catch (err) {
      alert("Error deleting service: " + err.message);
    }
  };

  // Add Stylist
  const handleAddStylist = async (e) => {
    e.preventDefault();
    if (!stylistForm.name) return;
    setActionLoading(true);

    try {
      const { data, error } = await supabase.from('stylists').insert({
        salon_id: salon.id,
        name: stylistForm.name,
        specialty: stylistForm.specialty
      }).select();

      if (error) throw error;
      setStylists([...stylists, ...data]);
      setStylistForm({ name: '', specialty: '' });
    } catch (err) {
      alert("Error adding stylist: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Stylist
  const handleDeleteStylist = async (id) => {
    if (!confirm("Are you sure you want to delete this stylist?")) return;
    try {
      const { error } = await supabase.from('stylists').delete().eq('id', id);
      if (error) throw error;
      setStylists(stylists.filter(s => s.id !== id));
    } catch (err) {
      alert("Error deleting stylist: " + err.message);
    }
  };

  // Update Settings
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('salons')
        .update({
          name: settingsForm.name,
          telegram_token: settingsForm.telegram_token,
          telegram_chat_id: settingsForm.telegram_chat_id,
          theme_color: settingsForm.theme_color
        })
        .eq('id', salon.id);

      if (error) throw error;
      setSalon({ ...salon, ...settingsForm });
      alert("Settings updated successfully!");
    } catch (err) {
      alert("Error updating settings: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Log Out
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading Dashboard Panel...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <p className="error-banner">{errorMsg}</p>
        <button onClick={() => router.push('/login')} className="btn btn-gold">Back to Login</button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Top Header */}
      <header className="header">
        <div className="container header-inner">
          <Link href="/dashboard" className="logo">
            <span className="logo-main">{salon?.name || "SALON OWNER"}</span>
            <span className="logo-sub">DASHBOARD PANEL</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Link: <a href={`/s/${salon?.slug}`} target="_blank" className="text-gold" style={{ textDecoration: 'underline' }}>/s/{salon?.slug}</a>
            </span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">Log Out</button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <button 
            className={`sidebar-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            🗓️ Bookings ({bookings.length})
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            💇‍♂️ Services ({services.length})
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'stylists' ? 'active' : ''}`}
            onClick={() => setActiveTab('stylists')}
          >
            ✂️ Stylists ({stylists.length})
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings & Alert
          </button>
        </aside>

        {/* Content Panel */}
        <main className="dashboard-content">
          {/* TAB 1: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div>
              <div className="dashboard-header">
                <h2>Customer Bookings Log</h2>
              </div>
              
              {bookings.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>
                  No bookings found for your salon yet. Share your booking link with customers: <br />
                  <Link href={`/s/${salon.slug}`} target="_blank" className="text-gold">/s/{salon.slug}</Link>
                </p>
              ) : (
                <div className="table-container">
                  <table className="bookings-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Stylist</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>
                            <strong>{booking.customer_name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                              {booking.customer_phone}
                            </div>
                          </td>
                          <td>
                            <span className="badge">{booking.services?.title || 'Unknown Service'}</span>
                          </td>
                          <td>{booking.stylists?.name || 'Any Stylist'}</td>
                          <td>{new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td><strong>{booking.booking_time}</strong></td>
                          <td><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{booking.notes || '-'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SERVICES */}
          {activeTab === 'services' && (
            <div>
              <div className="dashboard-header">
                <h2>Manage Salon Services</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', alignItems: 'start' }}>
                {/* Form to Add */}
                <form onSubmit={handleAddService} className="dashboard-form dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <h3>Add New Service</h3>
                  <div className="form-group">
                    <label>Title *</label>
                    <input 
                      type="text" 
                      placeholder="E.g., Beard Grooming" 
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      placeholder="Brief details about service..." 
                      rows="2"
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (INR) *</label>
                    <input 
                      type="number" 
                      placeholder="Price in ₹" 
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    >
                      <option value="hair">Hair Styling</option>
                      <option value="grooming">Royal Grooming</option>
                      <option value="spa">Facial & Spa</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-gold btn-block" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : 'Add Service'}
                  </button>
                </form>

                {/* List of Services */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3>Current Service Menu</h3>
                  {services.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No services added yet. Please add your first service.</p>
                  ) : (
                    services.map((item) => (
                      <div key={item.id} className="dash-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '1.1rem' }}>{item.title}</strong>
                          <span className="badge" style={{ marginLeft: '1rem' }}>{item.category}</span>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{item.description || "No description"}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                          <span style={{ fontSize: '1.2rem', color: 'var(--gold-primary)', fontWeight: '600' }}>₹{item.price}</span>
                          <button onClick={() => handleDeleteService(item.id)} className="btn btn-danger btn-sm">Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STYLISTS */}
          {activeTab === 'stylists' && (
            <div>
              <div className="dashboard-header">
                <h2>Manage Stylists & Staff</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', alignItems: 'start' }}>
                {/* Form to Add */}
                <form onSubmit={handleAddStylist} className="dashboard-form dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <h3>Add New Stylist</h3>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="E.g., Vikram Singh" 
                      value={stylistForm.name}
                      onChange={(e) => setStylistForm({ ...stylistForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Specialty</label>
                    <input 
                      type="text" 
                      placeholder="E.g., Beard Beard Artist" 
                      value={stylistForm.specialty}
                      onChange={(e) => setStylistForm({ ...stylistForm, specialty: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-gold btn-block" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : 'Add Stylist'}
                  </button>
                </form>

                {/* List of Stylists */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3>Our Styling Experts</h3>
                  {stylists.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No stylists added yet. Add staff to allow customers to choose them.</p>
                  ) : (
                    stylists.map((item) => (
                      <div key={item.id} className="dash-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '1.1rem' }}>{item.name}</strong>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Specialty: {item.specialty || 'General Hairstyling'}</p>
                        </div>
                        <button onClick={() => handleDeleteStylist(item.id)} className="btn btn-danger btn-sm">Delete</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div>
              <div className="dashboard-header">
                <h2>Settings & Telegram configuration</h2>
              </div>

              <form onSubmit={handleUpdateSettings} className="dashboard-form dash-card" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Salon Profile Name</label>
                  <input 
                    type="text" 
                    value={settingsForm.name} 
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Telegram Bot Token</label>
                  <input 
                    type="text" 
                    placeholder="E.g., 8980904922:AAErbkPkx..." 
                    value={settingsForm.telegram_token} 
                    onChange={(e) => setSettingsForm({ ...settingsForm, telegram_token: e.target.value })} 
                  />
                  <small style={{ color: 'var(--text-muted)' }}>Get this from `@BotFather` on Telegram.</small>
                </div>

                <div className="form-group">
                  <label>Telegram Chat ID</label>
                  <input 
                    type="text" 
                    placeholder="E.g., 5670073360" 
                    value={settingsForm.telegram_chat_id} 
                    onChange={(e) => setSettingsForm({ ...settingsForm, telegram_chat_id: e.target.value })} 
                  />
                  <small style={{ color: 'var(--text-muted)' }}>Get this by sending any message to `@userinfobot` on Telegram.</small>
                </div>

                <div className="form-group">
                  <label>Theme Style Layout</label>
                  <select 
                    value={settingsForm.theme_color} 
                    onChange={(e) => setSettingsForm({ ...settingsForm, theme_color: e.target.value })}
                  >
                    <option value="gold">Luxury Noir (Gold & Dark)</option>
                    <option value="green">Natural Harmony (Beige & Forest Green)</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-gold" disabled={actionLoading}>
                  {actionLoading ? 'Updating settings...' : 'Save Settings'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
