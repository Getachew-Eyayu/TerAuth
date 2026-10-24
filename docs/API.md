# TerAuth REST API Documentation

TerAuth exposes a modular REST API built with Node.js, Express, and TypeScript. All protected endpoints mandate JSON Web Token (JWT) Bearer authentication and enforce Role-Based Access Control (RBAC).

---

## Base URL
- Development: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### Login
- **Endpoint**: `POST /api/auth/login`
- **Rate Limit**: 30 requests / 15 minutes
- **Request Body**:
  ```json
  {
    "username": "superadmin",
    "password": "<YOUR_ADMIN_PASSWORD>"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1Ni...",
      "refreshToken": "eyJhbGciOiJIUzI1Ni...",
      "user": {
        "id": "uuid-here",
        "userId": "USR-SA-001",
        "username": "superadmin",
        "email": "admin@terauth.gov.et",
        "role": "SUPER_ADMIN",
        "institution": null
      }
    }
  }
  ```

### Change Password
- **Endpoint**: `POST /api/auth/change-password`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "currentPassword": "<CURRENT_PASSWORD>",
    "newPassword": "<NEW_SECURE_PASSWORD>"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password successfully changed."
  }
  ```

### Refresh Token Rotation
- **Endpoint**: `POST /api/auth/refresh`
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1Ni..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1Ni...",
      "refreshToken": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response (200 OK)**:
  ```json
  { "success": true, "message": "Logged out successfully" }
  ```

### Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response (200 OK)**:
  ```json
  { "success": true, "data": { ...user } }
  ```

---

## 2. Public Verification

### Verify Certificate
- **Endpoint**: `GET /api/verify/:certificateId`
- **Access**: Public (No authentication required)
- **Rate Limit**: 100 requests / 15 minutes per IP
- **Example Call**: `GET /api/verify/TER-2026-8F4K2M9X`
- **Response (200 OK - VALID)**:
  ```json
  {
    "success": true,
    "status": "VALID",
    "message": "Certificate is authentic, valid, and active.",
    "data": {
      "certificateId": "TER-2026-8F4K2M9X",
      "studentName": "Abebe Bikila",
      "degree": "Bachelor of Science in Software Engineering",
      "department": "School of Information Technology and Electrical Engineering",
      "institution": {
        "name": "Addis Ababa Institute of Technology",
        "institutionId": "INST-AAIT-001",
        "type": "University Institute"
      },
      "issueDate": "2026-07-15T00:00:00.000Z",
      "status": "ACTIVE",
      "verifiedBy": "TerAuth National Verification Service",
      "verificationTimestamp": "2026-09-28T19:00:00.000Z"
    }
  }
  ```
- **Response (200 OK - REVOKED)**:
  ```json
  {
    "success": true,
    "status": "REVOKED",
    "message": "WARNING: This certificate has been revoked by the issuing institution.",
    "data": {
      "certificateId": "TER-2026-6M2D9V1K",
      "studentName": "Dawit Haile",
      "status": "REVOKED",
      "revocationReason": "Credential revoked following academic integrity review committee ruling #2026/04.",
      "revokedAt": "2026-02-14T00:00:00.000Z",
      ...
    }
  }
  ```
- **Response (404 Not Found - INVALID)**:
  ```json
  {
    "success": false,
    "status": "INVALID",
    "message": "Certificate not found in the TerAuth National Registry.",
    "queriedId": "TER-9999-NONEXISTENT"
  }
  ```

---

## 3. Institution Management

### Register Institution (Public)
- **Endpoint**: `POST /api/institutions/register`
- **Request Body**:
  ```json
  {
    "institutionName": "Hawassa Institute of Technology",
    "officialEmail": "registrar@hit.edu.et",
    "contactNumber": "+251 46 220 5311",
    "address": "Hawassa, Sidama, Ethiopia",
    "institutionType": "University Institute",
    "adminFullName": "Dr. Girma Bekele",
    "adminUsername": "hit_admin",
    "adminEmail": "girma@hit.edu.et",
    "password": "<STRONG_ADMIN_PASSWORD>"
  }
  ```
- **Response (201 Created)**: Status is set to `PENDING`. Institution cannot issue credentials until Super Admin approval.

### Update Institution Information
- **Endpoint**: `PATCH /api/institutions/:id`
- **Role**: `SUPER_ADMIN` or assigned `INSTITUTION_ADMIN`
- **Request Body**:
  ```json
  {
    "name": "Hawassa Institute of Technology",
    "officialEmail": "registrar@hit.edu.et",
    "contactNumber": "+251 46 220 5311",
    "address": "Campus Ground, Hawassa, Ethiopia"
  }
  ```
- **Response (200 OK)**: Returns updated institution record.

### List Institutions (Super Admin)
- **Endpoint**: `GET /api/institutions?status=PENDING&search=Hawassa`
- **Headers**: `Authorization: Bearer <superAdminToken>`

### Approve Institution (Super Admin)
- **Endpoint**: `PATCH /api/institutions/:id/approve`
- **Headers**: `Authorization: Bearer <superAdminToken>`

### Reject Institution (Super Admin)
- **Endpoint**: `PATCH /api/institutions/:id/reject`
- **Request Body**: `{ "reason": "Accreditation documents incomplete" }`

---

## 4. Certificate Issuance & Management

### Issue Certificate
- **Endpoint**: `POST /api/certificates`
- **Role**: `INSTITUTION_ADMIN` or `SUPER_ADMIN`
- **Request Body**:
  ```json
  {
    "studentName": "Bethlehem Tadesse",
    "degree": "Bachelor of Science in Artificial Intelligence",
    "department": "Faculty of Computing & Data Science",
    "issueDate": "2026-08-01",
    "metadata": { "studentId": "NSTU/AI/2022/019", "cgpa": "3.92" }
  }
  ```
- **Response (201 Created)**:
  Returns generated certificate with unique ID `TER-2026-XXXXXXXX` and anti-tamper QR code data URL.

### List Certificates
- **Endpoint**: `GET /api/certificates?status=ACTIVE&search=Bethlehem`
- **Role**: `INSTITUTION_ADMIN` (auto-scoped to own institution) or `SUPER_ADMIN` (universal).

### Revoke Certificate
- **Endpoint**: `PATCH /api/certificates/:id/revoke`
- **Role**: `INSTITUTION_ADMIN` (own certs only) or `SUPER_ADMIN` (universal)
- **Request Body**:
  ```json
  {
    "reason": "Administrative correction: duplicate record issued."
  }
  ```

---

## 5. Verification Audit Logs

### View Audit Logs
- **Endpoint**: `GET /api/verifications?result=VALID&search=TER-2026`
- **Role**: `SUPER_ADMIN` (all system logs) or `INSTITUTION_ADMIN` (logs for own certificates).
