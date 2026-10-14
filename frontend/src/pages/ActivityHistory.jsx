import React, { useEffect, useState } from 'react';
import { getMyHistory, getMyProfile } from '../services/dashboardProfileApi';
import './ActivityHistory.css';

const dateString = (date) => date.toISOString().slice(0, 10);
const today = dateString(new Date());
const monthAgo = (() => { const d = new Date(); d.setDate(d.getDate() - 30); return dateString(d); })();

export default function Profile({ initialUser, onBack = () => {} }) {
  const [profile, setProfile] = useState(initialUser || null);
  const [history, setHistory] = useState([]);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [type, setType] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getMyProfile(), getMyHistory(from, to)])
      .then(([p, h]) => { if (active) { setProfile(p?.profile || p?.user || p); setHistory(Array.isArray(h) ? h : (h?.items || h?.history || [])); setError(''); } })
      .catch(() => { if (active) setError('Profile/history API is not connected yet. The page is ready for backend integration.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [from, to]);

  const filteredHistory = history.filter((item) => type === 'all' || (item.type || item.service || '').toLowerCase().includes(type));
  const fullName = profile?.name || profile?.fullName || 'Student';
  const avatar = profile?.photoUrl || profile?.profilePhoto || profile?.avatar;
  const historyLabel = (item) => item.title || item.description || item.details || `${item.type || item.service || 'Activity'} activity`;
  const historyDate = (item) => item.createdAt || item.date || item.timestamp;

  return <main className="vp-page vp-profile-page">
    <header className="vp-topbar"><button className="vp-back-button" onClick={onBack}>← Back</button><h1>MY PROFILE</h1><span /></header>
    {error && <p className="vp-alert" role="status">{error}</p>}
    <section className="vp-profile-hero">
      {avatar ? <img className="vp-avatar vp-avatar--large" src={avatar} alt={`${fullName} profile`} /> : <div className="vp-avatar vp-avatar--large">{fullName[0]?.toUpperCase() || 'S'}</div>}
      <div><p className="vp-eyebrow">VITVERSE STUDENT</p><h2>{fullName}</h2><p>{profile?.email || profile?.vitEmail || 'VIT email not added'}</p></div>
    </section>
    <section className="vp-info-section"><h2>Student details</h2><div className="vp-info-grid">
      <Info label="Register number" value={profile?.registerNumber || profile?.regNo} />
      <Info label="VIT email" value={profile?.vitEmail || profile?.email} />
      <Info label="Program" value={profile?.program || profile?.degree} />
      <Info label="Branch" value={profile?.branch || profile?.specialization} />
      <Info label="School" value={profile?.schoolName || profile?.school} />
      <Info label="Frequent bus route" value={profile?.frequentBusRoute || profile?.mostFrequentRoute} />
      {(profile?.residentialType === 'hostel' || profile?.isHosteller || profile?.hostelBlock) && <Info label="Hostel block" value={profile?.hostelBlock || profile?.hostel?.block} />}
    </div></section>
    <section className="vp-info-section vp-history-section"><div className="vp-history-heading"><div><p className="vp-eyebrow">YOUR ACTIVITY</p><h2>App History</h2></div><span className="vp-muted">{filteredHistory.length} items</span></div>
      <div className="vp-history-filters"><label>From <input type="date" value={from} max={to || today} onChange={(e) => setFrom(e.target.value)} /></label><label>To <input type="date" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} /></label><label>Service <select value={type} onChange={(e) => setType(e.target.value)}><option value="all">All services</option><option value="bus">Bus bookings</option><option value="canteen">Canteen orders</option><option value="marketplace">Marketplace</option></select></label></div>
      {loading ? <p className="vp-muted">Loading history…</p> : filteredHistory.length ? <div className="vp-history-list">{filteredHistory.sort((a, b) => new Date(historyDate(b) || 0) - new Date(historyDate(a) || 0)).map((item, i) => <article className="vp-history-item" key={item._id || item.id || i}><span className="vp-history-dot" /><div><strong>{historyLabel(item)}</strong><p>{item.route || item.destination || item.itemName || item.orderSummary || item.details || ''}</p><small>{historyDate(item) ? new Date(historyDate(item)).toLocaleString('en-IN') : 'Date unavailable'}</small></div><span className="vp-history-type">{item.type || item.service || 'Activity'}</span></article>)}</div> : <div className="vp-empty-state"><span>▤</span><h3>No activity for this period</h3><p>Bus bookings, canteen orders and marketplace activity will appear here.</p></div>}
    </section>
  </main>;
}

function Info({ label, value }) { return <div className="vp-info-field"><span>{label}</span><strong>{value || 'Not available'}</strong></div>; }
