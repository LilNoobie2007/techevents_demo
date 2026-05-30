import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

export default function TicketScanner({ userId, closeScanner }) {
  const [scanResult, setScanResult] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isScannerInitialized = useRef(false);
  const scannerInstance = useRef(null);

  useEffect(() => {
    if (isScannerInitialized.current) return;
    isScannerInitialized.current = true;

    const readerElement = document.getElementById('reader');
    if (readerElement) { readerElement.innerHTML = ''; }

    // Start Scanner
    scannerInstance.current = new Html5QrcodeScanner(
      'reader',
      { qrbox: { width: 250, height: 250 }, fps: 10 },
      false 
    );

    scannerInstance.current.render(success, error);

    async function success(result) {
      if (scannerInstance.current) { scannerInstance.current.pause(true); }
      setLoading(true);

      try {
        // RECTIFIED: More flexible Regex to catch TICKET_ID or TICKET-ID
        const match = result.match(/TICKET[-_]ID[:\s]+(\d+)/i);
        
        if (match && match[1]) {
          const ticketId = match[1];
          // RECTIFIED: Updated Path to techevents_demo
          const response = await axios.post('http://localhost/techevents_demo/backend/verify_ticket.php', {
            ticket_id: ticketId,
            admin_id: userId
          });
          
          setScanResult(response.data.message);
        } else {
          setScanResult("❌ INVALID QR: Unrecognized format.");
        }
      } catch (err) {
        setScanResult("❌ SERVER ERROR: Verification failed.");
      } finally {
        setLoading(false);
        setTimeout(() => {
          setScanResult('');
          if (scannerInstance.current) { scannerInstance.current.resume(); }
        }, 3000);
      }
    }

    function error(err) { /* Silence scanning noise */ }

    return () => {
      if (scannerInstance.current) {
        scannerInstance.current.clear().catch(e => console.error("Scanner cleanup error", e));
        isScannerInitialized.current = false; // Allow re-init on remount
      }
    };
  }, [userId]);

  // Inside your TicketScanner success function:
async function success(result) {
  if (scannerInstance.current) { scannerInstance.current.pause(true); }
  setLoading(true);

  // Parse the "Beautified" string
  // Format: TICKET-ID: 123 | GUEST: Kevin | EVENT-ID: 11
  const parts = result.split('|').map(p => p.trim());
  
  if (parts.length >= 2) {
    const ticketId = parts[0].split(':')[1].trim();
    const guestName = parts[1].split(':')[1].trim();

    try {
      const response = await axios.post('http://localhost/techevents_demo/backend/verify_ticket.php', {
        ticket_id: ticketId,
        admin_id: userId
      });

      // Show a beautiful result
      setScanResult(
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <div style={{ fontSize: '24px', color: '#28a745', marginBottom: '10px' }}>✅ ENTRY GRANTED</div>
          <div style={{ fontSize: '18px', color: 'var(--text-main)' }}>{guestName}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Ticket #{ticketId} Verified</div>
        </div>
      );
    } catch (err) {
      setScanResult(<div style={{ color: '#dc3545' }}>❌ Verification Failed</div>);
    }
  } else {
    setScanResult(<div style={{ color: '#dc3545' }}>⚠️ Invalid Ticket Format</div>);
  }
  
  setLoading(false);
}

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(10px)' }}>
      <div className="glass-card" style={{ padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '500px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
        <h2 style={{ color: 'var(--text-main)', marginBottom: '20px' }}>Ticket Scanner</h2>
        
        <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--card-border)' }}></div>
        
        <div style={{ minHeight: '60px', marginTop: '20px' }}>
          {loading ? <p style={{ color: 'var(--accent)' }}>Verifying...</p> : <p style={{ color: scanResult.includes('❌') ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>{scanResult}</p>}
        </div>

        <button onClick={closeScanner} className="primary-btn" style={{ backgroundColor: '#dc3545', width: '100%' }}>Close Scanner</button>
      </div>
    </div>
  );
}