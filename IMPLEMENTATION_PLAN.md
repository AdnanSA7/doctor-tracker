# Implementation Plan — Doctor Tracker

## 1. Architecture Overview
Doctor Tracker is a secure administrative web application for managing doctors, their patients, and operational analytics.
- **Monorepo Workspace**: npm workspaces uniting shared schemas/types, Express backend API, and Next.js frontend.
- **Persistence Layer**: MongoDB via Mongoose with optimized indexing, reference relationships (`Patient` references `Doctor` via `doctorId`), and server-side pagination/filtering/sorting.
- **Backend (`backend/`)**: Node.js, Express, TypeScript, REST API (`/api/v1`), Zod validation, secure HttpOnly cookie-based sessions (or JWT tokens), bcrypt password hashing, rate limiting, and centralized error handling.
- **Frontend (`frontend/`)**: Next.js App Router, React, TypeScript strict mode, Tailwind CSS, TanStack React Query, React Hook Form, Zod client validation, Recharts, and Lucide icons.

---

## 2. Database Models & Schema Design

### Admin (User) Model
- `name`: String (Required)
- `email`: String (Required, unique, lowercase, trimmed)
- `passwordHash`: String (Required, bcrypt hashed)
- `role`: String (Enum: `['admin']`, default: `admin`)
- Timestamps (`createdAt`, `updatedAt`)
- *Index*: `email` (unique)

### Doctor Model
- `name`: String (Required, indexed)
- `specialization`: String (Required, indexed)
- `hospital`: String (Required, indexed)
- `phone`: String (Required)
- `email`: String (Required, lowercase, trimmed)
- Timestamps
- *Indexes*: `{ name: 'text', specialization: 'text', hospital: 'text' }`, `specialization`, `hospital`, `createdAt`

### Patient Model
- `name`: String (Required, indexed)
- `age`: Number (Required, min: 0, max: 150)
- `gender`: String (Optional, Enum: `['Male', 'Female', 'Other']`)
- `condition`: String (Required, indexed)
- `phone`: String (Optional)
- `email`: String (Optional)
- `doctorId`: ObjectId (Required, ref: `Doctor`, indexed)
- Timestamps
- *Indexes*: `doctorId`, `condition`, `name`, `createdAt`
- *Deletion Rule*: Restrict doctor deletion if associated patients exist (or require explicit reassignment/cascade option, implemented safely).

---

## 3. REST API Contract (`/api/v1`)

### Authentication
- `POST /api/v1/auth/login` — Authenticates admin, sets secure session cookie.
- `POST /api/v1/auth/logout` — Clears session cookie.
- `GET /api/v1/auth/me` — Returns current authenticated admin profile.

### Doctors
- `GET /api/v1/doctors` — List doctors with search, filter (specialization, hospital), sort, and server-side pagination (`page`, `limit`).
- `POST /api/v1/doctors` — Create a new doctor (Admin only).
- `GET /api/v1/doctors/:id` — Get doctor details by ID.
- `PATCH /api/v1/doctors/:id` — Update doctor details.
- `DELETE /api/v1/doctors/:id` — Delete doctor (fails if patients assigned unless forced/checked).

### Doctor-Associated Patients
- `GET /api/v1/doctors/:id/patients` — List patients assigned to a specific doctor (with pagination/search).
- `POST /api/v1/doctors/:id/patients` — Create and assign a patient to this doctor.

### Patients (Global)
- `GET /api/v1/patients` — List all patients across doctors with search, condition filter, doctor filter, sort, pagination.
- `GET /api/v1/patients/:id` — Get patient by ID.
- `PATCH /api/v1/patients/:id` — Update patient details.
- `DELETE /api/v1/patients/:id` — Delete patient with confirmation.

### Dashboard & Analytics
- `GET /api/v1/dashboard/summary` — Total counts, recent doctors/patients, patient-to-doctor ratios.
- `GET /api/v1/dashboard/analytics` — Aggregation time series (patients/doctors over time), condition distribution, patients per doctor.

### Health
- `GET /health` — API health check and DB connection status.

---

## 4. Milestones & Implementation Phases

1. **Phase 1**: Repository Inspection & Planning (Done)
2. **Phase 2**: Project Foundation (Monorepo setup, TypeScript, ESLint, Prettier, `.env.example`, package scripts)
3. **Phase 3**: Database & API Foundation (Mongoose connection, models, initial admin bootstrap script, auth middleware, session management)
4. **Phase 4**: Doctor & Patient REST APIs (CRUD routers, Zod validation, query builders, aggregation pipelines, integration tests)
5. **Phase 5**: Frontend Shell & Authentication (Next.js layout, sidebar, header, login page, API client, auth context)
6. **Phase 6**: Doctor Management UI (Doctor list with search/filter/pagination, create doctor form, doctor details view, patient assignment)
7. **Phase 7**: Patient Management UI (Global patients table, edit modal, delete confirmation, filters)
8. **Phase 8**: Dashboard & Visualizations (Summary metrics, Recharts graphs for timeline and condition distribution)
9. **Phase 9**: UX, Security & Performance (Error boundaries, toast notifications, loading skeletons, security headers, rate limiting)
10. **Phase 10**: Testing & Verification (Unit tests, API integration tests, E2E test setup, build verification)
11. **Phase 11**: Documentation & Handoff (Comprehensive README.md, technical decisions, deployment guide)

---

## 5. Security Approach
- Passwords hashed with `bcrypt` (work factor 12).
- Session cookies with `HttpOnly`, `SameSite=lax`, and `Secure` in production.
- Strict input validation on every endpoint using Zod schemas.
- Protection against NoSQL injection via Mongoose type casting and query sanitization.
- Rate limiting on authentication (`express-rate-limit`).
- CORS configured strictly for frontend origin.
- Sensitive data redaction in logging.

---

## 6. Testing Strategy
- **Unit & Integration Tests**: Vitest/Supertest for API endpoints (auth, doctors, patients, dashboard).
- **E2E Tests**: Playwright workflows covering login, doctor creation, patient assignment, and filtering.
- **Build Checks**: TypeScript strict compilation (`tsc --noEmit`), linting (`eslint`), and production builds (`next build`, `tsc` for API).
