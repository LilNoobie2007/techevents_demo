import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password Strength Logic
  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(score, 4);
  };
  const strengthScore = calculateStrength(newPassword);
  const strengthColors = ['#dc3545', '#ffc107', '#17a2b8', '#28a745'];

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      const res = await axios.post('http://localhost/event-management/backend/request_reset_otp.php', { email });
      if (res.data.status === 'success') {
        setMessage(res.data.message);
        setStep(2);
      } else setMessage(res.data.message);
    } catch (err) { setMessage("Server error."); }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      const res = await axios.post('http://localhost/event-management/backend/reset_password.php', { 
        email, otp, new_password: newPassword 
      });
      if (res.data.status === 'success') {
        setMessage("Password updated! Redirecting to login...");
        setTimeout(() => navigate('/login'), 2000);
      } else setMessage(res.data.message);
    } catch (err) { setMessage("Server error."); }
    setLoading(false);
  };

  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px 20px', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '40px', borderTop: '4px solid var(--accent)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--text-main)', margin: '0 0 10px 0' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {step === 1 ? "Enter your admin email to get a reset code." : "Enter the code and your new password."}
          </p>
        </div>

        {message && (
          <div style={{ padding: '15px', marginBottom: '25px', borderRadius: '8px', backgroundColor: message.includes('success') || message.includes('updated') ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)', color: message.includes('success') || message.includes('updated') ? '#28a745' : '#dc3545', textAlign: 'center', fontWeight: 'bold' }}>
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="input-label">Email Address</label>
              <input type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input-styled" />
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Sending Code..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="input-label">6-Digit Code</label>
              <input type="text" maxLength="6" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required className="form-input-styled" style={{ letterSpacing: '5px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }} />
            </div>
            
            <div style={{ position: 'relative' }}>
              <label className="input-label">New Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required className="form-input-styled" style={{ paddingRight: '45px' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '42px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
              
              {newPassword && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ height: '4px', flex: 1, backgroundColor: i < strengthScore ? strengthColors[strengthScore-1] : 'var(--card-border)', borderRadius: '2px' }} />
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="primary-btn" disabled={loading || otp.length !== 6}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>&larr; Back to Login</Link>
        </div>

      </div>
    </div>
  );
}