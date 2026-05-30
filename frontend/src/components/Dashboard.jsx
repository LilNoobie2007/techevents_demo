import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import ThemeToggle from './ThemeToggle';
import TicketScanner from './TicketScanner';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]); 
  const navigate = useNavigate();

  // State for UI control
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // State for Form Management
  const [eventData, setEventData] = useState({ 
    title: '', event_date: '', event_time: '', venue: '', venue_map_link: '', capacity: '', description: '', additional_details: '' 
  });
  const [imageFile, setImageFile] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);

  // State for Guest Management
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [currentEventTitle, setCurrentEventTitle] = useState('');
  const [attendeesList, setAttendeesList] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // RECTIFIED: Absolute path for your XAMPP setup
  const UPLOADS_BASE_URL = "http://localhost/techevents_demo/backend/uploads/";

  // Statistical Calculations
  const totalEvents = events.length;
  const totalTicketsSold = events.reduce((sum, event) => sum + (parseInt(event.booked_seats) || 0), 0);
  const totalCapacity = events.reduce((sum, event) => sum + (parseInt(event.capacity) || 0), 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0;

  const fetchEvents = async (userId) => {
    try {
      const response = await axios.get(`http://localhost/techevents_demo/backend/get_events.php?user_id=${userId}`);
      if (response.data.status === 'success') {
        setEvents(response.data.events);
      }
    } catch (error) { console.error("API Link Error", error); }
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      fetchEvents(parsedUser.id); 
    } else { navigate('/login'); }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleEventChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const formData = new FormData();
      Object.keys(eventData).forEach(key => formData.append(key, eventData[key]));
      formData.append('user_id', user.id);
      if (imageFile) { formData.append('image_file', imageFile); }

      const url = editingEventId ? 'http://localhost/techevents_demo/backend/update_event.php' : 'http://localhost/techevents_demo/backend/create_event.php';
      if (editingEventId) formData.append('event_id', editingEventId);

      const response = await axios.post(url, formData);
      if(response.data.status === 'success') {
        setMessage(response.data.message);
        setTimeout(() => setMessage(''), 3000);
        cancelEdit();
        fetchEvents(user.id);
      } else { setMessage("Error: " + response.data.message); }
    } catch (error) { setMessage("Failed to connect to server."); }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await axios.post('http://localhost/techevents_demo/backend/delete_event.php', { 
        event_id: eventId, user_id: user.id 
      });
      if (response.data.status === 'success') { fetchEvents(user.id); }
    } catch (error) { console.error("Delete error", error); }
  };

  const handleEditClick = (event) => {
    setEditingEventId(event.id);
    setEventData({
      title: event.title,
      event_date: event.event_date,
      event_time: event.event_time || '',
      venue: event.venue || '',
      venue_map_link: event.venue_map_link || '',
      capacity: event.capacity,
      description: event.description,
      additional_details: event.additional_details || ''
    });
    setActiveTab('create');
  };

  const cancelEdit = () => {
    setEditingEventId(null);
    setEventData({ title: '', event_date: '', event_time: '', venue: '', venue_map_link: '', capacity: '', description: '', additional_details: '' });
    setActiveTab('dashboard');
  };

  const fetchAttendees = async (eventId, eventTitle) => {
    setCurrentEventTitle(eventTitle);
    setShowAttendeesModal(true);
    setLoadingAttendees(true);
    try {
      const response = await axios.get(`http://localhost/techevents_demo/backend/get_attendees.php?event_id=${eventId}`);
      if (response.data.status === 'success') { setAttendeesList(response.data.attendees); }
    } catch (error) { console.error("Guest fetch error", error); } 
    finally { setLoadingAttendees(false); }
  };

  const EventList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {events.map((event) => {
        const booked = parseInt(event.booked_seats) || 0;
        const capacity = parseInt(event.capacity) || 0;
        const fillPercentage = capacity > 0 ? (booked / capacity) * 100 : 0;

        // RECTIFIED: Image path cleaner
        let imgUrl = event.image_url;
        if (imgUrl && imgUrl.startsWith('http')) { imgUrl = imgUrl.split('/').pop(); }
        const finalImage = imgUrl ? `${UPLOADS_BASE_URL}${imgUrl}` : null;

        return (
          <div key={event.id} className="glass-card" style={{ display: 'flex', gap: '25px', alignItems: 'center', padding: '25px', position: 'relative' }}>
            {finalImage ? (
               <img src={finalImage} alt="poster" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
            ) : (
               <div style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundColor: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>NO IMAGE</div>
            )}
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>{event.title}</h4>
              <p style={{ margin: '5px 0', fontSize: '13px', color: 'var(--text-muted)' }}>📍 {event.venue} • 📅 {event.event_date}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${fillPercentage}%`, height: '100%', backgroundColor: 'var(--accent)' }}></div>
                </div>
                <span style={{ fontSize: '12px' }}>{booked} / {capacity}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => fetchAttendees(event.id, event.title)} className="nav-btn" style={{ fontSize: '12px' }}>Guests</button>
              <button onClick={() => handleEditClick(event)} className="nav-btn" style={{ fontSize: '12px' }}>Edit</button>
              <button onClick={() => handleDeleteEvent(event.id)} className="nav-btn nav-btn-danger" style={{ fontSize: '12px' }}>Del</button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="admin-font" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* Sidebar - Integrated Theme */}
      <aside style={{ width: '260px', padding: '40px 20px', borderRight: '1px solid var(--card-border)', backgroundColor: 'var(--surface-color)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '400', marginBottom: '5px' }}>Tech Events</h2>
        <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '40px' }}>ADMIN PANEL</p>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => setActiveTab('dashboard')} className={`nav-btn ${activeTab === 'dashboard' ? 'active-tab' : ''}`}>Dashboard</button>
          <button onClick={() => { cancelEdit(); setActiveTab('create'); }} className={`nav-btn ${activeTab === 'create' ? 'active-tab' : ''}`}>New Event</button>
          <button onClick={() => setActiveTab('manage')} className={`nav-btn ${activeTab === 'manage' ? 'active-tab' : ''}`}>Archives</button>
          <Link to="/" className="nav-btn" style={{ marginTop: '20px', textDecoration: 'none' }}>Live Site</Link>
        </nav>
        <button onClick={handleLogout} className="primary-btn" style={{ marginTop: 'auto', backgroundColor: '#dc3545', width: '100%' }}>Logout</button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="sleek-nav">
          <div style={{ color: 'var(--accent)', fontWeight: '600' }}>{message}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <ThemeToggle />
            <button onClick={() => setIsScannerOpen(true)} className="primary-btn">Scanner</button>
          </div>
        </header>

        <div style={{ padding: '40px', flex: '1 0 auto' }}>
          {activeTab === 'dashboard' && (
            <div>
              <h1 style={{ fontWeight: '400', marginBottom: '30px' }}>Overview</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-card">
                  <span className="minimal-label">Events</span>
                  <div style={{ fontSize: '28px' }}>{totalEvents}</div>
                </div>
                <div className="glass-card">
                  <span className="minimal-label">Bookings</span>
                  <div style={{ fontSize: '28px' }}>{totalTicketsSold}</div>
                </div>
                <div className="glass-card">
                  <span className="minimal-label">Fill Rate</span>
                  <div style={{ fontSize: '28px' }}>{fillRate}%</div>
                </div>
              </div>
              <EventList />
            </div>
          )}

          {activeTab === 'create' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h1 style={{ fontWeight: '400', marginBottom: '30px' }}>{editingEventId ? "Edit Event" : "Create Event"}</h1>
              <div className="glass-card" style={{ padding: '40px' }}>
                <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="minimal-label">Event Title</label>
                    <input type="text" name="title" value={eventData.title} onChange={handleEventChange} required className="minimal-input" />
                  </div>
                  <div>
                    <label className="minimal-label">Date</label>
                    <input type="date" name="event_date" value={eventData.event_date} onChange={handleEventChange} required className="minimal-input" />
                  </div>
                  <div>
                    <label className="minimal-label">Capacity</label>
                    <input type="number" name="capacity" value={eventData.capacity} onChange={handleEventChange} required className="minimal-input" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="minimal-label">Venue</label>
                    <input type="text" name="venue" value={eventData.venue} onChange={handleEventChange} className="minimal-input" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="minimal-label">Description</label>
                    <textarea name="description" value={eventData.description} onChange={handleEventChange} required className="minimal-input" rows="2" />
                  </div>
                  <div>
                    <label className="minimal-label">Banner Image</label>
                    <input type="file" onChange={(e) => setImageFile(e.target.files[0])} className="minimal-input" style={{ border: 'none' }} />
                  </div>
                  <button type="submit" className="premium-submit-btn" style={{ gridColumn: 'span 2', marginTop: '20px' }}>
                    {editingEventId ? "Save Changes" : "Publish Event"}
                  </button>
                </form>
              </div>
            </div>
          )}
          {activeTab === 'manage' && <EventList />}
        </div>

        {/* Horizontal Footer */}
        <footer className="site-footer">
          <div className="footer-container">
            <div className="footer-brand"><h3>Tech Events</h3><p>Ink Wash Admin</p></div>
            <div className="footer-links">
              <h4 className="footer-heading">Support</h4>
              <a href="mailto:makwanakevin25@gmail.com" style={{ fontSize: '12px', color: 'inherit', textDecoration: 'none' }}>Contact Developer</a>
            </div>
          </div>
        </footer>
      </main>

      {/* Guest Modal */}
      {showAttendeesModal && (
        <div className="modal-backdrop">
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', backgroundColor: 'var(--card-bg)' }}>
            <button onClick={() => setShowAttendeesModal(false)} style={{ float: 'right', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '20px' }}>✖</button>
            <h2 style={{ fontWeight: '400', color: 'var(--text-main)' }}>Guest List</h2>
            <p style={{ color: 'var(--accent)', fontSize: '13px', marginBottom: '20px' }}>{currentEventTitle}</p>
            {loadingAttendees ? <p>Loading...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {attendeesList.map((g, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--card-border)' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{g.name}</div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>{g.email}</div>
                    </div>
                    <div style={{ color: g.is_scanned == 1 ? '#28a745' : 'var(--accent)', fontSize: '11px', fontWeight: 'bold' }}>
                      {g.is_scanned == 1 ? "✓ SCANNED" : "⌛ PENDING"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {isScannerOpen && <TicketScanner userId={user.id} closeScanner={() => setIsScannerOpen(false)} />}
    </div>
  );
}