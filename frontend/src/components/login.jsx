import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import ThemeToggle from './ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost/techevents_demo/backend/login.php', { email, password });
      if (response.data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else { setMessage(response.data.message || 'Invalid credentials.'); }
    } catch (error) { setMessage("Server connection failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-font" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <header className="sleek-nav">
        <h2 style={{ margin: 0, fontWeight: '400', color: 'var(--text-main)' }}>Tech Events</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <ThemeToggle />
          <Link to="/" className="nav-btn">Home</Link>
          <Link to="/signup" className="nav-btn" style={{ color: 'var(--accent)' }}>Signup</Link>
        </div>
      </header>

      <main style={{ flex: '1 0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '45px' }}>
          <h1 style={{ textAlign: 'center', fontWeight: '400', marginBottom: '10px', fontSize: '2rem' }}>Welcome Back</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '35px', fontSize: '14px' }}>Access your administrator command center.</p>
          
          {message && <div style={{ backgroundColor: 'rgba(220,53,69,0.1)', color: '#dc3545', padding: '12px', borderRadius: '6px', marginBottom: '25px', textAlign: 'center', fontSize: '13px', fontWeight: '600' }}>{message}</div>}
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="form-group">
              <label className="minimal-label">Email Identity</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="minimal-input" placeholder="admin@techevents.com" />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="minimal-label">Secure Password</label>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="minimal-input" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 0, bottom: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
            <button type="submit" className="premium-submit-btn" disabled={loading} style={{ marginTop: '10px' }}>
              {loading ? "Verifying Keys..." : "Authorize Access"}
            </button>
          </form>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h3>Tech Events</h3>
            <p>Kevin Makwana</p>
          </div>
          <div className="footer-links">
            <h4 className="footer-heading">Ecosystem</h4>
            <Link to="/">Public Dashboard</Link>
            <Link to="/my-tickets">Ticket Retrieval</Link>
          </div>
          <div className="footer-links">
            <h4 className="footer-heading">Developer</h4>
            <a href="mailto:makwanakevin25@gmail.com">Kevin Makwana</a>
          </div>
        </div>
        <div className="footer-bottom">© 2026 Tech Events. Ink Wash Palette • Mumbai, IN.</div>
      </footer>
    </div>
  );
}