# EcoGrowth MERN Application

EcoGrowth enterprise management system built on React, Vite, Node.js, and Express, powered directly by a high-performance JSON data engine using all 75 dataset tables in `json_data/`.

## Architecture & Data Source

- **Data Storage**: Pure JSON Database (`json_data/` folder).
- **Zero Database Server Needed**: Runs out-of-the-box without MongoDB, MongoDB Compass, MySQL, or any external database servers.
- **Backend**: Express.js with in-memory indexing, relation resolution, and safe asynchronous file persistence.
- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, and Recharts.

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18 or newer.
- **npm**: v9 or newer.
*(No database installation or daemon required!)*

### 2. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file (already configured by default):
   ```bash
   cp .env.example .env
   ```
4. Start the backend server:
   ```bash
   npm start
   # or: node index.js
   ```
   The server will start on `http://localhost:5000`. All 75 JSON files in `json_data/` are automatically validated and loaded on startup.

### 3. Frontend Setup
1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## Default Login Credentials

- **Email**: `admin@logimetrix.co.in`
- **Password**: `cropnet@123`

---

## Key Modules
- **General Dashboard**: Operational overview, site allocation statuses, stock movements, and S-Curve metrics.
- **Expense Dashboard**: Dedicated financial analytics, monthly site & office expenses, and invoice-vs-expense comparison charts.
- **Master Data**: States, Bank Accounts, Bank Masters, Client Masters, Transporters, Work, Roles, Vendors, and 30+ entity registries.
- **PO & Sites**: PO details, allocation, tracking, and incidents reporting.
- **Invoice Module**: Punched invoices, invoice generation, and monthly invoice reports.
- **Asset Management**: Asset registry, types, and assignments.
