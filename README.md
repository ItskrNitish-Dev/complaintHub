# ComplaintHub V1 — Civic Complaint Management Platform

> **A realistic, portfolio-quality full-stack platform empowering citizens to report, track, and resolve neighborhood problems in collaboration with municipal authorities.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-v6-blue.svg)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.0-emerald.svg)](https://www.mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-cyan.svg)](https://tailwindcss.com)

---

## 1. Project Overview

ComplaintHub bridges the gap between everyday residents and municipal departments. Citizens can submit civic problems such as potholes, waste accumulation, water leaks, and broken streetlights with photographic evidence and precise GPS coordinates.

Municipal officers receive departmental assignments and update progress on-site. System administrators manage departments, categories, users, officer assignments, and monitor real-time civic analytics.

---

## 2. Key Features by Role

### 👤 Citizen Portal
- **Interactive Multi-Step Reporting**: Title, category, priority, GPS auto-detect, address, and multi-image evidence upload.
- **Civic Explorer**: Search and filter public complaints by status, category, priority, sort order (Newest / Most Upvoted / Highest Priority), or radius ("Nearby Issues" using GPS).
- **Personal Dashboard**: Track submitted issues through dynamic status KPIs (Pending, In Progress, Resolved). Toggle between **My Reports** and **Followed Complaints** tabs.
- **Complaint Details**: Full status timeline, image gallery, location map link, comments thread.
  - ✏️ **Edit** complaint (while in `SUBMITTED` status) via inline modal.
  - 🗑️ **Delete** complaint (owner or admin, while `SUBMITTED`) with confirmation.
  - 🗑️ **Delete comments** (own comments or admin) — trash icon per comment.
  - 📎 **Add Attachments** post-creation via "Add Files" button and upload modal (supports Cloudinary or local fallback).
- **Social Engagement**: Upvote community reports (strictly one vote per citizen), follow updates, and post public comments.
- **In-App Notifications**: Receive alerts whenever status changes, an officer is assigned, or a new attachment is added.
- **Toast Notifications**: Lightweight auto-dismiss (3.5 s) success/error/info toasts replace all browser `alert()` calls.

### 👮 Officer Workspace
- **Departmental Task Roster**: View complaints assigned under specific municipal divisions (Roads, Water, Waste, etc.).
- **Workflow State Transitions**: Move assigned complaints to `IN_PROGRESS` or `RESOLVED` with completion remarks.
- **Dedicated Profile**: Manage division contact and field dispatch info.

### 🛡️ Admin Portal & Analytics
- **Visual Analytics Dashboard**: KPI metrics with Recharts graphs:
  - Complaints by Status (Donut chart)
  - Resolution Throughput over Time (Area chart)
  - Complaints by Category (Bar chart)
- **Work Order Assignment**: Assign and reassign complaints to verified field officers with operational notes.
- **User Management**: Search directory, switch roles (`CITIZEN` ↔ `OFFICER` ↔ `ADMIN`), and activate/deactivate accounts.
- **Category & Department Management**: Full CRUD controls with custom priorities and division codes.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Semantic Civic Design Palette (Light & Dark mode persisted)
- **Routing & State**: React Router DOM v7, TanStack Query, React Hook Form + Zod
- **Icons & Visuals**: Lucide React, Recharts
- **HTTP**: Axios with automatic 401 refresh token queue interceptor

### Backend
- **Runtime & API**: Node.js v22, Express.js (CommonJS layered architecture: Routes → Middleware → Controllers → Services → Models)
- **Database**: MongoDB 8.0 + Mongoose (with `2dsphere` geospatial index)
- **Security**: JWT (15m Access Token + 7d DB Hashed Refresh Token), bcryptjs, Helmet, CORS, Express-Rate-Limit
- **Storage**: Multer file uploads with dual-mode storage (Cloudinary when configured, local disk fallback `/uploads`)

---

## 4. Architecture & Design Principles

```text
Routes (HTTP URL endpoints)
   ↓
Middleware (CORS, Helmet, RateLimiter, protect JWT, authorize RBAC, Multer)
   ↓
Controllers (HTTP parsing, validation, standard JSON envelope)
   ↓
Services (Pure business logic, state machines, automated notifications)
   ↓
Mongoose Models (Data schemas, compound unique indexes, 2dsphere indexes)
   ↓
MongoDB
```

### Complaint Lifecycle State Machine
Status transitions are strictly validated:
```text
SUBMITTED → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
```
*Allowed branch states: `REJECTED`, `DUPLICATE`, `CANCELLED`.*  
Every transition generates an immutable audit record in the `StatusHistory` collection.

---

## 5. Seed Credentials (One-Click Demo Accounts)

The database seed script sets up default test accounts (all passwords: `Password@123`):

| Role | Email | Password | Department |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@complainthub.local` | `Password@123` | System Administration |
| **Officer** | `officer.road@complainthub.local` | `Password@123` | Road Department |
| **Officer** | `officer.waste@complainthub.local` | `Password@123` | Waste Management Department |
| **Officer** | `officer.water@complainthub.local` | `Password@123` | Water Department |
| **Citizen** | `citizen.john@complainthub.local` | `Password@123` | N/A |
| **Citizen** | `citizen.sarah@complainthub.local` | `Password@123` | N/A |

*Note: The Login screen includes one-click buttons to automatically fill these credentials.*

---

## 6. Installation & Running Locally

### Prerequisites
- Node.js v20+ or v22+
- npm v10+
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### Step 1: Clone and Install
```bash
# Clone the repository
git clone <repo-url>
cd ComplaintHub

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Seed the Database
```bash
# From root or inside server directory:
cd server
npm run seed
```

### Step 3: Run Development Servers
```bash
# Terminal 1: Start Backend (Port 5000)
cd server
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd client
npm run dev
```

Visit the application at: **http://localhost:5173**

---

## 7. Running with Docker Compose

To start MongoDB, the Express API, and the Nginx-served React frontend in isolated containers:

```bash
docker compose up --build
```

- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:5000/api/v1/health**
- MongoDB: **localhost:27017**

---

## 8. API Documentation & Curl Examples

All responses follow the standard JSON contract:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### 1. Authentication: Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"citizen.john@complainthub.local","password":"Password@123"}'
```

### 2. Complaints: List & Filter
```bash
curl -X GET "http://localhost:5000/api/v1/complaints?status=IN_PROGRESS&limit=5"
```

### 3. Complaints: Nearby Geospatial Search (10km radius)
```bash
curl -X GET "http://localhost:5000/api/v1/complaints/nearby?lat=40.748817&lng=-73.985131&radius=10000"
```

### 4. Complaints: Upvote (Toggle)
```bash
curl -X POST http://localhost:5000/api/v1/complaints/<COMPLAINT_ID>/vote \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 5. Notifications: Retrieve User Alerts
```bash
curl -X GET http://localhost:5000/api/v1/notifications \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 6. Attachments: Upload to a Complaint
```bash
curl -X POST http://localhost:5000/api/v1/complaints/<COMPLAINT_ID>/attachments \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "attachments=@/path/to/photo.jpg"
```

### 7. Attachments: List for a Complaint
```bash
curl -X GET http://localhost:5000/api/v1/complaints/<COMPLAINT_ID>/attachments
```

### 8. Attachments: Delete a Single Attachment
```bash
curl -X DELETE http://localhost:5000/api/v1/attachments/<ATTACHMENT_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 9. Complaints: Followed by User
```bash
curl -X GET "http://localhost:5000/api/v1/complaints?followedBy=<USER_ID>" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 10. Complaints: Sort Options
```bash
# Newest first (default)
curl "http://localhost:5000/api/v1/complaints?sort=-createdAt"

# Most upvoted
curl "http://localhost:5000/api/v1/complaints?sort=-upvoteCount"

# Highest priority
curl "http://localhost:5000/api/v1/complaints?sort=-priority"
```

---

## 9. License

This project is licensed under the MIT License.
