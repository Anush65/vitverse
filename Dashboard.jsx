import React, { useEffect, useMemo, useState } from 'react';
import ServiceCard from '../components/ServiceCard';
import { getDashboardData } from '../services/dashboardProfileApi';
import './DashboardProfile.css';

const services = [
  { id: 'bus', icon: '🚌', title: 'Shuttle Bus Booking', description: 'Check seats and manage your campus shuttle booking.', start: 12, end: 14, meta: 'Booking window: 1:00 PM onwards' },
  { id: 'canteen', icon: '🍽️', title: 'Canteen Service', description: 'Browse menus and check current ordering availability.', start: 9, end: 16 },
  { id: 'marketplace', icon: '🛍️', title: 'Student Marketplace', description: 'Find student listings or post an item for sale.' },
  { id: 'notices', icon: '📣', title: 'Notices & Updates', description: 'Keep track of campus announcements and deadlines.', meta: 'Check for new notices' },
];

function servicePriority(service, hour) {
  if (service.id === 'bus' && hour >= 12 && hour < 14) return 0;
  if (service.id === 'canteen' && hour >= 9 && hour < 16) return 1;
  if (service.id === 'notices') return 2;
  return 3;
}

export default function Dashboard({ user, onNavigate = () => {} }) {
  const [now, setNow] = useState(new Date());
  const [data, setData] = useState({ notices: [], profile: null, busAvailability: null });
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    getDashboardData().then((result) => { if (active) setData((old) => ({ ...old, ...result })); })
      .catch(() => { if (active) setLoadError('Live dashboard data is not connected yet. Showing service shortcuts.'); });
    return () => { active = false; };
  }, []);

  const sortedServices = useMemo(() => [...services].sort((a, b) => servicePriority(a, now.getHours()) - servicePriority(b, now.getHours())), [now]);
  const displayName = user?.name || user?.fullName || data.profile?.name || 'Student';
  const notices = data.notices || [];

  return (
    <main className="vp-page">
      <header className="vp-topbar">
        <div className="vp-clock"><strong>{now.toLocaleTimeString('en-IN', { hour12: false })}</strong><span>{now.toLocaleDateString('en-GB')}</span></div>
        <h1>VITVERSE</h1>
        <button className="vp-menu-button" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>☰</button>
      </header>

      {menuOpen && <nav className="vp-menu">
        <button onClick={() => onNavigate('marketplace')}>Student Marketplace</button>
        <button onClick={() => onNavigate('canteen')}>Canteen Service</button>
        <button onClick={() => onNavigate('bus')}>Shuttle Bus Booking</button>
        <button onClick={() => onNavigate('notices')}>Notices <span className="vp-new">NEW</span></button>
        <button onClick={() => onNavigate('profile')}>Profile</button>
      </nav>}

      <div className="vp-dashboard-grid">
        <section className="vp-main-panel">
          <div className="vp-section-heading"><div><p className="vp-eyebrow">YOUR CAMPUS, CONNECTED</p><h2>Welcome back, {displayName}</h2></div><span className="vp-date-chip">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</span></div>
          {loadError && <p className="vp-muted" role="status">{loadError}</p>}
          <div className="vp-services-list">
            {sortedServices.map((service, index) => <ServiceCard key={service.id} {...service} featured={index === 0} meta={service.id === 'bus' && data.busAvailability != null ? `${data.busAvailability} seats currently available` : service.meta} onClick={() => onNavigate(service.id)} />)}
          </div>
        </section>

        <aside className="vp-side-panel">
          <section className="vp-profile-summary">
            <div className="vp-avatar">{(displayName[0] || 'S').toUpperCase()}</div>
            <p className="vp-eyebrow">STUDENT PROFILE</p><h2>{displayName}</h2>
            <p>{user?.registerNumber || user?.regNo || data.profile?.registerNumber || 'Register number not added'}</p>
            <button className="vp-button vp-button--primary" onClick={() => onNavigate('profile')}>View profile</button>
          </section>
          <section className="vp-notifications">
            <div className="vp-notifications-title"><h2>Notifications</h2><span>{notices.length}</span></div>
            {notices.length ? notices.slice(0, 5).map((notice, i) => <article className="vp-notice" key={notice._id || notice.id || i}><strong>{notice.title || notice.heading || 'Campus update'}</strong><p>{notice.message || notice.description || ''}</p>{notice.date && <small>{new Date(notice.date).toLocaleDateString('en-IN')}</small>}</article>) : <p className="vp-muted">Feedback deadlines, NPTEL updates, internships and campus announcements will appear here when connected to the notices API.</p>}
            <button className="vp-text-button" onClick={() => onNavigate('notices')}>View all notices →</button>
          </section>
        </aside>
      </div>
    </main>
  );
}
