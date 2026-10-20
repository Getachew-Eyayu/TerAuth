# TerAuth Database Schema & Architecture

TerAuth uses a relational database schema managed through **Prisma ORM**. The platform supports both **PostgreSQL** (production deployment) and **SQLite** (instant zero-configuration local development/evaluation).

---

## Entity Relationship Overview

```mermaid
erDiagram
    INSTITUTION ||--o{ USER : "employs"
    INSTITUTION ||--o{ CERTIFICATE : "issues"
    CERTIFICATE ||--o{ VERIFICATION_LOG : "referenced_in"

    INSTITUTION {
        string id PK "UUID"
        string institutionId UK "e.g. INST-AAIT-001"
        string name "Full Institution Name"
        string officialEmail UK "Official Domain Email"
        string contactNumber "Official Telephone"
        string address "Campus Physical Address"
        string type "University, College, Agency"
        string status "PENDING, APPROVED, REJECTED, SUSPENDED"
        string rejectionReason "Nullable explanation"
        datetime createdAt
        datetime updatedAt
    }

    USER {
        string id PK "UUID"
        string userId UK "e.g. USR-AAIT-001"
        string username UK "Unique login handle"
        string email UK "Contact email"
        string passwordHash "bcrypt salt rounds: 12"
        string role "SUPER_ADMIN, INSTITUTION_ADMIN, ORGANIZATION_ADMIN"
        string status "ACTIVE, INACTIVE"
        string institutionId FK "Nullable for Super Admin"
        string refreshTokenHash "Hashed JWT refresh token"
        datetime createdAt
        datetime updatedAt
    }

    CERTIFICATE {
        string id PK "UUID"
        string certificateId UK "e.g. TER-2026-8F4K2M9X"
        string studentName "Recipient full legal name"
        string degree "Conferred degree or qualification"
        string department "Faculty or major field"
        datetime issueDate "Date of academic conferral"
        string qrCodeUrl "Anti-tamper QR code data URL"
        string institutionId FK "Issuing institution"
        string status "ACTIVE, REVOKED"
        string revocationReason "Published justification"
        datetime revokedAt "Timestamp when invalidated"
        string metadata "JSON string of honors/CGPA"
        datetime createdAt
        datetime updatedAt
    }

    VERIFICATION_LOG {
        string id PK "UUID"
        string certificateId FK "Nullable if certificate does not exist"
        string queriedId "Exact input string searched"
        string result "VALID, REVOKED, INVALID"
        string ipAddress "Client IP address"
        string userAgent "Client browser or scanner device"
        datetime timestamp "Query timestamp"
    }
```

---

## Key Constraints & Security Rules

1. **Unique Constraints**:
   - `Institution.institutionId` & `Institution.officialEmail`
   - `User.userId`, `User.username`, & `User.email`
   - `Certificate.certificateId`: Strictly non-sequential cryptographically generated identifiers (`TER-YYYY-XXXXXXXX`).
2. **Foreign Key Integrity**:
   - Deleting an institution cascades to certificates.
   - Deleting a certificate sets `certificateId` on existing verification logs to `NULL` to preserve immutable audit history.
3. **Data Protection**:
   - Plaintext passwords and secret tokens are never stored. Passwords use `bcryptjs` with salt rounds 12.
   - Database internal UUIDs and user hashes are never exposed in public verification endpoints.

---

## Production Database Operations & Migration Guide

In development, schemas may be synced via `npm run prisma:push`. However, in production, schema updates **must never** use `db push --accept-data-loss`.

### Standard Production Deployment Steps:
1. Switch active schema to PostgreSQL:
   ```bash
   npm run db:use-postgres
   ```
2. Check pending migrations status:
   ```bash
   npm run prisma:migrate:status
   ```
3. Apply version-controlled migration files safely:
   ```bash
   npm run prisma:migrate:deploy
   ```
4. (Optional) Run database seeder for initial administrative accounts:
   ```bash
   npm run prisma:seed
   ```

### Automated Backup Recommendation:
Configure daily `pg_dump` backups for the PostgreSQL database:
```bash
pg_dump -U postgres -d terauth -Fc -f "/backups/terauth-$(date +%Y%m%d%H%M%S).dump"
```
