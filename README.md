# Tech Events Platform

A sleek, premium full-stack event discovery, booking, and management platform designed with an eye-friendly **Ink Wash** minimalism aesthetic. Built using a decoupled architecture featuring a responsive **React (Vite)** frontend and a robust **PHP/MySQL** backend api.

---

## 🎨 Design Language & Typography
* **Admin Portal:** Implements **Lora** typography—providing a sophisticated, editorial, and commanding workspace for organizers.
* **Public Interface:** Implements **Arvo** typography—delivering a bold, distinct, and premium slab-serif character for attendees.
* **Color Palette (Ink Wash Muted):** Engineered to prevent eye strain during long-term monitoring, substituting harsh, blinding whites for an organic "Muted Parchment" background (`#F2F2E9`) balanced against Charcoal `#4A4A4A` and Slate Blue `#6D8196`.

---

## 🚀 Key Features

### 👤 Public Dashboard
* **Dynamic Event Streams:** Live lookup and search query filtration matching titles or hosts dynamically.
* **Sleek Layout Expansion:** Accordion-style layout toggles providing explicit event details, maps, and hosting context without layout displacement.
* **Digital Entry Passes:** Generates instant entry passes embedded with structured string tracking using secure inline QR-code SVGs.
* **Find My Tickets:** Dedicated secure channel allowing guests to fetch all active registrations tied to an verified email ecosystem.

### 🛡️ Admin Command Center
* **Operational Overview Metrics:** Automated tracking calculating active events, total tickets sold, global capacities, and standard fill-rate performance indicators.
* **Sleek Experience Builder:** Re-engineered thin-profile inputs utilizing bottom-border focus fields mapping completely to database schema criteria (Venue, Maps URL, Start Time, and Banner Media).
* **Beautified Guest List Log:** High-contrast table data modals tracking digital validation markers (`✓ CHECKED IN` vs. `⌛ PENDING`).
* **Integrated Ticket Scanner:** Hardware-independent webcam scanning module matching verification structures directly over synchronous database query states.

---

## 📂 Repository Structure

```text
techevents_demo/
├── backend/                  # PHP API Layer & Database Operations
│   ├── uploads/              # Local server storage for event poster art
│   ├── create_event.php
│   ├── update_event.php
│   ├── get_events.php
│   ├── get_all_events.php
│   ├── get_my_tickets.php
│   ├── get_attendees.php
│   ├── register_for_event.php
│   └── verify_ticket.php
├── src/                      # React Frontend Source Architecture
│   ├── components/           # UI Engine Components (Scanner, ThemeToggle)
│   ├── Home.jsx              # Public Facing Portal Interface
│   ├── Dashboard.jsx         # Administrative Command Center Dashboard
│   ├── MyTickets.jsx         # Verification Pass Retrieval Workspace
│   ├── Login.jsx             # Admin Identity Authentication Gateway
│   ├── Signup.jsx            # Multi-Step Registration Interface
│   └── App.css               # Ink Wash Core Variables & Design Styling
├── package.json              # NPM Project Package Manifest
└── README.md                 # System Technical Documentation
