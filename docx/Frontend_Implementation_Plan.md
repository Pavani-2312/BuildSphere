# Frontend Implementation Plan
## Collaborative Weekly Report Management System
### Technology: React.js (Vite) + React Router v6 + Context API + Socket.io Client

---

## Alignment Notes

This frontend plan is written to align exactly with:
- **Backend API routes** — every service call maps to a defined backend route
- **Socket.io event names** — every event listened to or emitted matches the backend's `events.socket.js`
- **Database field names** — all form keys, payload shapes, and response field references match the `report_entries.data` field specs
- **Role model** — `faculty`, `coordinator`, `admin` with permissions mirroring `roleGuard.middleware.js`
- **Section enum values** — all 17 keys match the backend `constants.js` SECTIONS enum exactly
- **Response structure** — all API responses parsed as `{ success, message, data }` matching `responseHelper.js`
- **Week status values** — `active`, `submitted`, `archived` matching `WEEK_STATUS` in constants
- **Section status values** — `pending`, `in_progress`, `complete` matching `SECTION_STATUS` in constants

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Configuration](#4-environment-configuration)
5. [Routing Architecture](#5-routing-architecture)
6. [State Management](#6-state-management)
7. [Context Providers](#7-context-providers)
8. [Custom Hooks](#8-custom-hooks)
9. [Services Layer](#9-services-layer)
10. [Utility Modules](#10-utility-modules)
11. [Pages — Detailed Implementation](#11-pages--detailed-implementation)
12. [Component Library](#12-component-library)
13. [Section Configuration System](#13-section-configuration-system)
14. [Form Validation Strategy](#14-form-validation-strategy)
15. [Real-Time Collaboration — Socket.io](#15-real-time-collaboration--socketio)
16. [API Integration Strategy](#16-api-integration-strategy)
17. [Role-Based Access Control](#17-role-based-access-control)
18. [Responsive Design Strategy](#18-responsive-design-strategy)
19. [UX Decisions and Behaviour Guidelines](#19-ux-decisions-and-behaviour-guidelines)
20. [Implementation Phases](#20-implementation-phases)

---

## 1. Project Overview

The frontend is a React.js single-page application that allows faculty, coordinators, and admins to collaboratively fill, manage, and export weekly department reports. It consists of six main pages, 17 dynamic section forms, real-time collaboration via Socket.io, role-based access control, and a live report preview with PDF and DOCX export.

The application communicates exclusively with the backend via REST API calls (Axios) and a persistent Socket.io WebSocket connection. All business logic, validation enforcement, and access control are ultimately enforced server-side — the frontend mirrors these rules in the UI only for user experience purposes.

---

## 2. Technology Stack

| Technology | Purpose | Alignment Note |
|---|---|---|
| React.js via Vite | UI framework and build tool | — |
| React Router v6 | Client-side routing | — |
| Context API | Global state: auth, week, socket | Matches backend JWT payload fields |
| Axios | HTTP client | Consumes all `/api/*` routes defined in backend |
| Socket.io Client | Real-time events | Connects to the same HTTP server as Express via Socket.io handshake with JWT auth |
| React Hot Toast | Toast notification system | — |
| React DatePicker | Date picker with range restriction | Enforces week date range from `WeekContext` — mirrors `validateWeek.middleware.js` |
| CSS Modules + Global CSS | Scoped and global styling | — |

No Redux. Context API with custom hooks covers all state requirements.

---

## 3. Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── bvrit_logo.png
└── src/
    ├── assets/
    │   └── styles/
    │       ├── global.css              → Reset, base typography, utility classes
    │       └── theme.css               → CSS variables: colors, fonts, spacing, shadows
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx             → Lists all 17 sections with status badges
    │   │   ├── Loader.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Toast.jsx               → Wraps React Hot Toast
    │   │   ├── ConfirmDialog.jsx
    │   │   ├── StatusBadge.jsx         → pending | in_progress | complete
    │   │   └── ProtectedRoute.jsx
    │   ├── forms/
    │   │   ├── SectionFormWrapper.jsx  → Dynamic form engine driven by sectionConfig.js
    │   │   ├── GeneralPointsForm.jsx
    │   │   ├── FacultyJoinedRelievedForm.jsx
    │   │   ├── FacultyAchievementsForm.jsx
    │   │   ├── StudentAchievementsForm.jsx
    │   │   ├── DepartmentAchievementsForm.jsx
    │   │   ├── FacultyEventsForm.jsx
    │   │   ├── StudentEventsForm.jsx
    │   │   ├── NonTechnicalEventsForm.jsx
    │   │   ├── IndustryVisitsForm.jsx
    │   │   ├── HackathonForm.jsx
    │   │   ├── FacultyFDPForm.jsx
    │   │   ├── FacultyVisitsForm.jsx
    │   │   ├── PatentsForm.jsx
    │   │   ├── VEDICProgramsForm.jsx
    │   │   ├── PlacementsForm.jsx
    │   │   ├── MoUsForm.jsx
    │   │   └── SkillDevelopmentForm.jsx
    │   ├── dashboard/
    │   │   ├── SectionStatusCard.jsx
    │   │   ├── CompletionProgressBar.jsx
    │   │   ├── ContributorTable.jsx    → Visible to coordinator and admin only
    │   │   └── ActivityFeed.jsx        → Driven by /api/dashboard/activity + activity:new socket
    │   ├── entries/
    │   │   ├── EntryTable.jsx
    │   │   ├── EntryRow.jsx            → Shows enteredByName from report_entries
    │   │   └── LiveEditingIndicator.jsx → Driven by user:typing socket event
    │   └── report/
    │       ├── ReportPreview.jsx
    │       ├── ReportSection.jsx
    │       └── ExportButtons.jsx       → Calls /api/report/export/pdf and /docx
    ├── pages/
    │   ├── LoginPage.jsx
    │   ├── DashboardPage.jsx
    │   ├── SectionPage.jsx             → Dynamic: reads :sectionName param, renders correct form
    │   ├── ReportPreviewPage.jsx
    │   ├── UserManagementPage.jsx      → Admin only
    │   ├── WeekManagementPage.jsx      → Coordinator and Admin
    │   └── ProfilePage.jsx
    ├── context/
    │   ├── AuthContext.jsx             → Stores JWT payload: id, name, role, department
    │   ├── WeekContext.jsx             → Stores active week: _id, weekLabel, startDate, endDate, status
    │   └── SocketContext.jsx           → Single Socket.io connection with JWT handshake auth
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useSocket.js
    │   ├── useEntries.js               → section + weekId scoped
    │   ├── useSectionStatus.js
    │   └── useDashboard.js
    ├── services/
    │   ├── api.js                      → Axios instance with interceptors
    │   ├── auth.service.js
    │   ├── entry.service.js
    │   ├── week.service.js
    │   ├── status.service.js
    │   ├── dashboard.service.js
    │   ├── report.service.js
    │   └── user.service.js
    ├── utils/
    │   ├── sectionConfig.js            → Master config: 17 sections, fields, table columns
    │   ├── dateHelpers.js
    │   └── rolePermissions.js          → Pure permission helper functions
    ├── App.jsx
    └── main.jsx
```

---

## 4. Environment Configuration

The frontend requires one environment variable, stored in a `.env` file at the project root:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

- `VITE_API_BASE_URL` is used as the `baseURL` in the Axios instance in `api.js`
- `VITE_SOCKET_URL` is used to initialize the Socket.io client connection in `SocketContext.jsx`
- Both values point to port `5000` — the same port configured in the backend's `.env` (`PORT=5000`)
- In production, both values are updated to the deployed backend URL

---

## 5. Routing Architecture

All routes are defined in `App.jsx` using React Router v6.

### Route Map

| Path | Page Component | Roles Allowed | Notes |
|---|---|---|---|
| `/login` | LoginPage | Public (redirect if logged in) | — |
| `/dashboard` | DashboardPage | All roles | — |
| `/section/:sectionName` | SectionPage | All roles | `:sectionName` must be a valid section enum from backend constants |
| `/report/preview` | ReportPreviewPage | All roles | Faculty: view only. Coordinator/Admin: view + export |
| `/users` | UserManagementPage | `admin` only | Redirects to `/dashboard` for other roles |
| `/weeks` | WeekManagementPage | `coordinator`, `admin` | Redirects to `/dashboard` for faculty |
| `/profile` | ProfilePage | All roles | — |
| `*` | Redirect to `/dashboard` | — | Catch-all |

### ProtectedRoute Behaviour

Every route except `/login` is wrapped in `ProtectedRoute`. It reads `user` from `AuthContext`. If `user` is null (unauthenticated), it redirects to `/login`. If a `requiredRole` prop is provided and the user's role does not match, it redirects to `/dashboard` and shows a "Not authorized" toast.

### Section Name URL Parameter

The `:sectionName` param in `/section/:sectionName` must exactly match one of the 17 section enum values from the backend's `constants.js`:

```
general_points | faculty_joined_relieved | faculty_achievements |
student_achievements | department_achievements | faculty_events_conducted |
student_events_conducted | non_technical_events | industry_college_visits |
hackathon_participation | faculty_fdp_certifications | faculty_visits |
patents_published | vedic_programs | placements | mous_signed |
skill_development_programs
```

The `SectionPage` validates the param against `sectionConfig.js` on load. If the param is not a valid section key, it redirects to `/dashboard` with an error toast.

---

## 6. State Management

State is divided into three tiers:

### Tier 1 — Global Context State

- **AuthContext**: Stores `{ id, name, email, role, department }` decoded from JWT. Also stores the raw access token string in memory (never `localStorage`). Initialized on app load by silently calling `POST /api/auth/refresh` using the httpOnly cookie set by the backend.
- **WeekContext**: Stores the active week object: `{ _id, weekLabel, startDate, endDate, status, department }`. The `status` field directly reflects the backend's `WEEK_STATUS` enum — `active`, `submitted`, or `archived`. `isWeekSubmitted` is a derived boolean computed from `status === 'submitted'`.
- **SocketContext**: Stores the single Socket.io client instance. Initialized after login with the JWT in the handshake `auth` object — matching the backend's `socketConfig.js` JWT verification.

### Tier 2 — Hook-Level State

- **useEntries**: `entries[]`, `loading`, `error` for the current section
- **useSectionStatus**: Array of all 17 `{ section, status, entryCount }` objects
- **useDashboard**: `activeWeek`, `sectionStatuses`, `completionStats`, `totalEntries`

### Tier 3 — Local Component State

- Form field values and per-field validation errors
- Edit mode toggle (add vs update)
- Modal and dialog open/close state
- Button loading spinners during API calls

---

## 7. Context Providers

### AuthContext (`context/AuthContext.jsx`)

**Initialization:**
On app load, `AuthContext` calls `POST /api/auth/refresh` silently using Axios with `withCredentials: true` to read the httpOnly refresh token cookie set by the backend. If the refresh succeeds, the returned access token is decoded and the user object is set in state. If it fails, the user is treated as logged out.

**Exposes:**
- `user` — `{ id, name, email, role, department }` or `null`
- `accessToken` — the current in-memory JWT string, used by the Axios interceptor
- `login(email, password)` — calls `POST /api/auth/login`, sets user and token in context
- `logout()` — calls `POST /api/auth/logout`, clears user and token, disconnects socket

**Token fields match backend JWT payload exactly:**
The backend signs tokens with `{ id, name, role, department }`. The frontend reads these exact keys from the decoded payload and stores them in the `user` object — no field name translation needed.

---

### WeekContext (`context/WeekContext.jsx`)

**Initialization:**
Fetched immediately after `AuthContext` confirms a logged-in user. Calls `GET /api/weeks/active` which returns the active week for the user's department (the department is read server-side from the JWT — the frontend does not pass it as a query parameter).

**Response shape from backend:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "weekLabel": "Week 13 - March 2026",
    "startDate": "2026-03-23T00:00:00.000Z",
    "endDate": "2026-03-28T23:59:59.000Z",
    "department": "CSE(AI&ML)",
    "status": "active",
    "totalEntries": 38
  }
}
```

**Exposes:**
- `activeWeek` — the full week object or `null` if none exists
- `isWeekSubmitted` — `activeWeek?.status === 'submitted'`
- `refreshWeek()` — re-fetches the active week on demand (called after week submit, after week creation)

**Used by:** Every section page (to restrict date picker range and show read-only mode), the dashboard (week label and stats), and the week management page.

---

### SocketContext (`context/SocketContext.jsx`)

**Initialization:**
The Socket.io client is initialized after login. The connection URL is `VITE_SOCKET_URL`. The JWT access token is passed in the handshake `auth` object — this is read and verified by the backend's `socketConfig.js` JWT middleware:

```
io(VITE_SOCKET_URL, {
  auth: { token: accessToken },
  transports: ['websocket', 'polling']
})
```

After connecting, the client emits a join message with the active `weekId` and `department` so the backend places the socket into the correct room `${weekId}_${department}`.

**Exposes:**
- `socket` — the Socket.io client instance
- Components and hooks use `useSocket()` to access this and subscribe in `useEffect`

**Disconnection:**
The socket is disconnected when the user logs out via `AuthContext.logout()`.

---

## 8. Custom Hooks

### `useAuth()`
Consumes `AuthContext`. Returns `{ user, accessToken, login, logout }`. Used in every component that needs to know the current user's identity or role.

---

### `useSocket()`
Consumes `SocketContext`. Returns the `socket` instance. Components use it to add event listeners in `useEffect` with cleanup to prevent stale listeners.

---

### `useEntries(sectionName, weekId)`

Manages all data operations for a specific section of a specific week.

**On mount:**
Calls `GET /api/entries?section={sectionName}&weekId={weekId}` via `entry.service.js`. The backend returns only non-deleted entries for this section and week, sorted by `createdAt` ascending.

**State:**
- `entries` — array of entry documents. Each entry has `_id`, `data`, `enteredBy`, `enteredByName`, `enteredByRole`, `lastEditedByName`, `lastEditedAt`, `createdAt`
- `loading` — boolean
- `error` — error message string or null

**Exposes:**
- `entries`, `loading`, `error`
- `addEntry(data)` — calls `POST /api/entries` with `{ section: sectionName, data }`. On success, appends the returned entry to `entries` array
- `updateEntry(entryId, data)` — calls `PUT /api/entries/:id` with `{ data }`. On success, replaces the matching entry in `entries`
- `deleteEntry(entryId)` — calls `DELETE /api/entries/:id`. On success, removes the entry from `entries`

**Real-time sync:**
The hook also subscribes to Socket.io events from the backend for the current section:
- `entry:created` where `payload.section === sectionName` → appends `payload.entry` to `entries`
- `entry:updated` where `payload.section === sectionName` → replaces matching entry by `payload.entryId`
- `entry:deleted` where `payload.section === sectionName` → removes entry by `payload.entryId`

These listeners are registered in a `useEffect` with the socket as a dependency and cleaned up on unmount with `socket.off()`.

---

### `useSectionStatus(weekId)`

Fetches the status of all 17 sections for the active week.

Calls `GET /api/status` — the backend returns an array of 17 objects:
```json
[
  { "section": "general_points", "status": "in_progress", "entryCount": 3 },
  { "section": "faculty_joined_relieved", "status": "pending", "entryCount": 0 },
  ...
]
```

Also exposes `updateStatus(section, status)` which calls `PATCH /api/status/:section` — only used by coordinators and admins.

Subscribes to `section:status_changed` Socket.io event `{ section, status, entryCount }` to keep status badges in sync in real time without re-fetching.

---

### `useDashboard()`

Fetches the full dashboard summary in parallel using `Promise.all()` on three separate calls:
- `GET /api/dashboard/summary` — week + section statuses + completion stats + total entries
- `GET /api/dashboard/activity` — last 20 audit log entries
- `GET /api/dashboard/contributors` — faculty contribution breakdown (coordinator/admin only)

Exposes: `summary`, `activity`, `contributors`, `loading`, `error`.

Subscribes to `activity:new` Socket.io event to prepend new activity items in real time — this event is emitted by the backend's `auditLogger.service.js` after every meaningful action.

---

## 9. Services Layer

### `api.js` — Axios Instance

Creates a single Axios instance:
- `baseURL`: `VITE_API_BASE_URL` (e.g., `http://localhost:5000/api`)
- `withCredentials: true` — required for the httpOnly refresh token cookie to be sent on every request
- `Content-Type: application/json`

**Request interceptor:**
Reads `accessToken` from `AuthContext` and attaches it as `Authorization: Bearer <token>` to every outgoing request.

**Response interceptor:**
On a `401` response:
1. Calls `POST /api/auth/refresh` with `withCredentials: true`
2. If refresh succeeds: stores the new access token in `AuthContext` and retries the original failed request with the new token
3. If refresh fails: calls `AuthContext.logout()` and redirects to `/login`

All API responses from the backend follow the shape `{ success, message, data }` from `responseHelper.js`. Service modules extract and return `response.data.data` to hooks, and propagate `response.data.message` for error toasts.

---

### Service Modules

Each service module wraps Axios calls for one domain. All service functions are async and throw errors with the backend's `message` string on failure.

#### `auth.service.js`
Maps to backend `auth.routes.js`:
- `login(email, password)` → `POST /api/auth/login`
- `logout()` → `POST /api/auth/logout`
- `refresh()` → `POST /api/auth/refresh`
- `getMe()` → `GET /api/auth/me`

#### `entry.service.js`
Maps to backend `entry.routes.js`:
- `getEntries(sectionName, weekId)` → `GET /api/entries?section={sectionName}&weekId={weekId}`
- `createEntry(sectionName, data)` → `POST /api/entries` with body `{ section: sectionName, data }`
- `updateEntry(entryId, data)` → `PUT /api/entries/:id` with body `{ data }`
- `deleteEntry(entryId)` → `DELETE /api/entries/:id`

**Payload shape note:** The `data` object sent to the backend must contain only the fields defined for that section in `sectionConfig.js` — these keys must match the database field specs in `report_entries.data` exactly. No extra fields should be sent.

#### `week.service.js`
Maps to backend `week.routes.js`:
- `getActiveWeek()` → `GET /api/weeks/active`
- `getAllWeeks()` → `GET /api/weeks`
- `createWeek(payload)` → `POST /api/weeks` with `{ weekLabel, startDate, endDate, department }`
- `submitWeek(weekId)` → `PATCH /api/weeks/:id/submit`
- `archiveWeek(weekId)` → `PATCH /api/weeks/:id/archive` (admin only)

#### `status.service.js`
Maps to backend `status.routes.js`:
- `getAllStatuses()` → `GET /api/status`
- `updateStatus(section, status)` → `PATCH /api/status/:section` with body `{ status }`

#### `dashboard.service.js`
Maps to backend `dashboard.routes.js`:
- `getSummary()` → `GET /api/dashboard/summary`
- `getActivity()` → `GET /api/dashboard/activity`
- `getContributors()` → `GET /api/dashboard/contributors`

#### `report.service.js`
Maps to backend `report.routes.js`:
- `getPreview()` → `GET /api/report/preview` — returns assembled JSON report data
- `exportPDF()` → `GET /api/report/export/pdf` — response type: `blob`, triggers browser download
- `exportDOCX()` → `GET /api/report/export/docx` — response type: `blob`, triggers browser download

**File download handling:** For PDF and DOCX exports, Axios is called with `responseType: 'blob'`. The returned blob is converted to a temporary object URL, an anchor tag is programmatically clicked to trigger the download, and the URL is then revoked.

#### `user.service.js`
Maps to backend `user.routes.js`:
- `getAllUsers(filters)` → `GET /api/users?role={role}&department={dept}`
- `createUser(payload)` → `POST /api/users`
- `updateUser(userId, payload)` → `PUT /api/users/:id`
- `deactivateUser(userId)` → `PATCH /api/users/:id/deactivate`
- `activateUser(userId)` → `PATCH /api/users/:id/activate`

---

## 10. Utility Modules

### `sectionConfig.js`

The single source of truth for all 17 section definitions on the frontend. This file mirrors the field specifications from the database plan's `report_entries.data` field and the backend's `utils/sectionFields.js`.

**Structure per section:**
```javascript
{
  sectionKey: {
    displayName: "Student Achievements",
    description: "Individual student recognitions with roll number and department",
    fields: [
      {
        key: "studentName",        // Must match report_entries.data field key exactly
        label: "Student Name",
        type: "text",              // text | number | date | select | textarea
        required: true,
        placeholder: "Enter full name",
        validation: { minLength: 2, maxLength: 100 }
      },
      {
        key: "rollNumber",
        label: "Roll Number",
        type: "text",
        required: true,
        placeholder: "e.g. 22WH1A6622",
        validation: { pattern: /^\d{2}WH[0-9]{1}A\d{4}$/, patternMessage: "Invalid roll number format" }
      },
      {
        key: "achievementDetails",
        label: "Achievement Details",
        type: "textarea",
        required: true,
        validation: { minLength: 5 }
      },
      {
        key: "date",
        label: "Date",
        type: "date",
        required: true
        // Date range enforced by WeekContext.activeWeek.startDate and endDate
      }
    ],
    tableColumns: [
      { header: "Student Name", dataKey: "studentName" },
      { header: "Roll No", dataKey: "rollNumber" },
      { header: "Achievement Details", dataKey: "achievementDetails" },
      { header: "Date", dataKey: "date" }
    ]
  }
}
```

**All 17 section keys** defined in this file must match the backend `SECTIONS` enum exactly:
`general_points`, `faculty_joined_relieved`, `faculty_achievements`, `student_achievements`, `department_achievements`, `faculty_events_conducted`, `student_events_conducted`, `non_technical_events`, `industry_college_visits`, `hackathon_participation`, `faculty_fdp_certifications`, `faculty_visits`, `patents_published`, `vedic_programs`, `placements`, `mous_signed`, `skill_development_programs`

**Select field options** must match backend enum values. Examples:
- `general_points.pointType`: `parent_teacher_meeting`, `department_meeting`, `announcement`, `other`
- `faculty_joined_relieved.type`: `joined`, `relieved`
- `faculty_fdp_certifications.platform`: `NPTEL`, `Coursera`, `EDX`, `Industry`, `Other`
- `vedic_programs.participantType`: `student`, `faculty`
- `vedic_programs.centre`: `Hyderabad`, `Bangalore`

---

### `dateHelpers.js`

Pure functions:
- `formatDate(isoString)` — converts ISO date string to readable format (e.g., `19-03-2026`)
- `isDateInRange(date, startDate, endDate)` — returns boolean; used in form validation to check against `activeWeek.startDate` and `activeWeek.endDate`
- `timeAgo(isoString)` — returns human-readable relative time (e.g., "3 hours ago") for activity feed

---

### `rolePermissions.js`

Pure functions that accept a `user` object and return booleans. These mirror the backend's `roleGuard.middleware.js` allowed roles:

- `canEditEntry(user, entry)` — `user.id === entry.enteredBy || ['coordinator','admin'].includes(user.role)`
- `canDeleteEntry(user, entry)` — same as canEditEntry
- `canMarkSectionComplete(user)` — `['coordinator','admin'].includes(user.role)`
- `canSubmitWeek(user)` — `['coordinator','admin'].includes(user.role)`
- `canExportReport(user)` — `['coordinator','admin'].includes(user.role)`
- `canManageUsers(user)` — `user.role === 'admin'`
- `canCreateWeek(user)` — `['coordinator','admin'].includes(user.role)`
- `canViewContributors(user)` — `['coordinator','admin'].includes(user.role)`

---

## 11. Pages — Detailed Implementation

---

### Page 1: Login Page

**Route:** `/login`
**Backend calls:** `POST /api/auth/login`

**Layout:** A vertically and horizontally centered card on a neutral gradient background. The BVRIT logo and institution name sit above the card.

**Form Fields:**
- Email address input (`type: email`)
- Password input (`type: password`) with show/hide toggle
- Login button

**Behaviour:**

Client-side validation checks non-empty email (valid format) and non-empty password before making any API call. On submit, the button shows a loading spinner. On success, the backend returns `{ success: true, data: { accessToken } }` in the response body and sets the `refreshToken` as an httpOnly cookie. The access token is stored in `AuthContext`. The user is redirected to `/dashboard`.

On failure, the backend returns `{ success: false, message: "Invalid credentials" }` or `"Your account has been deactivated."` — these messages are shown in a red banner inside the card (not a toast, so they cannot be missed).

If a logged-in user navigates to `/login`, `ProtectedRoute` redirects them to `/dashboard` immediately.

---

### Page 2: Dashboard Page

**Route:** `/dashboard`
**Backend calls:**
- `GET /api/dashboard/summary`
- `GET /api/dashboard/activity`
- `GET /api/dashboard/contributors` (coordinator/admin only)

**Socket.io events listened to:**
- `section:status_changed` → updates section card badge
- `activity:new` → prepends item to activity feed
- `week:submitted` → shows read-only banner across the page

**Layout:** Three vertical zones — top stats row, section status grid, bottom row (activity feed + contributor table).

**Top Stats Row:**

Four stat cards:
- Active week label and date range (from `activeWeek.weekLabel`, `startDate`, `endDate`)
- Total entries count (from `completionStats.totalEntries`)
- Completion count: "X of 17 sections complete" (from `completionStats.complete`)
- Submit Week button — visible only when `canSubmitWeek(user)` returns true

The Submit Week button calls `PATCH /api/weeks/:id/submit`. Before calling, it opens a confirmation modal listing all 17 section statuses. If any sections have `status: 'pending'`, a warning is shown inside the modal. The coordinator can proceed despite the warning. On success, `WeekContext.refreshWeek()` is called to update the active week status — which triggers read-only mode across all section pages.

**Section Status Grid:**

17 cards in a CSS grid (4 columns desktop, 2 tablet, 1 mobile). Each card:
- Section display name from `sectionConfig.js`
- `StatusBadge` component showing `pending` (grey) / `in_progress` (amber) / `complete` (green) — these values come directly from the backend's `SECTION_STATUS` enum
- Entry count from `section_status.entryCount`
- "Mark Complete" button — conditionally rendered only when `canMarkSectionComplete(user)` is true; calls `PATCH /api/status/:section` with `{ status: 'complete' }`

Cards are sorted dynamically: `in_progress` first, then `pending`, then `complete`.

**Activity Feed:**

Driven by `GET /api/dashboard/activity` which returns the last 20 `audit_logs` entries for the active week, sorted by `timestamp` descending. Each item displays `performedByName`, `changeDescription`, and `timeAgo(timestamp)`. New items animate in when the `activity:new` Socket.io event is received.

**Contributor Breakdown Table:**

Rendered only when `canViewContributors(user)` is true. Driven by `GET /api/dashboard/contributors` which returns faculty with their entry counts from an aggregation on `report_entries`.

---

### Page 3: Section Page (Dynamic — serves all 17 sections)

**Route:** `/section/:sectionName`
**Backend calls:**
- `GET /api/entries?section={sectionName}&weekId={activeWeek._id}` on mount
- `POST /api/entries` on form submit (add mode)
- `PUT /api/entries/:id` on form submit (edit mode)
- `DELETE /api/entries/:id` on delete confirm

**Socket.io events listened to:**
- `entry:created` where `payload.section === sectionName` → append to table
- `entry:updated` where `payload.section === sectionName` → replace in table
- `entry:deleted` where `payload.section === sectionName` → remove from table
- `user:typing` where `payload.section === sectionName` → show `LiveEditingIndicator`
- `user:stopped_typing` where `payload.section === sectionName` → hide indicator
- `week:submitted` → hide form panel, show locked banner

**Socket.io events emitted:**
- `user:typing` with `{ section: sectionName }` — emitted on form focus, debounced to every 2 seconds
- `user:leave_section` with `{ section: sectionName }` — emitted in `useEffect` cleanup on unmount

**Layout:** Two-panel layout (desktop). Left panel: form (40%). Right panel: entry table (60%). On tablet: stacked. On mobile: tabbed.

**Section Header:**
Section display name from `sectionConfig.js[sectionName].displayName`, a `StatusBadge` component, and the `LiveEditingIndicator` component below it.

**Left Panel — Entry Form:**

Fields are rendered dynamically by `SectionFormWrapper` from `sectionConfig.js[sectionName].fields`. No hardcoded field rendering.

Date pickers are configured with `minDate={activeWeek.startDate}` and `maxDate={activeWeek.endDate}` — this mirrors the backend's `validateWeek.middleware.js` date range enforcement.

**Form operates in two modes:**
- **Add mode** — button reads "Add Entry". On success, `useEntries.addEntry(data)` appends the new entry. The backend response shape is `{ success: true, data: { _id, section, data, enteredByName, createdAt, ... } }` — the `data` field in the response is the full `report_entries` document.
- **Edit mode** — triggered by clicking the Edit icon on an entry row. The entry's `data` object populates the form. Button reads "Update Entry". On success, `useEntries.updateEntry(entryId, data)` replaces the matching entry. A "Cancel" button returns to add mode.

**Right Panel — Entry Table:**

Rendered by `EntryTable` using column definitions from `sectionConfig.js[sectionName].tableColumns`. Each row rendered by `EntryRow` shows:
- All data fields
- `enteredByName` label (from `report_entries.enteredByName` — denormalized by backend, no join needed)
- Edit icon — shown when `canEditEntry(user, entry)` is true
- Delete icon — same condition. Clicking opens `ConfirmDialog`. On confirm, calls `deleteEntry(entry._id)` — this is a soft delete on the backend (`isDeleted: true`)

**Read-Only Mode:**
When `WeekContext.isWeekSubmitted` is true, the left panel is hidden entirely and a locked banner is shown. Triggered immediately via Socket.io `week:submitted` event without requiring a page refresh.

---

### Page 4: Report Preview Page

**Route:** `/report/preview`
**Backend calls:**
- `GET /api/report/preview` — returns the fully assembled report JSON
- `GET /api/report/export/pdf` — blob download (coordinator/admin only)
- `GET /api/report/export/docx` — blob download (coordinator/admin only)

**Socket.io events listened to:**
- `entry:created`, `entry:updated`, `entry:deleted` on any section → shows "Report updated — click to refresh" banner

**Layout:** Centered white container styled to match the institution's report format, with sticky export buttons pinned to top-right.

**Preview Content:**

`ReportPreview` calls `GET /api/report/preview` on mount. The backend assembles all entries grouped by section and returns a structured JSON object. The preview renders:
- BVRIT institution header with logo
- `weekLabel` and date range from `activeWeek`
- All 17 sections in order (same order as `sectionConfig.js`) via `ReportSection` components
- Sections with empty `entries: []` still render with an empty table — required by the institution's format

**Export Buttons:**

`ExportButtons` is rendered only when `canExportReport(user)` is true. Clicking "Export as PDF" calls `report.service.exportPDF()` with `responseType: 'blob'` and triggers a download of `Weekly_Report_{weekLabel}.pdf`. Clicking "Export as DOCX" does the same for `.docx`. Both buttons are disabled and show spinners while generation is in progress.

---

### Page 5: User Management Page

**Route:** `/users` (Admin only)
**Backend calls:**
- `GET /api/users?role={role}&department={dept}` — list users
- `POST /api/users` — create user
- `PUT /api/users/:id` — update role/department
- `PATCH /api/users/:id/deactivate` — deactivate
- `PATCH /api/users/:id/activate` — reactivate

**Layout:** Filter bar + Add User button + user table.

**Filters:** Department dropdown, Role dropdown (`faculty` / `coordinator` / `admin`), Active/Inactive toggle. These are passed as query params to `GET /api/users`.

**User Table Columns:** Name, Email, Department, Role, Status (`isActive`), Last Login, Actions.

**Actions per row:** Edit (opens modal to change role/department via `PUT /api/users/:id`), Deactivate/Reactivate (calls the appropriate PATCH endpoint with a `ConfirmDialog`).

**Add User Modal:** Fields: Full name, Email, Temporary password, Role (select: `faculty`/`coordinator`/`admin`), Department. On submit, calls `POST /api/users`. The backend hashes the password — the frontend sends it in plaintext over HTTPS.

---

### Page 6: Week Management Page

**Route:** `/weeks` (Coordinator and Admin)
**Backend calls:**
- `GET /api/weeks/active` — current active week
- `GET /api/weeks` — all weeks (paginated)
- `POST /api/weeks` — create new week
- `PATCH /api/weeks/:id/submit` — submit active week
- `PATCH /api/weeks/:id/archive` — archive (admin only)

**Active Week Card:**
Shows `weekLabel`, `startDate`, `endDate`, `status`. Contains a "Submit Week" button with the same pre-submission checklist modal as the dashboard. On submit, calls `PATCH /api/weeks/:id/submit`, then calls `WeekContext.refreshWeek()`.

**Create New Week Form:**
Fields: `weekLabel` (text), `startDate` (date picker), `endDate` (date picker). Admin users also see a Department dropdown — coordinators default to their own department (the backend reads department from JWT, ignoring any client-sent value for coordinators). Submits via `POST /api/weeks`.

Validation enforced on the frontend before submission:
- `endDate` must be after `startDate`
- Duration must not exceed 7 days (mirrors backend week validation)

**Historical Weeks Table:**
Columns: Week Label, Date Range, Department, Status, Actions. "View Report" button calls `GET /api/report/export/pdf?weekId={id}` or `docx` for archived weeks.

---

## 12. Component Library

### Common Components

**Navbar** — Fixed top bar. Shows BVRIT logo on left. Shows `user.name`, `user.department`, `user.role` badge on right. Logout button calls `AuthContext.logout()`, which calls `POST /api/auth/logout` and redirects to `/login`.

**Sidebar** — Lists all 17 sections using the ordered keys from `sectionConfig.js`. Each item shows `displayName` and a `StatusBadge` driven by `useSectionStatus`. Active section (matching current URL param) is highlighted. Complete sections show a checkmark icon.

**StatusBadge** — Accepts a `status` prop (`pending` | `in_progress` | `complete`) and renders a colour-coded pill. These exact string values come from the backend's `SECTION_STATUS` enum.

**ProtectedRoute** — Reads `user` from `AuthContext`. Redirects to `/login` if unauthenticated. Redirects to `/dashboard` if `requiredRole` is set and does not match `user.role`.

**ConfirmDialog** — Modal for destructive actions. Cancel is the default focused element. Confirm button uses red styling.

**Modal** — Generic reusable modal wrapper. Closes on overlay click or Escape key.

**Loader** — Full-page spinner for initial app load. Smaller inline variant for buttons.

**Toast** — Wraps React Hot Toast. Exposes `showSuccess(message)`, `showError(message)`, `showInfo(message)`.

---

### Form Components

**SectionFormWrapper** — The core dynamic form engine. Reads `sectionConfig.js[sectionName].fields` and renders each field by type. Manages validation state. Handles add/edit mode. Passes `data` payload up to the page component on submission. Date fields use React DatePicker with `minDate` and `maxDate` from `WeekContext.activeWeek`.

**17 Individual Section Form Components** — Each imports `SectionFormWrapper` and passes its section key. This keeps rendering logic centralized while allowing section-specific customization if needed. All field `key` values in each form match the database `report_entries.data` field names exactly.

---

### Dashboard Components

**SectionStatusCard** — Props: `sectionKey`, `displayName`, `status`, `entryCount`. Shows `StatusBadge`. "Mark Complete" button calls `status.service.updateStatus(section, 'complete')` — only rendered when `canMarkSectionComplete(user)` is true.

**CompletionProgressBar** — Horizontal bar showing `complete / 17` sections. Animates on value change.

**ActivityFeed** — Scrollable list of `audit_logs` entries: `performedByName`, `changeDescription`, `timeAgo(timestamp)`. New items animate in from top on `activity:new` socket event.

**ContributorTable** — Shows faculty name and entry count from `GET /api/dashboard/contributors`. Rendered only when `canViewContributors(user)` is true.

---

### Entry Components

**EntryTable** — Full section entry table. Column headers from `sectionConfig.js[section].tableColumns`. Shows skeleton rows while loading. Shows empty state when `entries.length === 0`.

**EntryRow** — Renders one `report_entries` document as a table row. Shows all `data` field values. Shows `enteredByName` label below the row (from the denormalized `report_entries.enteredByName` field). Shows Edit and Delete icons conditionally via `canEditEntry(user, entry)` and `canDeleteEntry(user, entry)`.

**LiveEditingIndicator** — Shows "Name is currently editing this section" when `user:typing` socket event is received with `payload.section === currentSection`. Auto-dismisses 5 seconds after the last event. Hidden when `user:stopped_typing` is received for this section.

---

### Report Components

**ReportPreview** — Fetches `GET /api/report/preview` on mount. Renders institution header, week details, and maps over the 17-section array returned by the backend.

**ReportSection** — Renders one section: heading, and a table with column headers from the backend's assembled report data. Renders empty table rows when `entries.length === 0` (required by institution format).

**ExportButtons** — Two buttons: "Export as PDF" → `report.service.exportPDF()`, "Export as DOCX" → `report.service.exportDOCX()`. Rendered only when `canExportReport(user)` is true. Sticky positioning in the viewport.

---

## 13. Section Configuration System

`sectionConfig.js` is the most critical utility file. It must be kept in sync with:
- The backend `utils/sectionFields.js` (same field keys and column structures)
- The database `report_entries.data` field specifications (same field names and types)
- The backend `entry.validator.js` Joi schemas (same required flags, patterns, and enums)

Any change to a section's fields in the backend must be reflected in `sectionConfig.js` immediately. This is the single point of truth for dynamic form rendering, table column rendering, and client-side validation on the frontend.

---

## 14. Form Validation Strategy

Validation runs at three moments:
1. **On blur** — validates only the field the user just left
2. **On change** — re-validates as the user types (after the field has been touched once)
3. **On submit** — validates all fields before the API call is made

If any field fails on submit, the API call is blocked, all errors are shown simultaneously, and the page scrolls to the first error field.

**Rules applied — matching backend `entry.validator.js`:**

- Required fields: must not be empty or whitespace only
- Date fields: must fall within `activeWeek.startDate` to `activeWeek.endDate` — same range enforced by `validateWeek.middleware.js` on the backend
- Number fields (`studentsPlaced`, `packageLPA`, `sessionsCount`, etc.): must be non-negative integers
- Select fields: must be one of the enum values defined in `sectionConfig.js` (which match the backend's Joi enum schemas)
- Roll number (`student_achievements.rollNumber`): must match pattern `/^\d{2}WH[0-9]{1}A\d{4}$/` — same regex used in backend Joi validator
- Textarea fields: configurable max character count with live counter

Validation errors appear inline below each field. No modal or toast is used for field-level errors.

---

## 15. Real-Time Collaboration — Socket.io

### Connection Setup

The Socket.io client connects to `VITE_SOCKET_URL` after login. The access token is passed in the handshake `auth` object — verified by `socketConfig.js` on the backend using `JWT_ACCESS_SECRET`.

After connection is confirmed, the client emits a room-join payload: `{ weekId: activeWeek._id, department: user.department }`. The backend places the socket in room `${weekId}_${department}`.

### Events the Frontend Listens To

These match exactly the events defined in the backend's `events.socket.js`:

| Event | Payload | Handler Location | Action |
|---|---|---|---|
| `entry:created` | `{ section, entry }` | `useEntries` hook | Append `entry` to entries array if `section` matches current |
| `entry:updated` | `{ section, entryId, updatedEntry }` | `useEntries` hook | Replace matching entry by `entryId` |
| `entry:deleted` | `{ section, entryId }` | `useEntries` hook | Remove matching entry by `entryId` |
| `section:status_changed` | `{ section, status, entryCount }` | `useSectionStatus` hook | Update matching section's status and count |
| `week:submitted` | `{ weekId, submittedByName }` | All pages via WeekContext | Call `refreshWeek()`, trigger read-only mode |
| `user:typing` | `{ userId, userName, section }` | SectionPage | Show `LiveEditingIndicator` if section matches |
| `user:stopped_typing` | `{ userId, section }` | SectionPage | Hide `LiveEditingIndicator` |
| `user:joined` | `{ userId, userName }` | Optional presence display | Show online presence |
| `user:left` | `{ userId }` | Optional presence display | Remove from presence |
| `activity:new` | `{ performedByName, changeDescription, timestamp, section }` | `useDashboard` hook | Prepend to activity feed |

### Events the Frontend Emits

These match what the backend's `events.socket.js` listens for:

| Event | When Emitted | Payload |
|---|---|---|
| `user:typing` | User focuses section form, debounced every 2 seconds | `{ section: sectionName }` |
| `user:leave_section` | `useEffect` cleanup on SectionPage unmount | `{ section: sectionName }` |

### Subscription Pattern

Every page that uses socket events subscribes inside a `useEffect` with the `socket` as a dependency. The cleanup function calls `socket.off(eventName)` for every subscribed event. This prevents stale listeners from accumulating as the user navigates between sections.

---

## 16. API Integration Strategy

All API calls go through service modules using the shared Axios instance from `api.js`. The response interceptor handles 401 token expiry automatically with a refresh-and-retry flow. Error messages from the backend's `responseHelper.js` format are extracted and shown as error toasts.

**No optimistic updates.** The UI does not update before the server confirms success. Buttons show loading spinners during API calls and the state update only occurs after the success response.

---

## 17. Role-Based Access Control

Three roles from the backend: `faculty`, `coordinator`, `admin`. Enforced in the UI via `rolePermissions.js` functions and `ProtectedRoute` for route-level control.

| Feature | Faculty | Coordinator | Admin |
|---|---|---|---|
| View dashboard | ✓ | ✓ | ✓ |
| View activity feed | ✓ | ✓ | ✓ |
| View contributor table | ✗ | ✓ | ✓ |
| Add entries | ✓ | ✓ | ✓ |
| Edit own entries | ✓ | ✓ | ✓ |
| Edit any entry | ✗ | ✓ | ✓ |
| Delete own entries | ✓ | ✓ | ✓ |
| Delete any entry | ✗ | ✓ | ✓ |
| Mark section complete | ✗ | ✓ | ✓ |
| Submit week | ✗ | ✓ | ✓ |
| Create week | ✗ | ✓ (own dept) | ✓ (any dept) |
| Archive week | ✗ | ✗ | ✓ |
| Export PDF/DOCX | ✗ | ✓ | ✓ |
| View report preview | ✓ (no export) | ✓ | ✓ |
| Manage users | ✗ | ✗ | ✓ |
| Reset passwords | ✗ | ✗ | ✓ |

UI elements for restricted features are not rendered at all (not just disabled) — matching the backend's `roleGuard.middleware.js` 403 enforcement.

---

## 18. Responsive Design Strategy

Primary target is desktop (faculty use laptops). Layout degrades gracefully on smaller screens.

| Breakpoint | Layout |
|---|---|
| 1024px and above | Two-panel section layout, full sidebar, 4-column dashboard grid |
| 768px to 1023px | Single column, form above table, 2-column dashboard grid, sidebar collapses to icon strip |
| Below 768px | Fully stacked, sidebar as hamburger overlay, 1-column dashboard grid, section page uses tabs |

On mobile, the Section Page shows the form and table as two tabs ("Add Entry" / "View Entries") rather than side by side.

---

## 19. UX Decisions and Behaviour Guidelines

**No auto-save.** All entries must be explicitly submitted. Prevents accidental partial submissions.

**No optimistic updates.** UI waits for server confirmation. Ensures the user never sees unsaved data.

**Toasts** for all successful and failed operations: entry added, entry updated, entry deleted, section marked complete, week submitted, export started, export failed, any API error. Error toasts stay until manually dismissed. Success toasts auto-dismiss after 4 seconds.

**Empty states** show when a section has no entries yet. Message: "No entries yet. Use the form on the left to add the first entry."

**Loading skeletons** shown during initial entry table fetch instead of blank space.

**Read-only mode** triggers automatically via Socket.io `week:submitted` event — no page refresh needed. The entry form panel is hidden and a non-dismissible banner appears: "This week has been submitted. Entries are locked." This is also enforced by checking `WeekContext.isWeekSubmitted` on every section page load.

**Confirmation dialogs** for all destructive actions: delete entry, submit week, deactivate user. Cancel is the default focused element.

**Newly added or updated rows** in `EntryTable` are highlighted with a pulse animation for 3 seconds — applied both for the user's own submissions and for entries received via Socket.io from other users.

---

## 20. Implementation Phases

Implementation phases align with the backend's implementation steps so the two can be developed and tested together.

### Phase 1 — Foundation (aligns with Backend Steps 1–5)
- Set up Vite + React project with folder structure
- Create `.env` with `VITE_API_BASE_URL` and `VITE_SOCKET_URL`
- Configure React Router v6 with all six routes and catch-all redirect
- Implement `AuthContext` with silent refresh on app load (`POST /api/auth/refresh`)
- Build `api.js` Axios instance with request and response interceptors
- Implement `auth.service.js` and wire to `AuthContext.login()` and `logout()`
- Build Login Page with validation and error banner
- Implement `ProtectedRoute` with role-based redirect

### Phase 2 — Week and Status Foundation (aligns with Backend Steps 6–8)
- Implement `WeekContext` calling `GET /api/weeks/active`
- Implement `week.service.js` and `status.service.js`
- Implement `useSectionStatus` hook calling `GET /api/status`
- Build Navbar and Sidebar shell — Sidebar driven by `sectionConfig.js` section order and `useSectionStatus` status badges

### Phase 3 — Core Section Flow (aligns with Backend Steps 9–10)
- Build `sectionConfig.js` for all 17 sections — field keys matching database specs
- Build `SectionFormWrapper` with dynamic field rendering, date range enforcement, and validation
- Build all 17 individual section form components
- Build `EntryTable` and `EntryRow` — columns from `sectionConfig.js`, `enteredByName` from response
- Implement `useEntries` hook calling `GET`, `POST`, `PUT`, `DELETE /api/entries`
- Build `entry.service.js`
- Wire up `SectionPage` with two-panel layout, add/edit/delete flow, and read-only mode check

### Phase 4 — Real-Time Collaboration (aligns with Backend Step 11)
- Implement `SocketContext` with JWT handshake auth and room join
- Add socket event listeners in `useEntries` for `entry:created`, `entry:updated`, `entry:deleted`
- Build `LiveEditingIndicator` and wire `user:typing` / `user:stopped_typing` events in SectionPage
- Add `section:status_changed` listener in `useSectionStatus`
- Add `week:submitted` listener in WeekContext — triggers `refreshWeek()` and read-only mode on all pages

### Phase 5 — Dashboard (aligns with Backend Step 12)
- Build `useDashboard` hook with parallel service calls
- Build Dashboard Page: stats row, section status grid, activity feed, contributor table
- Build `SectionStatusCard`, `CompletionProgressBar`, `ActivityFeed`, `ContributorTable`
- Wire "Mark Complete" button to `PATCH /api/status/:section`
- Wire "Submit Week" button to `PATCH /api/weeks/:id/submit` with pre-submission checklist modal
- Add `activity:new` socket listener to `ActivityFeed`

### Phase 6 — Report Preview and Export (aligns with Backend Step 13)
- Build `report.service.js` with `getPreview()`, `exportPDF()`, `exportDOCX()`
- Build `ReportPreview`, `ReportSection`, and `ExportButtons` components
- Style preview to match institution format (matching backend HTML template structure)
- Add real-time "Report updated" banner via entry socket events on the preview page

### Phase 7 — Admin Pages and Polish (aligns with Backend Steps 14–17)
- Build `user.service.js` and `UserManagementPage`
- Build `WeekManagementPage` with active week card, create form, and historical week table
- Build `ProfilePage` calling `GET /api/auth/me` and `PUT /api/users/:id`
- Complete responsive design breakpoints
- Add empty states, skeleton loaders, and error states to all data-loading components
- End-to-end test across all three roles: faculty, coordinator, admin
- Verify all Socket.io events propagate correctly across multiple browser tabs
