# TerAuth: Secure National Digital Certificate Authentication & Verification Platform

![Platform](https://img.shields.io/badge/Platform-TerAuth-1d4ed8?style=for-the-badge&logo=shield)
![Build](https://img.shields.io/badge/Build-Passing-10b981?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-RBAC%20%2B%20JWT%20%2B%20Bcrypt-0f172a?style=for-the-badge)

TerAuth is a centralized, web-based digital certificate authentication and verification platform engineered to prevent educational and professional credential fraud. It provides cryptographic unique certificate generation, anti-tamper QR code verification linking to server-side records, strict role-based access control, and intuitive dashboards for administrators and academic registrars.

---

## 🚀 Key Features

- **Public Instant Verification**: Verify credentials via direct Certificate ID input or live camera QR code scanning without requiring an account.
- **Server-Side Truth Protocol**: QR codes never embed unauthenticated student PII directly; they strictly contain a secure verification reference to the live database (`/verify/:certificateId`).
- **Role-Based Access Control (RBAC)**:
  - `SUPER_ADMIN`: National control dashboard, institution accreditation review, universal user directory, certificate oversight, and verification audit trail.
  - `INSTITUTION_ADMIN`: Institutional certificate issuance, automatic generation of `TER-YYYY-XXXXXXXX` serials and QR codes, printable certificate layout, and revocation controls.
  - `ORGANIZATION_ADMIN`: Organization credential verification registry.
  - `PUBLIC_VERIFIER`: Anonymous verification with rate-limiting defense.
- **Instant Revocation Tracking**: Revoked credentials immediately return `REVOKED` status upon verification, displaying documented revocation reasons.
- **Audit & Anti-Fraud Logging**: Every verification query records timestamp, queried identifier, outcome (`VALID`, `REVOKED`, `INVALID`), and client network telemetry.

---

## 🛠 Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Html5-Qrcode.
- **Backend**: Node.js, Express, TypeScript, Helmet, CORS, Express-Rate-Limit, Zod.
- **Database & ORM**: PostgreSQL / SQLite, Prisma ORM.
- **Authentication**: JWT (Access Token + Refresh Token rotation), Bcrypt password hashing (12 salt rounds).
- **QR Engine**: Vector SVG and high-resolution PNG generation via `qrcode`.

---

## 🔑 Demo Accounts & Credentials

The platform includes seed data ready for demonstration:

| Role | Username | Password | Organization / Notes |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `Admin@12345` | National Registry Administration |
| **Institution Admin** | `aait_admin` | `Institution@12345` | Addis Ababa Institute of Technology |
| **Institution Admin** | `nstu_admin` | `Institution@12345` | National Science & Technology University |
| **Organization Verifier** | `hr_director` | `OrgAdmin@12345` | Enterprise Verifier Account |

> **Sample Verification IDs**:
> - `TER-2026-8F4K2M9X` -> **ACTIVE / VALID** (Abebe Bikila - B.Sc. Software Engineering)
> - `TER-2026-3P9W7L4Q` -> **ACTIVE / VALID** (Sara Yohannes - M.Sc. Cybersecurity)
> - `TER-2026-6M2D9V1K` -> **REVOKED** (Dawit Haile - Academic integrity ruling #2026/04)
> - `TER-9999-FAKE0001` -> **INVALID / NOT FOUND**

---

## ⚙️ Quick Start (Running Locally)

### 1. Prerequisites
- Node.js (v18+ recommended, v24 confirmed working)
- npm (v9+)

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npm run prisma:push
npm run prisma:seed
npm run dev
```
The backend API server starts at `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend portal opens at `http://localhost:5173`.

### 4. Running Backend Automated Tests
```bash
cd backend
npm test
```
Executes comprehensive integration tests verifying authentication, authorization, role restrictions, certificate creation, and verification rules.

---

## 📁 Project Structure

```
TerAuth/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Auth, Institution, Certificate, Verification, Dashboard
│   │   ├── middleware/       # JWT Auth, RBAC, Rate Limiting, Validation, Error Handling
│   │   ├── routes/           # Express Route definitions
│   │   ├── services/         # QR generation, Certificate ID crypto, Audit service
│   │   ├── validators/       # Zod schemas
│   │   ├── types/            # TypeScript interfaces
│   │   ├── app.ts            # Express setup with Helmet & CORS
│   │   └── server.ts         # Server bootstrap
│   ├── prisma/
│   │   ├── schema.prisma     # Active Prisma schema
│   │   └── seed.ts           # Comprehensive database seeder
│   └── tests/                # Automated Jest integration tests
├── frontend/
│   ├── src/
│   │   ├── components/       # Status badges, Stats cards, Printable certificate, Camera QR scanner
│   │   ├── layouts/          # Public, Admin, and Institution layouts
│   │   ├── pages/
│   │   │   ├── public/       # Landing, Public Verification, Login, Registration
│   │   │   ├── admin/        # Dashboard, Institutions, Users, Certificates, Audit Logs
│   │   │   └── institution/  # Dashboard, Issued Certificates, Issue Form, Detail View
│   │   ├── context/          # React Auth Context (session & role tokens)
│   │   └── services/         # Axios API client with interceptors
└── docs/                     # API & Database Architecture guides
```

---

## 📜 Academic Project Scope Notice

TerAuth is engineered as an academic software engineering capstone demonstrating secure credential management, anti-tamper QR verification, and real-time database validation. Unsupported features such as international university integrations or live ministry links are intentionally omitted in accordance with project boundaries.
