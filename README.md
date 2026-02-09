# Astratos

Real-time inventory intelligence platform for modern businesses.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.x-61DAFB.svg)

## Features

- 📊 **Real-Time Dashboard** - Live metrics with WebSocket updates
- 🔔 **Anomaly Detection** - AI-powered alerts for inventory issues
- 📈 **Smart Forecasting** - Demand predictions with confidence levels
- 📝 **Audit Trail** - Complete transaction history
- ⚡ **Lightning Fast** - Sub-100ms response times
- 🎨 **Modern UI** - Dark theme with glassmorphism

## Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS
- Framer Motion
- React Router
- Axios

### Backend
- Node.js + Express
- WebSocket (ws)
- MongoDB (optional)

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (optional)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/astratos.git
cd astratos
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
astratos/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Route pages
│   │   ├── styles/        # CSS files
│   │   └── utils/         # Helpers
│   └── package.json
├── backend/               # Express backend
│   ├── routes/           # API endpoints
│   ├── db/               # Database config
│   ├── simulation/       # Data simulation
│   └── server.js
└── docs/                  # Documentation
```

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server status |
| `/api/inventory` | GET/POST | Inventory CRUD |
| `/api/anomalies` | GET | Anomaly list |
| `/api/forecasts` | GET | Demand forecasts |
| `/api/audit` | GET | Audit logs |

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/astratos
```

## License

ISC © 2026 Astratos
