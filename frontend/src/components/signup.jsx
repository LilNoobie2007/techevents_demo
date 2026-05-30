import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import ThemeToggle from './ThemeToggle';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', organization: '', adminType: 'College' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost/techevents_demo/backend/signup.php', formData);
      if (response.data.status === 'success') { 
        setMessage("OTP Sent! Redirecting..."); 
        setTimeout(() => navigate('/login'), 2000); 
      } else { setMessage(response.data.message); }
    } catch (error) { setMessage("Registration failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-font" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <header className="sleek-nav">
        <h2 style={{ margin: 0, fontWeight: '400' }}>Tech Events</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <ThemeToggle />
          <Link to="/login" className="nav-btn">Login</Link>
        </div>
      </header>

      {/* RECTIFIED: Centered Form Container */}
      <main style={{ flex: '1 0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 20px' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '45px' }}>
          <h1 style={{ textAlign: 'center', fontWeight: '400', marginBottom: '35px' }}>Partner Signup</h1>
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="minimal-label">Legal Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="minimal-input" />
              </div>
              <div>
                <label className="minimal-label">Entity Type</label>
                <select className="minimal-input" value={formData.adminType} onChange={e => setFormData({...formData, adminType: e.target.value})} style={{ borderBottom: '2px solid var(--card-border)' }}>
                  <option value="College">University</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>
            </div>
            <div>
              <label className="minimal-label">Organization</label>
              <input type="text" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} required className="minimal-input" />
            </div>
            <div>
              <label className="minimal-label">Official Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="minimal-input" />
            </div>
            <button type="submit" className="premium-submit-btn" disabled={loading}>
              {loading ? "Processing..." : "Initialize Registration"}
            </button>
          </form>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-brand"><h3>Tech Events</h3><p>Kevin Makwana</p></div>
          <div className="footer-links">
            <h4 className="footer-heading">Support</h4>
            <a href="mailto:makwanakevin25@gmail.com">Help Desk</a>
          </div>
        </div>
        <div className="footer-bottom">© 2026 Tech Events.</div>
      </footer>
    </div>
  );
}