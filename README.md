# TerAuth: National Digital Certificate Authentication & Verification Platform

![Platform](https://img.shields.io/badge/Platform-TerAuth-1d4ed8?style=for-the-badge&logo=shield)
![Build](https://img.shields.io/badge/Build-Passing-10b981?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-RBAC%20%2B%20JWT%20%2B%20Bcrypt-0f172a?style=for-the-badge)
![Status](https://img.shields.io/badge/Public%20Verification-No%20Account%20Needed-059669?style=for-the-badge)

TerAuth is a centralized digital certificate authentication and verification platform engineered to eradicate academic and professional credential fraud. It provides cryptographic certificate issuance, anti-tamper QR code verification linking directly to verified server records, granular role-based access control (RBAC), and intuitive administrative hubs for institutions and accreditation authorities.

---

## 🚀 Key Capabilities

- **Instant Public Verification**: Anyone can verify credentials by entering the Certificate ID or scanning the physical QR code with any camera—**zero login, zero app install, zero Vercel account required**.
- **Server-Side Truth Protocol**: QR codes never store raw student PII directly. They strictly embed an authoritative verification link (`https://terauth.vercel.app/verify/:certificateId`), preventing offline tampering and forgery.
- **Role-Based Access Control (RBAC)**:
  - `SUPER_ADMIN`: National oversight, institution accreditation review, user directory, system-wide certificate monitoring, and immutable audit logs.
  - `INSTITUTION_ADMIN`: Accredited institution portal to issue credentials (`TER-YYYY-XXXXXXXX`), manage records, update institution profile details, change passwords, and revoke invalid certificates.
  - `ORGANIZATION_ADMIN`: Enterprise verification registry and employment qualification checks.
  - `PUBLIC_VERIFIER`: Rate-limited anonymous verification for employers, universities, and students.
- **Real-Time Revocation Tracking**: Instant invalidation flags with tamper-evident revocation reasons and audit timestamps.
- **Comprehensive Audit Trail**: Captures query timestamps, IP telemetry, device user agents, and query outcomes (`VALID`, `REVOKED`, `INVALID`).

---

## ❓ Verification FAQ

#### Q: Does someone need an account or need to be a user of Vercel to scan the QR code?
> **A: No.** Verification is **100% public, open, and anonymous**. Any person—whether an employer, border official, student, or university registrar—can scan the QR code using their default smartphone camera or visit `https://terauth.vercel.app/verify` in any browser. No login, sign-up, or third-party service accounts are ever required.

---

## 🛠 Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Html5-Qrcode.
- **Backend**: Node.js, Express, TypeScript, Helmet, CORS, Express-Rate-Limit, Zod.
- **Database & ORM**: PostgreSQL / SQLite, Prisma ORM.
- **Security & Crypto**: JWT (Access Token + Refresh Token rotation), Bcrypt (12 salt rounds), HTTPS/TLS.
- **QR Engine**: Vector SVG and high-resolution PNG generation via `qrcode`.

---

## 📁 Repository Structure

```
TerAuth/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Auth, Institution, Certificate, Verification, Dashboard
│   │   ├── middleware/       # JWT Auth, RBAC, Rate Limiting, Validation, Error Handling
│   │   ├── routes/           # Express Route definitions
│   │   ├── services/         # QR generation, Crypto serials, Audit service
│   │   ├── validators/       # Zod schemas (Login, Password, Institution, Certificate)
│   │   ├── types/            # TypeScript interfaces
│   │   ├── app.ts            # Express setup with Helmet, CORS & Health probes
│   │   └── server.ts         # Server bootstrap
│   ├── prisma/
│   │   ├── schema.prisma     # Active Prisma schema
│   │   └── seed.ts           # Realistic database seeder with authentic institutions
│   └── tests/                # Automated Jest integration tests
├── frontend/
│   ├── src/
│   │   ├── components/       # Responsive Navbar, Sidebar, QR Scanner Modal, Printable Certificate
│   │   ├── layouts/          # Public, Admin, and Institution responsive layouts
│   │   ├── pages/
│   │   │   ├── public/       # Landing, Public Verification, Login, Registration
│   │   │   ├── admin/        # Dashboard, Institutions, Users, Certificates, Audit Logs
│   │   │   └── institution/  # Dashboard, Issued Certificates, Issue Form, Detail, Profile & Security
│   │   ├── context/          # React Auth Context (session & role tokens)
│   │   └── services/         # Axios API client with interceptors
└── docs/                     # API & Database Architecture specifications
```

---

## ⚙️ Quick Start & Setup

### 1. Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database (or local SQLite for development)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env     # Configure your DATABASE_URL and secrets
npx prisma generate
npx prisma db push       # Or npm run prisma:migrate:deploy
npm run prisma:seed      # Populate sample Ethiopian universities and credentials
npm run dev              # Starts backend on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev              # Starts client on http://localhost:5173
```

---

## 🔒 Security Best Practices
- **No Hardcoded Secrets**: All sensitive secrets, database URLs, and JWT keys are strictly injected through environment variables.
- **Sanitized Documentation**: Official guides and API references use sanitized security placeholders.
- **Strict CORS & CSP**: Origin filtering configured for authorized deployment domains.

---

## 📜 Academic Project Notice
TerAuth is engineered as an academic software engineering capstone demonstrating secure credential management, anti-tamper QR verification, and real-time database validation.

## Developers ( Group Members)
 1. Getachew Eyayu Adugna
    ID : CTC-3600-26
    Role: Co - developer ( both backend and frontend)
2. Hawlet Romedan Yesuf
   ID: CTC--26
   Role: Co - developer ( both backend and frontend)
