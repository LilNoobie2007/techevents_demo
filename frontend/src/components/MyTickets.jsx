import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import './App.css';
import ThemeToggle from './ThemeToggle';

export default function MyTickets() {
  const [email, setEmail] = useState('');
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setHasSearched(true);
    
    try {
      const response = await axios.post('http://localhost/techevents_demo/backend/get_my_tickets.php', { email });
      
      if (response.data.status === 'success') {
        setTickets(response.data.tickets);
        if (response.data.tickets.length === 0) {
          setMessage("No tickets found for this email address.");
        }
      } else {
        setMessage(response.data.message || "Failed to retrieve tickets.");
        setTickets([]);
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };
// Inside MyTickets.jsx return
return (
  <div className="public-font" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
    <header className="sleek-nav">
      <h2 style={{ margin: 0 }}>Tech Events</h2>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <ThemeToggle />
        <Link to="/" className="nav-btn">Home</Link>
      </div>
    </header>

    {/* RECTIFIED: flex: '1 0 auto' keeps footer at bottom */}
    <main style={{ flex: '1 0 auto', padding: '60px 20px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Retrieve Entry Passes</h1>
      <div className="glass-card" style={{ padding: '35px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '20px' }}>
          <input type="email" placeholder="Search by email" value={email} onChange={e => setEmail(e.target.value)} required className="minimal-input" style={{ flex: 1 }} />
          <button type="submit" className="primary-btn">Search</button>
        </form>
      </div>

      <div style={{ marginTop: '40px', display: 'grid', gap: '20px' }}>
        {tickets.map((t, i) => (
          <div key={i} className="glass-card" style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <div style={{ background: '#fff', padding: '12px', borderRadius: '10px' }}>
              <QRCodeSVG value={`TICKET-ID: ${t.id} | GUEST: ${t.name}`} size={120} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{t.event_title}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{t.name} • Pass #{t.id}</p>
            </div>
          </div>
        ))}
      </div>
    </main>

    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand"><h3>Tech Events</h3><p>Public Portal</p></div>
        <div className="footer-links">
           <h4 className="footer-heading">Support</h4>
           <a href="mailto:makwanakevin25@gmail.com">Contact Us</a>
        </div>
      </div>
    </footer>
  </div>
);
}