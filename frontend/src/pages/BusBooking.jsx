import { useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import './BusBooking.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const ROUTES = [
  { name: 'Alandur Metro', buses: 5 },
  { name: 'Sholinganallur', buses: 4 },
  { name: 'Velachery', buses: 4 },
];
const token = () => localStorage.getItem('token') || localStorage.getItem('authToken') || '';
const todayIST = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}/api/bus-booking${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}), ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}
function localMinutes(date) {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date).split(':').map(Number);
  return h * 60 + m;
}

export default function BusBooking() {
  const [availability, setAvailability] = useState(null);
  const [booking, setBooking] = useState(null);
  const [route, setRoute] = useState('Alandur Metro');
  const [busNumber, setBusNumber] = useState(1);
  const [seatId, setSeatId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [clock, setClock] = useState(Date.now());

  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([api(`/availability?date=${todayIST()}`), api('/mine')]);
      setAvailability(a); setBooking(b.booking); setError('');
      if (b.booking) { setRoute(b.booking.route); setBusNumber(b.booking.busNumber); setSeatId(b.booking.seatId); }
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = window.setInterval(() => setClock(Date.now()), 15000); return () => window.clearInterval(id); }, []);

  const minutes = localMinutes(new Date(clock));
  const bookingOpen = minutes >= 780 && minutes < 810;
  const editOpen = minutes >= 780 && minutes < 800;
  const selectedRoute = availability?.routes?.find(r => r.route === route);
  const selectedBus = selectedRoute?.buses?.find(b => b.busNumber === Number(busNumber));
  const occupied = useMemo(() => new Set(selectedBus?.occupiedSeats || []), [selectedBus]);
  const busCount = selectedRoute?.busCount || ROUTES.find(r => r.name === route).buses;
  const canChoose = booking ? editOpen : bookingOpen;

  function chooseRoute(name) { setRoute(name); setBusNumber(1); setSeatId(''); }
  function chooseBus(number) { setBusNumber(Number(number)); setSeatId(''); }

  async function saveBooking() {
    setBusy(true); setError(''); setNotice('');
    try {
      if (!seatId) throw new Error('Choose a seat before confirming.');
      const result = booking
        ? await api(`/${booking.id}`, { method: 'PATCH', body: JSON.stringify({ route, busNumber: Number(busNumber), seatId }) })
        : await api('/', { method: 'POST', body: JSON.stringify({ serviceDate: todayIST(), route, busNumber: Number(busNumber), seatId }) });
      setBooking(result.booking);
      setNotice(booking ? 'Booking updated. A notice has been added to your Notices page.' : 'Seat confirmed! Your booking confirmation has been added to Notices.');
      await load();
    } catch (e) { setError(e.message); await load(); }
    finally { setBusy(false); }
  }
  async function cancelBooking() {
    if (!booking || !window.confirm('Cancel your bus booking?')) return;
    setBusy(true); setError(''); setNotice('');
    try { const result = await api(`/${booking.id}`, { method: 'DELETE' }); setBooking(null); setSeatId(''); setNotice(`${result.message} A cancellation notice has been created.`); await load(); }
    catch (e) { setError(e.message); await load(); }
    finally { setBusy(false); }
  }

  return <AppLayout><main className="bus-page">
    <header className="bus-heading"><div><p className="bus-eyebrow">VITVERSE · CAMPUS TRANSPORT</p><h1>Bus Booking</h1><p className="bus-subtitle">Reserve one seat for today's 1:45 PM departure.</p></div><div className="bus-departure"><span>DEPARTURE</span><strong>1:45 PM</strong><small>Every day · Sharp</small></div></header>
    <section className="bus-rules"><div><i className="dot open"/><b>1:00 PM</b><small>Booking opens</small></div><div><i className="dot edit"/><b>1:20 PM</b><small>Edit / cancel closes</small></div><div><i className="dot close"/><b>1:30 PM</b><small>Booking closes</small></div></section>
    {error && <div className="bus-alert error" role="alert">{error}</div>}{notice && <div className="bus-alert success" role="status">{notice}</div>}

    {booking && <section className="current-booking"><div className="current-top"><div><span className="status">CONFIRMED</span><h2>Your seat is reserved</h2></div><strong className="seat-pill">{booking.seatId}</strong></div><p><b>{booking.route}</b> · Bus {booking.busNumber} · {booking.serviceDate}</p><div className="boarding-code"><div className="fake-qr" aria-hidden="true">{Array.from({ length: 100 }, (_, i) => <i key={i} style={{ opacity: ((i * 13 + i * i * 7) % 11) > 4 ? 1 : 0.08 }}/>)}</div><div><small>BOOKING REFERENCE</small><strong>{booking.bookingCode}</strong><p>At boarding, the campus biometric system must verify your identity. This code is not biometric authentication.</p></div></div></section>}

    <section className="bus-card"><div className="section-title"><div><span className="step">01</span><h2>{booking ? 'Edit your booking' : 'Choose your route'}</h2></div><span className="date-chip">{todayIST()}</span></div>
      <div className="route-grid">{ROUTES.map(item => { const data = availability?.routes?.find(r => r.route === item.name); const remaining = data ? data.buses.reduce((sum, b) => sum + b.availableSeats, 0) : item.buses * 60; return <button type="button" key={item.name} className={`route-card ${route === item.name ? 'selected' : ''}`} onClick={() => chooseRoute(item.name)}><span className="route-icon">↗</span><strong>{item.name}</strong><small>{item.buses} buses · 60 seats each</small><em>{remaining} seats available</em></button>; })}</div>
      <div className="section-title subsection"><div><span className="step">02</span><h2>Select a bus</h2></div></div><div className="bus-number-row">{Array.from({ length: busCount }, (_, i) => { const n = i + 1; const b = selectedRoute?.buses?.find(x => x.busNumber === n); return <button type="button" key={n} className={`bus-number ${Number(busNumber) === n ? 'selected' : ''}`} onClick={() => chooseBus(n)}><b>Bus {n}</b><small>{b ? `${b.availableSeats}/60 seats` : '60 seats'}</small></button>; })}</div>
      <div className="section-title subsection"><div><span className="step">03</span><h2>Pick your seat</h2></div><span className="muted">60 seats · 12 rows</span></div><div className="legend"><span><i className="available"/>Available</span><span><i className="chosen"/>Selected</span><span><i className="taken"/>Booked</span></div>
      <div className="bus-layout"><div className="driver">FRONT · DRIVER</div><div className="column-labels"><span>LEFT · 2 SEATS</span><span>RIGHT · 3 SEATS</span></div>{Array.from({ length: 12 }, (_, i) => { const row = i + 1; const ids = [`L${row}-1`, `L${row}-2`, `R${row}-1`, `R${row}-2`, `R${row}-3`]; return <div className="seat-row" key={row}><span className="row-num">{String(row).padStart(2, '0')}</span><div className="seat-group two">{ids.slice(0, 2).map(id => seatButton(id))}</div><span className="aisle">AISLE</span><div className="seat-group three">{ids.slice(2).map(id => seatButton(id))}</div></div>; })}<div className="rear">REAR</div></div>
      <div className="selection-summary"><div><small>YOUR SELECTION</small><b>{seatId || 'No seat selected'}</b><span>{route} · Bus {busNumber} · 1:45 PM</span></div><button className="confirm-button" type="button" disabled={!canChoose || !seatId || busy} onClick={saveBooking}>{busy ? 'Please wait…' : booking ? 'Save changes' : 'Confirm booking'}</button></div>
      {!booking && !bookingOpen && <p className="muted">Booking confirmation is available daily from 1:00 PM to 1:30 PM IST. Server-side checks enforce this window.</p>}{booking && !editOpen && <p className="muted">Route edits and cancellation close at 1:20 PM IST. Your existing booking remains active.</p>}
    </section>
    {booking && <div className="cancel-row"><div><b>Need to cancel?</b><span>Available only before 1:20 PM IST.</span></div><button type="button" className="cancel-button" disabled={!editOpen || busy} onClick={cancelBooking}>Cancel booking</button></div>}
    <section className="biometric-note"><span>⌁</span><div><b>Secure boarding</b><p>Your reservation is linked to your student account. At the bus, the campus biometric device must verify your identity. Real biometric verification requires integration with the campus device/vendor API.</p></div></section><button className="refresh-button" type="button" onClick={load}>↻ Refresh seat availability</button>
  </main></AppLayout>;

  function seatButton(id) {
    const isTaken = occupied.has(id) && id !== booking?.seatId;
    const isSelected = seatId === id;
    return <button type="button" key={id} title={id} aria-label={`${id}${isTaken ? ', booked' : ''}`} disabled={isTaken || !canChoose} className={`seat ${isTaken ? 'taken' : isSelected ? 'chosen' : 'available'}`} onClick={() => setSeatId(id)}>{id.split('-')[1]}</button>;
  }
}
