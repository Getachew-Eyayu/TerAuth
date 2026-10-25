# TerAuth: National Digital Certificate Authentication & Verification Platform

![Platform](https://img.shields.io/badge/Platform-TerAuth-1d4ed8?style=for-the-badge&logo=shield)
![Build](https://img.shields.io/badge/CI%2FCD-Passing-10b981?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-RBAC%20%2B%20JWT%20%2B%20CSRF%20%2B%20Bcrypt-0f172a?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker)
![Public Verification](https://img.shields.io/badge/Public%20Verification-No%20Account%20Needed-059669?style=for-the-badge)

(https://terauth.vercel.app/)

TerAuth is a secure digital credential authentication and verification platform designed to combat academic and professional credential fraud, including increasingly sophisticated forgeries generated with AI tools. Instead of judging whether a document *looks* authentic, TerAuth verifies the credential against trusted issuer records and returns a validation result based on the credential's registered data.

**TerAuth replaces trust in the appearance of a certificate with verifiable trust in its authenticity—helping combat credential fraud in the age of AI.**

## 💡 The Idea

AI tools make it easier to create convincing fake certificates and professional credentials. A visually convincing document is therefore not enough to establish trust. TerAuth gives authorized institutions a controlled way to issue credentials and gives third parties a fast, public way to verify them against trusted server records.

The platform is designed for:

- **Employers**, who can confirm qualifications during recruitment without waiting for manual email or phone confirmation.
- **Universities and training institutions**, which can issue and validate credentials through a centralized registry.
- **Government, border, and compliance officials**, who can check credential status using a QR code and the public verification page.
- **Students and graduates**, who can share credentials that are easier for others to validate.

---

## 🚀 Key Capabilities

**Secure Credential Issuance**: Enables authorized institutions to issue digital academic and professional credentials.

**QR Code Verification**: Allows credentials to be checked against trusted server records to identify forged, altered, revoked, or unauthorized documents, including AI-generated fakes.

**Role-Based Access Control (RBAC)**: Restricts system operations according to each user's assigned permissions.

**Administrative Audit Logging**: Records important administrative activities to support accountability and traceability.

**Public Verification**: Allows anyone with a credential QR code or verification reference to check its status without creating an account.

---

## 📸 Product Screenshots



| Public verification | Institution dashboard |

<img width="1247" height="603" alt="image" src="https://github.com/user-attachments/assets/bdad0077-d3de-49ac-af10-5db7faa705a2" />
<img width="1252" height="684" alt="image" src="https://github.com/user-attachments/assets/c6c38095-5aa8-4a7c-a963-8706644958e3" />
<img width="1261" height="695" alt="image" src="https://github.com/user-attachments/assets/6c35530f-7d6a-4cc0-82ac-4bcfc45220a2" />


| Credential issuance |
<img width="729" height="530" alt="image" src="https://github.com/user-attachments/assets/13a737f0-b51c-4039-ab25-f42010a12e71" />





---

## ❓ Public Verification FAQ

#### Q: Does an employer or student need an account to scan the QR code?
> **A: No.** Verification is **public, open, and anonymous**. Anyone—whether an employer, border official, student, or university registrar—can scan the QR code using a smartphone camera and view the credential's verification result.

#### Q: Does TerAuth decide whether a certificate looks genuine?
> **A: No.** TerAuth does not rely on visual appearance alone. It checks the credential's identifier and data against records maintained by the issuing institution. This makes verification more reliable against edited documents and AI-generated forgeries.

#### Q: What should a verifier do if a credential cannot be verified?
> **A:** Treat the credential as unverified and contact the issuing institution through an independently trusted channel. A failed verification result should not be “overridden” based only on the document's appearance.

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

These controls describe the intended implementation and should remain backed by automated tests and code review whenever the security-sensitive code changes. The project should not claim stronger guarantees than the current implementation and test suite demonstrate.

| Security Layer | Implementation Mechanism | Protection Goal |
| :--- | :--- | :--- |
| **Authentication** | JWT Access (15m) + Rotating Refresh Token (7d) | Limits the access-token exposure window and supports refresh-token revocation on reuse or compromise. |
| **Session Invalidation** | `refreshTokenHash: null` on password change / deactivation | Prevents existing refresh sessions from continuing after sensitive account changes. |
| **Anti-CSRF** | Double-submit `XSRF-TOKEN` cookie + `X-CSRF-Token` header | Protects state-changing browser requests with constant-time token comparison. |
| **Reverse Proxy Trust** | `app.set('trust proxy', 1)` | Supports correct client-IP handling behind the configured reverse proxy. |
| **Rate Limiting** | Sliding-window IP rate limiting | Reduces brute-force and abuse risk on authentication and public verification endpoints. |
| **Referential Integrity** | `onDelete: Restrict` on Institution → Certificate | Prevents accidental deletion of certificates when an institution record is removed. |
| **Error Sanitization** | Production stack-trace redaction | Reduces the risk of exposing internal paths, implementation details, or environment values. |
| **Auditability** | Administrative audit logging | Provides an activity trail for accountability; retention, access control, and tamper-resistance should be validated separately. |

For production deployment, verify refresh-token rotation, session invalidation, audit-log behavior, rate limits, and authorization boundaries with integration tests rather than relying only on documentation.

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
