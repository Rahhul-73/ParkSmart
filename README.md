# 🅿️ Parking Slot Reservation System

> A full-stack web application for smart urban parking management, built with React 18 and Node.js/Express.

<!--
  ============================================================
  ACADEMIC MAPPING — Programme Outcomes & SDGs
  ============================================================

  PO2  – Problem Analysis: Identify, formulate, research complex
         parking/traffic problems using engineering principles.
  PO3  – Design/Development: Design system components (REST API,
         React UI, MongoDB schemas) meeting specified needs.
  PO5  – Modern Tool Usage: Apply modern frameworks (React 18,
         Vite, Tailwind CSS, Mongoose ODM, JWT auth).
  PO6  – Engineer & Society: Assess societal, health, safety, and
         legal impacts of urban parking infrastructure.
  PO11 – Project Management: Plan sprints, manage deliverables,
         apply engineering and economic principles.

  PSO1 – Design & develop software using modern stacks for
         real-world parking management.
  PSO2 – Apply software engineering practices (CI/CD, testing,
         security hardening) to a production-grade system.

  SDG 11 – Sustainable Cities and Communities:
           Reduce traffic congestion and emissions from
           circling for parking.
  SDG 13 – Climate Action:
           Lower CO₂ via optimized parking utilization,
           EV-charging slot prioritization, and analytics.
  ============================================================
-->

## 📐 Architecture

```
parking-system/
├── client/          # React 18 + Vite frontend
│   ├── public/
│   └── src/
│       ├── api/            # Axios instance & API helpers
│       ├── assets/         # Static images, icons
│       ├── components/     # Reusable UI components
│       │   ├── common/     # Buttons, Inputs, Cards, Modals
│       │   ├── layout/     # Navbar, Sidebar, Footer
│       │   └── parking/    # Slot grid, Booking cards
│       ├── context/        # React Context providers
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Route-level page components
│       │   ├── auth/       # Login, Register, ForgotPassword
│       │   ├── dashboard/  # User & Admin dashboards
│       │   ├── parking/    # Slot listing, Booking flow
│       │   └── admin/      # Analytics, Slot management
│       ├── routes/         # Route definitions & guards
│       ├── schemas/        # Zod validation schemas
│       ├── styles/         # Global CSS & Tailwind layers
│       └── utils/          # Formatters, constants, helpers
├── server/          # Node.js + Express backend
│   ├── config/      # DB connection, env config
│   ├── controllers/ # Route handlers
│   ├── middleware/   # Auth, error, rate-limit, upload
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express route definitions
│   ├── services/     # Business logic & email service
│   ├── utils/        # JWT helpers, validators
│   └── uploads/      # Multer file storage
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & install

```bash
# Backend
cd parking-system/server
cp .env.example .env      # configure your secrets
npm install

# Frontend
cd ../client
cp .env.example .env
npm install
```

### 2. Run development servers

```bash
# Terminal 1 — API server (port 5000)
cd server && npm run dev

# Terminal 2 — Vite dev server (port 5173)
cd client && npm run dev
```

### 3. Seed demo data (optional)

```bash
cd server && npm run seed
```

## 🛡️ Security Features
- JWT access + refresh token rotation
- Helmet.js HTTP header hardening
- Rate limiting (100 req/15 min per IP)
- MongoDB query injection prevention
- XSS sanitization
- CORS whitelisting
- bcryptjs password hashing (12 rounds)

## 📊 Tech Stack

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion  |
| State      | Context API, React Hook Form, Zod            |
| Charts     | Recharts                                     |
| Backend    | Node.js, Express.js                          |
| Database   | MongoDB, Mongoose ODM                        |
| Auth       | JWT (access + refresh), bcryptjs             |
| Security   | Helmet, CORS, rate-limit, mongo-sanitize, xss|
| Email      | Nodemailer                                   |
| Uploads    | Multer                                       |

## 📝 License
MIT — Built for academic coursework (Web Technologies CEP).
