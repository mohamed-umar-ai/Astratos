# Astratos Demo Notes

## Project Overview
**Astratos** is a real-time inventory intelligence platform demonstrating full-stack web development with live data updates via WebSockets.

---

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
```
Server runs on: `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on: `http://localhost:5173`

---

## Demo Flow

### 1. Landing Page (`/`)
- Hero section with animated stats
- Features grid showcasing platform capabilities
- Pricing, testimonials, FAQ sections
- CTA buttons → Dashboard

### 2. Authentication (`/auth`)
- Sign Up / Sign In toggle
- Mock authentication (any credentials work)
- Stores session in localStorage
- Redirects to Dashboard

### 3. Dashboard (`/dashboard`)
- **Live Stats Cards**: Active users, orders/min, revenue, response time
- **System Health**: CPU, Memory, Latency progress bars
- **Recent Alerts**: Real-time notifications
- **Inventory Table**: Stock overview with status badges

### 4. Anomalies (`/anomalies`)
- AI-detected inventory issues
- Filter by severity (critical, high, medium, low)
- Status filtering (active, resolved)
- Click to view details, resolve issues

### 5. Forecasts (`/forecasts`)
- Demand predictions with confidence scores
- Trend indicators (up/down)
- Weekly forecast charts
- Reorder point alerts

### 6. Audit Trail (`/audit`)
- Complete transaction history
- Search and filter logs
- Pagination support
- Export capability (mock)

---

## Key Features Demonstrated

| Feature | Technology |
|---------|------------|
| Real-time updates | WebSocket (ws) |
| Responsive design | TailwindCSS |
| Smooth animations | Framer Motion |
| API communication | Axios |
| Routing | React Router |
| State management | React Hooks |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/inventory` | GET | List inventory items |
| `/api/inventory/:id` | GET | Single item |
| `/api/anomalies` | GET | List anomalies |
| `/api/forecasts` | GET | Demand forecasts |
| `/api/audit` | GET | Audit trail logs |

---

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `CONNECTION_ESTABLISHED` | Server → Client | Initial connection confirmation |
| `SIMULATION_UPDATE` | Server → Client | Live metrics update (every 2s) |

---

## Notes for Reviewers

1. **Mock Data**: All data is simulated for demo purposes
2. **No Database Required**: Works without MongoDB (fallback to in-memory)
3. **Responsive**: Works on mobile, tablet, and desktop
4. **Dark Theme**: Modern dark UI with glassmorphism effects

---

## Folder Structure
```
/astratos
├── /frontend
│   ├── /src
│   │   ├── /pages        # LandingPage, Auth, Dashboard, etc.
│   │   ├── /components   # Hero, Features, Sidebar, etc.
│   │   ├── /styles       # tailwind.css
│   │   └── /utils        # animations.js, websocket.js
│   └── package.json
├── /backend
│   ├── /routes           # inventory, anomalies, forecasts, audit
│   ├── /db               # mongoConfig.js
│   ├── /simulation       # heartbeat.js
│   └── server.js
└── /docs
    └── demo-notes.md
```

---

*Last updated: February 2026*
