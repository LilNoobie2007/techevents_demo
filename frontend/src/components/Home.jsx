import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import './App.css';
import ThemeToggle from './ThemeToggle';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendeeData, setAttendeeData] = useState({ name: '', email: '' });
  const [modalMessage, setModalMessage] = useState('');
  
  const [ticketData, setTicketData] = useState(null); 
  const [isRegistering, setIsRegistering] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState({});

  // RECTIFIED: Absolute path for local XAMPP uploads folder
  const UPLOADS_BASE_URL = "http://localhost/techevents_demo/backend/uploads/";

  useEffect(() => {
    const fetchPublicEvents = async () => {
      try {
        const response = await axios.get('http://localhost/techevents_demo/backend/get_all_events.php');
        if (response.data.status === 'success') {
          setEvents(response.data.events);
        }
      } catch (error) {
        console.error("Failed to fetch public events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicEvents();
  }, []);

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.host_name && event.host_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAttendeeChange = (e) => {
    setAttendeeData({ ...attendeeData, [e.target.name]: e.target.value });
  };

  const showModal = (event) => {
    setSelectedEvent(event);
    setModalMessage('');
    setAttendeeData({ name: '', email: '' });
    setTicketData(null);
    setIsRegistering(false); 
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    setIsRegistering(true); 
    
    try {
      const payload = { 
        event_id: selectedEvent.id, 
        name: attendeeData.name, 
        email: attendeeData.email 
      };
      const response = await axios.post('http://localhost/techevents_demo/backend/register_for_event.php', payload);
      
      if(response.data.status === 'success') {
        setTicketData({
          id: response.data.ticket_id,
          name: attendeeData.name,
          eventTitle: selectedEvent.title
        });
        
        // Update local seat count
        setEvents(events.map(ev => 
          ev.id === selectedEvent.id 
            ? { ...ev, booked_seats: (parseInt(ev.booked_seats) || 0) + 1 } 
            : ev
        ));
      } else {
        setModalMessage(response.data.message);
      }
    } catch (error) {
      setModalMessage("Failed to connect to the server.");
    } finally {
      setIsRegistering(false); 
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setAttendeeData({ name: '', email: '' });
    setModalMessage('');
    setTicketData(null); 
    setIsRegistering(false);
  };

  const toggleExpand = (id) => {
    setExpandedEvents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="public-font" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <nav className="sleek-nav">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Tech Events <span style={{ color: 'var(--accent)', fontWeight: 'normal', fontSize: '14px' }}>by Kevin Makwana</span>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <ThemeToggle />
          <Link to="/my-tickets" className="nav-btn">Find Tickets</Link>
          <Link to="/login" className="nav-btn" style={{ color: 'var(--accent)' }}>Admin Login</Link>
        </div>
      </nav>

      <main style={{ flex: '1 0 auto', padding: '50px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '10px', color: 'var(--text-main)' }}>Discover Tech</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '40px' }}>Mumbai's premium hub for conferences and workshops.</p>
          
          <input 
            type="text" 
            placeholder="Search by title or host..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="minimal-input"
            style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', display: 'block' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>Loading events...</p>
          ) : filteredEvents.map((event) => {
            const booked = parseInt(event.booked_seats) || 0;
            const capacity = parseInt(event.capacity) || 0;
            const isSoldOut = booked >= capacity;
            const isExpanded = expandedEvents[event.id];

            // RECTIFIED: Path cleaning for local image visibility
            let imgUrl = event.image_url;
            if (imgUrl && imgUrl.startsWith('http')) { imgUrl = imgUrl.split('/').pop(); }
            const finalImageSrc = imgUrl ? `${UPLOADS_BASE_URL}${imgUrl}` : null;

            return (
              <div key={event.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', opacity: isSoldOut ? 0.7 : 1 }}>
                {finalImageSrc ? (
                  <img src={finalImageSrc} alt={event.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '20px' }} />
                ) : (
                  <div style={{ height: '200px', backgroundColor: 'var(--surface-color)', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Poster</div>
                )}

                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.6rem' }}>{event.title}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>📍 {event.venue} • 📅 {event.event_date}</p>
                <p style={{ margin: '10px 0', fontWeight: 'bold' }}>Seats: {booked} / {capacity}</p>

                {isExpanded && (
                  <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'var(--surface-color)', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>{event.description}</p>
                    {event.additional_details && <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '10px' }}>{event.additional_details}</p>}
                  </div>
                )}

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px' }}>
                  <button onClick={() => toggleExpand(event.id)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
                    {isExpanded ? 'Less' : 'More'}
                  </button>
                  <button onClick={() => !isSoldOut && showModal(event)} className="primary-btn" disabled={isSoldOut}>
                    {isSoldOut ? "Sold Out" : "Book Ticket"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-brand"><h3>Tech Events</h3><p>Ink Wash Theme • Mumbai</p></div>
          <div className="footer-links">
            <h4 className="footer-heading">Support</h4>
            <Link to="/my-tickets">Find Tickets</Link>
            <a href="mailto:makwanakevin25@gmail.com">Help</a>
          </div>
        </div>
        <div className="footer-bottom">© 2026 Tech Events. Built by Kevin Makwana.</div>
      </footer>

      {/* REGISTRATION MODAL */}
      {selectedEvent && (
        <div className="modal-backdrop">
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <button onClick={closeModal} style={{ float: 'right', border: 'none', background: 'none', fontSize: '20px' }}>✖</button>
            {!ticketData ? (
              <form onSubmit={submitRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                <h3 style={{ margin: 0 }}>Register for {selectedEvent.title}</h3>
                {modalMessage && <p style={{ color: '#dc3545' }}>{modalMessage}</p>}
                <input type="text" name="name" placeholder="Full Name" value={attendeeData.name} onChange={handleAttendeeChange} required className="minimal-input" />
                <input type="email" name="email" placeholder="Email Address" value={attendeeData.email} onChange={handleAttendeeChange} required className="minimal-input" />
                <button type="submit" className="primary-btn" disabled={isRegistering}>{isRegistering ? "Processing..." : "Confirm"}</button>
              </form>
            ) : (
              <div style={{ padding: '20px' }}>
                <h2 style={{ color: '#28a745' }}>Success!</h2>
                <div style={{ margin: '20px 0', background: '#fff', padding: '15px', display: 'inline-block' }}>
                  <QRCodeSVG value={`TICKET-ID: ${ticketData.id} | GUEST: ${ticketData.name} | EVENT: ${ticketData.eventTitle}`} size={180} />
                </div>
                <p>Pass #{ticketData.id} confirmed for {ticketData.name}</p>
                <button onClick={closeModal} className="primary-btn" style={{ width: '100%' }}>Return</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}