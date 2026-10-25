# TerAuth: National Digital Certificate Authentication & Verification Platform

![Platform](https://img.shields.io/badge/Platform-TerAuth-1d4ed8?style=for-the-badge&logo=shield)
![Build](https://img.shields.io/badge/CI%2FCD-Passing-10b981?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-RBAC%20%2B%20JWT%20%2B%20CSRF%20%2B%20Bcrypt-0f172a?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker)
![Public Verification](https://img.shields.io/badge/Public%20Verification-No%20Account%20Needed-059669?style=for-the-badge)

TerAuth is a secure digital credential authentication and verification platform designed to combat academic and professional credential fraud, including increasingly sophisticated forgeries generated using artificial intelligence (AI).

💡 The Idea

With AI tools making it easier to create convincing fake certificates and professional credentials, verifying the authenticity of qualifications has become increasingly important. TerAuth addresses this challenge by enabling institutions to issue digital credentials that can be verified against trusted server records rather than relying solely on the appearance of a document.

---

## 🚀 Key Capabilities

Secure Credential Issuance: Enables authorized institutions to issue digital academic and professional credentials.

QR Code Verification: Allows credentials to be checked against trusted server records to identify forged or unauthorized documents, including AI-generated fakes.

Role-Based Access Control (RBAC): Restricts system operations according to each user's assigned permissions.

Administrative Audit Logging: Records important administrative activities to support accountability and traceability.
---

## ❓ Public Verification FAQ

#### Q: Does an employer or student need an account to scan the QR code?
> **A: No.** Verification is **100% public, open, and anonymous**. Any person—whether an employer, border official, student, or university registrar—can scan the QR code using their default smartphone camera or visit `https://terauth.vercel.app/verify` in any web browser.

---

## 🛠 Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Html5-Qrcode.
- **Backend**: Node.js 20, Express, TypeScript, Helmet, CORS, Express-Rate-Limit, Zod.
- **Database & ORM**: PostgreSQL 16 (local container) / Neon PostgreSQL (cloud), Prisma ORM 5.22.
- **Containerization**: Docker, Docker Compose, Nginx reverse proxy, multi-stage Alpine builds.
- **Security & Crypto**: JWT (15-min Access + 7-day Refresh rotation), Bcrypt (12 salt rounds), Double-Submit Anti-CSRF (`crypto.timingSafeEqual`), Reverse Proxy Trust (`trust proxy: 1`).
- **CI/CD**: GitHub Actions quality pipeline with containerized ephemeral PostgreSQL service.

---

## 🔒 Security Architecture

| Security Layer | Implementation Mechanism | Protection Guarantee |
| :--- | :--- | :--- |
| **Authentication** | JWT Access (15m) + Rotating Refresh Token (7d) | Minimizes token hijacking window; revokes refresh tokens on reuse or compromise. |
| **Session Invalidation**| `refreshTokenHash: null` on password change / deactivation | Terminates all active attacker sessions instantly upon credential updates. |
| **Anti-CSRF** | Double-submit `XSRF-TOKEN` cookie + `X-CSRF-Token` header | Enforces cryptographically safe `timingSafeEqual` validation on state-changing requests. |
| **Reverse Proxy Trust**| `app.set('trust proxy', 1)` | Correctly extracts real client IPs across Nginx, Vercel, and Cloudflare load balancers. |
| **Rate Limiting** | Sliding window IP rate limiting | Mitigates brute-force attacks and denial-of-service on public verification endpoints. |
| **Referential Integrity**| `onDelete: Restrict` on Institution $\rightarrow$ Certificate | Eliminates catastrophic credential loss if an institution record is removed. |
| **Error Sanitization** | Production stack trace redaction | Prevents internal server file paths or environment variables from leaking in errors. |

---

## 🐳 Docker Local Quickstart

TerAuth provides complete multi-container orchestration with automatic schema synchronization:

```powershell
# 1. Start all services in detached mode
docker compose up -d

# 2. View running container health
docker compose ps

# 3. Stream real-time logs
docker compose logs -f

# 4. Stop containers without deleting database data
docker compose down
```

### Local Service Ports
- **Frontend Portal**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Nginx Reverse Proxy API**: [http://localhost:5173/api/health](http://localhost:5173/api/health)
- **Containerized PostgreSQL**: `localhost:5433` (mapped from container `5432` to avoid host collisions)

---

## ⚙️ Manual Local Development

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) executes on every commit and PR:
1. Spins up an ephemeral `postgres:16-alpine` service container.
2. Synchronizes schema via `prisma db push --skip-generate`.
3. Seeds test credentials and users.
4. Executes backend integration tests (`jest`).
5. Performs complete frontend production build (`tsc && vite build`).

---

## 📜 Academic Project Notice

Developed as a national digital credentials infrastructure capstone demonstrating secure academic qualification registry, anti-tamper QR verification, and real-time validation.

## 👥 Developers (Group Members)
1. **Getachew Eyayu Adugna**
   - ID: CTC-3600-26
   - Role: Co-developer (Full Stack: Backend & Frontend)
2. **Hawlet Romedan Yesuf**
   - ID: CTC-3877-26
   - Role: Co-developer (Full Stack: Backend & Frontend)
