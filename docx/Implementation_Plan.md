# Collaborative Weekly Report Management System
## Tech Stack Recommendation & Detailed Implementation Plan

---

## Tech Stack Recommendation: MERN Stack

**Recommended:** MongoDB + Express.js + React.js + Node.js

### Why MERN Over Java + React?

| Factor | MERN Stack | Java + React |
|---|---|---|
| Development Speed | Very fast — single language (JS) across frontend & backend | Slower — context switching between Java and JS |
| Real-time Collaboration | Native WebSocket support via Socket.io | Requires additional setup with Spring WebSocket |
| JSON Handling | Native — MongoDB stores JSON directly | Requires serialization/deserialization overhead |
| Deployment | Lightweight, easy to deploy on free tiers (Render, Railway, Vercel) | Heavier, needs more server resources |
| Learning Curve | Moderate — one language end to end | Steep — two languages + Spring framework complexity |
| PDF/DOCX Generation | Rich npm ecosystem (pdfkit, docx, puppeteer) | Apache POI for DOCX, iText for PDF — more verbose |
| Community & Libraries | Massive npm ecosystem, faster prototyping | Mature but heavier |
| Fit for this Project | Excellent — document-heavy, collaborative, real-time | Good but over-engineered for this scope |

### Final Verdict

MERN is the best choice for this project because:
- The entire report is document/JSON structured — MongoDB's document model fits perfectly
- Real-time collaboration needs WebSockets — Node.js handles concurrent connections effortlessly
- 17 dynamic form sections with nested data — React's component model handles this cleanly
- PDF and DOCX generation libraries are richer and simpler in the Node.js ecosystem
- One language (JavaScript) across the entire stack reduces coordination overhead in a team

---

---

# PART 1: DATABASE PLAN

## Technology: MongoDB (with Mongoose ODM)

---

## Why MongoDB for This Project

This project revolves around a weekly report that has 17 sections, each with dynamic, variable-length entries. Relational databases would require 17+ tables with complex joins. MongoDB stores each weekly report as a self-contained document with nested arrays for each section — exactly mirroring the report's real-world structure. Sections can have zero, one, or many entries without schema changes.

---

## Database Name

```
bvrit_weekly_reports
```

---

## Collections

### 1. `users`

Stores all system users — faculty, coordinators, and admins.

**Fields:**
- `_id` — Auto-generated unique identifier
- `name` — Full name of the user
- `email` — Unique login email
- `password` — Bcrypt-hashed password
- `role` — Enum: `faculty`, `coordinator`, `admin`
- `department` — Department the user belongs to (e.g., CSE AI&ML, EEE)
- `isActive` — Boolean flag to enable or disable accounts
- `createdAt` — Timestamp of account creation
- `lastLogin` — Timestamp of last successful login

**Indexes:**
- Unique index on `email`
- Compound index on `role + department` for filtered queries

---

### 2. `weeks`

Represents a reporting week. Each report is isolated by week. Only one active week exists at a time per department.

**Fields:**
- `_id` — Auto-generated unique identifier
- `weekLabel` — Human-readable label (e.g., "Week 13 - March 2026")
- `startDate` — Start date of the reporting week
- `endDate` — End date of the reporting week
- `department` — Department this week belongs to
- `status` — Enum: `active`, `submitted`, `archived`
- `createdBy` — Reference to the admin/coordinator who opened this week
- `submittedBy` — Reference to the coordinator who submitted the final report
- `submittedAt` — Timestamp of submission
- `createdAt` — Timestamp

**Indexes:**
- Compound index on `department + status` for fetching the active week of a department
- Index on `startDate` and `endDate` for date-range validation

---

### 3. `report_entries`

The core collection. Every individual data entry across all 17 sections is stored as a separate document here. This design allows entries to be added, edited, and deleted independently without touching the entire report.

**Fields:**
- `_id` — Auto-generated unique identifier
- `weekId` — Reference to the `weeks` collection (which reporting week this belongs to)
- `department` — Department this entry belongs to
- `section` — Enum identifying which of the 17 sections this entry belongs to:
  - `general_points`
  - `faculty_joined_relieved`
  - `faculty_achievements`
  - `student_achievements`
  - `department_achievements`
  - `faculty_events_conducted`
  - `student_events_conducted`
  - `non_technical_events`
  - `industry_college_visits`
  - `hackathon_participation`
  - `faculty_fdp_certifications`
  - `faculty_visits`
  - `patents_published`
  - `vedic_programs`
  - `placements`
  - `mous_signed`
  - `skill_development_programs`
- `data` — A flexible object containing the section-specific fields (see Section Field Specifications below)
- `enteredBy` — Reference to the `users` collection — who submitted this entry
- `enteredByName` — Denormalized name for display without joins
- `lastEditedBy` — Reference to the user who last modified this entry
- `lastEditedAt` — Timestamp of last edit
- `createdAt` — Timestamp of creation
- `isDeleted` — Soft delete flag (entries are never hard deleted for audit trail)

**Indexes:**
- Compound index on `weekId + section` — the most frequent query pattern
- Compound index on `weekId + department + section`
- Index on `enteredBy` for accountability tracking
- Index on `isDeleted` to filter out soft-deleted entries

---

## Section Field Specifications (inside `data` object)

Each section's `data` object contains fields specific to that section:

### general_points
- `pointType` — Enum: `parent_teacher_meeting`, `department_meeting`, `announcement`, `other`
- `description` — Free text description of the point
- `date` — Date of the event

### faculty_joined_relieved
- `facultyName` — Name of the faculty
- `designation` — Designation (e.g., Assistant Professor)
- `type` — Enum: `joined`, `relieved`
- `date` — Date of joining or relieving

### faculty_achievements
- `facultyName` — Name of the faculty
- `achievementType` — Enum: `award`, `guest_lecture`, `reviewer`, `jury`, `other`
- `details` — Description of the achievement
- `date` — Date of achievement

### student_achievements
- `studentName` — Name of the student
- `rollNumber` — Roll number
- `achievementDetails` — Description of achievement
- `date` — Date of achievement

### department_achievements
- `details` — Description of the department-level achievement
- `date` — Date

### faculty_events_conducted
- `eventName` — Name of the event
- `eventType` — Enum: `FDP`, `Workshop`, `STTP`, `other`
- `resourcePersonDetails` — Name and details of resource persons
- `coordinatorName` — Name of coordinator
- `facultyParticipated` — Number of faculty who participated
- `fromDate` — Start date
- `toDate` — End date

### student_events_conducted
- `eventName` — Topic or name of the event
- `eventType` — Enum: `Workshop`, `Guest Lecture`, `Technical Event`, `other`
- `resourcePersonDetails` — Guest or speaker details
- `coordinatorName` — Coordinator name
- `studentsParticipated` — Number of students
- `fromDate` — Start date
- `toDate` — End date

### non_technical_events
- `eventName` — Name of the event
- `resourcePersonDetails` — Guest details if any
- `coordinatorName` — Coordinator name
- `studentsParticipated` — Number of students
- `fromDate` — Start date
- `toDate` — End date

### industry_college_visits
- `institutionName` — Name of industry or college visited
- `location` — Location of the institution
- `coordinatorName` — Coordinator who organized the visit
- `studentsParticipated` — Number of students
- `fromDate` — Start date
- `toDate` — End date

### hackathon_participation
- `eventName` — Name of hackathon or external event
- `conductedBy` — Organizing institution or body
- `mentorDetails` — Name of the mentor faculty
- `studentsParticipated` — Number of students (with roll numbers if needed)
- `fromDate` — Start date
- `toDate` — End date

### faculty_fdp_certifications
- `facultyName` — Name of faculty
- `certificationName` — Name of the FDP, workshop, or certification
- `platform` — Enum: `NPTEL`, `Coursera`, `EDX`, `Industry`, `Other`
- `organizedBy` — Organizing body
- `fromDate` — Start date
- `toDate` — End date

### faculty_visits
- `facultyName` — Name of visiting faculty
- `institutionVisited` — Name and location of the college or industry visited
- `fromDate` — Start date
- `toDate` — End date

### patents_published
- `facultyName` — Name of inventor(s)
- `patentTitle` — Title of the patent
- `applicationNumber` — Patent application number
- `publicationDate` — Date of publication

### vedic_programs
- `programName` — Name of the VEDIC program
- `participantType` — Enum: `student`, `faculty`
- `centre` — Enum: `Hyderabad`, `Bangalore`
- `participantsCount` — Number of participants
- `fromDate` — Start date
- `toDate` — End date
- `facultyDetails` — Applicable only for faculty participants: name, workshop, association

### placements
- `companyName` — Name of the company
- `studentsPlaced` — Number of students placed
- `packageLPA` — Package offered in LPA
- `date` — Date of placement drive

### mous_signed
- `organizationName` — Name of the organization
- `signingDate` — Date of signing
- `validityPeriod` — Duration of the MoU
- `purpose` — Main purpose or objective of the MoU

### skill_development_programs
- `programName` — Name of the program (e.g., MLOPs, BFSI)
- `facultyCoordinator` — Name of coordinating faculty
- `topicsCovered` — Topics covered and faculty who handled
- `studentsCount` — Number of students
- `batchYear` — Year of students (e.g., 2nd year)
- `sessionsCount` — Number of sessions conducted

---

### 4. `section_status`

Tracks the completion status of each section for a given week and department. Used by the dashboard.

**Fields:**
- `_id` — Auto-generated
- `weekId` — Reference to the `weeks` collection
- `department` — Department name
- `section` — Section name (same enum as `report_entries`)
- `status` — Enum: `pending`, `in_progress`, `complete`
- `lastUpdatedBy` — User who last changed the status
- `lastUpdatedAt` — Timestamp

**Indexes:**
- Compound unique index on `weekId + department + section`

---

### 5. `audit_logs`

Tracks all create, update, and delete actions for full traceability.

**Fields:**
- `_id` — Auto-generated
- `action` — Enum: `create`, `update`, `delete`, `submit`, `login`
- `performedBy` — Reference to user
- `performedByName` — Denormalized name
- `targetCollection` — Which collection was affected
- `targetId` — ID of the affected document
- `weekId` — Week context
- `section` — Section context (if applicable)
- `changeDescription` — Human-readable description of what changed
- `timestamp` — When the action occurred

---

## Database Design Principles Applied

- **Soft Deletes:** Entries are never hard-deleted. `isDeleted: true` is set so audit trails are maintained and accidental deletes can be recovered.
- **Denormalization for Performance:** User names are stored alongside references so dashboards don't need joins for display.
- **Week Isolation:** Every entry is tied to a `weekId` ensuring complete separation of data between reporting periods.
- **Date Validation at DB Level:** `startDate` and `endDate` on the `weeks` collection serve as the reference boundary — the backend enforces that all event dates in entries fall within this range.
- **Flexible `data` Object:** The `data` field in `report_entries` is section-specific but stored as a flexible embedded document, avoiding the need for 17 separate collections while still keeping data structured via Mongoose schemas.

---

---

# PART 2: BACKEND PLAN

## Technology: Node.js + Express.js + Mongoose

---

## Project Structure

```
backend/
├── config/
│   ├── db.js                  → MongoDB connection setup
│   └── constants.js           → Section enums, role enums, status enums
├── models/
│   ├── User.js
│   ├── Week.js
│   ├── ReportEntry.js
│   ├── SectionStatus.js
│   └── AuditLog.js
├── middleware/
│   ├── auth.js                → JWT verification middleware
│   ├── roleGuard.js           → Role-based access control middleware
│   ├── validateWeek.js        → Checks if the active week is open for editing
│   └── errorHandler.js        → Centralized error handling
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── week.routes.js
│   ├── entry.routes.js
│   ├── dashboard.routes.js
│   ├── report.routes.js
│   └── status.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── week.controller.js
│   ├── entry.controller.js
│   ├── dashboard.controller.js
│   ├── report.controller.js
│   └── status.controller.js
├── services/
│   ├── reportGenerator.js     → Assembles all entries into report format
│   ├── pdfExporter.js         → Generates PDF using Puppeteer
│   ├── docxExporter.js        → Generates DOCX using the docx npm library
│   ├── emailService.js        → Optional: sends report via email
│   └── auditLogger.js         → Centralized audit log writer
├── socket/
│   └── collaborationSocket.js → Socket.io real-time event handlers
├── validators/
│   ├── entry.validator.js     → Section-specific field validation rules
│   └── user.validator.js      → User registration/update validation
├── utils/
│   ├── dateUtils.js           → Date range validation helpers
│   └── responseHelper.js      → Standardized API response formatter
├── app.js                     → Express app setup, middleware registration
└── server.js                  → HTTP + Socket.io server entry point
```

---

## Core Modules & Detailed Explanation

---

### Module 1: Authentication & Authorization

**Technology:** JSON Web Tokens (JWT) + Bcrypt

**How it works:**

When a user logs in with email and password, the backend looks up the user in the database, compares the password hash using Bcrypt, and if valid, issues a signed JWT token containing the user's ID, role, and department. This token is returned to the client and must be sent in the `Authorization` header as a Bearer token on every subsequent request.

The `auth.js` middleware intercepts every protected route, extracts the token, verifies its signature, decodes the payload, and attaches the user object to the request context. If the token is missing, expired, or tampered with, a 401 Unauthorized response is returned immediately.

The `roleGuard.js` middleware sits on top of auth. It accepts a list of allowed roles (e.g., `['admin', 'coordinator']`) and checks whether the authenticated user's role is in that list. If not, it returns a 403 Forbidden response. This ensures faculty cannot access admin-only routes.

**Token Strategy:**
- Access tokens expire in 8 hours (covers a full working day without re-login)
- Refresh tokens are stored in an httpOnly cookie and expire in 7 days
- On refresh, a new access token is issued without requiring re-login

---

### Module 2: User Management

**Who can do what:**

| Action | Faculty | Coordinator | Admin |
|---|---|---|---|
| Register (self) | No | No | Yes |
| View own profile | Yes | Yes | Yes |
| Edit own profile | Yes | Yes | Yes |
| View all users | No | Yes (own dept) | Yes |
| Create/deactivate users | No | No | Yes |
| Change user roles | No | No | Yes |

**Key operations:**
- Admin creates accounts for faculty and coordinators, assigning their department and role
- Passwords are hashed with Bcrypt (salt rounds: 12) before storage
- Deactivating a user sets `isActive: false` — they cannot log in but their historical entries remain intact
- Every user action (login, profile update) is recorded in the audit log

---

### Module 3: Week Management

**Concept:** The system operates on a concept of an "active week." Only one week per department can be active at a time. When a week is active, entries can be added. When submitted, the week is locked and no further edits are permitted.

**Week Lifecycle:**
1. Admin or coordinator opens a new week by specifying `startDate`, `endDate`, `weekLabel`, and `department`
2. The system automatically seeds all 17 section statuses as `pending` for this week
3. Faculty and coordinators add entries — section status updates to `in_progress` automatically
4. Coordinator marks individual sections as `complete` after review
5. When all 17 sections are complete (or coordinator decides), they submit the week
6. Week status changes to `submitted`, entries become read-only
7. Admin can archive old weeks

**Validation rules enforced:**
- A new week cannot be created if another active week exists for the same department
- `endDate` must be after `startDate`
- Week duration cannot exceed 7 days

---

### Module 4: Report Entry Management

This is the most critical module. It handles all CRUD operations for entries across all 17 sections.

**Creating an Entry:**

When a faculty member submits an entry for a section, the backend:
1. Verifies the JWT and extracts the user's identity
2. Checks that an active week exists for the user's department using `validateWeek.js` middleware
3. Validates the incoming `data` object against the section-specific validation rules in `entry.validator.js` (e.g., roll number format for student achievements, date format, required fields)
4. Checks that all date fields in the entry fall within the active week's `startDate` to `endDate` range
5. Creates the entry in `report_entries` with `enteredBy` set to the user's ID
6. Updates the corresponding `section_status` document to `in_progress` if it was `pending`
7. Writes an audit log record
8. Emits a Socket.io event to notify other connected users that a new entry was added to this section

**Editing an Entry:**

Only the original contributor or a coordinator/admin can edit an entry. The backend:
1. Fetches the entry by ID and verifies ownership or elevated role
2. Validates the updated `data` fields
3. Re-validates dates against the active week range
4. Updates `lastEditedBy` and `lastEditedAt`
5. Writes an audit log record with change description
6. Emits a Socket.io update event

**Deleting an Entry:**

Deletion is always soft (sets `isDeleted: true`). Hard deletion is never performed. Only coordinators and admins can delete entries. Faculty can only delete their own entries within the active week.

**Fetching Entries:**

The most common fetch pattern is: "give me all entries for section X of week Y for department Z." This query hits the compound index on `weekId + section` and filters `isDeleted: false`. Results are sorted by `createdAt` ascending.

---

### Module 5: Section Status Management

Each of the 17 sections has a status per week per department: `pending`, `in_progress`, or `complete`.

**Auto-transitions:**
- When the first entry is added to a section → status becomes `in_progress`
- When all entries in a section are deleted → status reverts to `pending`

**Manual transitions:**
- Coordinators and admins can manually mark a section as `complete` after reviewing all entries
- They can also revert a section from `complete` back to `in_progress` if corrections are needed

**Dashboard query:** The dashboard fetches all 17 section statuses for the active week in a single query and returns a completion summary (e.g., 11 complete, 4 in progress, 2 pending).

---

### Module 6: Real-Time Collaboration (Socket.io)

This module enables multiple faculty members to see each other's contributions in real time without refreshing the page.

**Connection Flow:**
1. When a user opens the report entry page, the React frontend establishes a Socket.io connection, sending the JWT for authentication
2. The backend verifies the token and registers the socket connection against the user's identity
3. The user joins a Socket.io room identified by `weekId + department` (e.g., `week13_CSE_AIML`)

**Events Emitted by Server:**
- `entry:created` — A new entry was added to a section (carries section name and entry data)
- `entry:updated` — An existing entry was modified (carries entry ID and updated data)
- `entry:deleted` — An entry was soft-deleted (carries entry ID and section)
- `section:status_changed` — A section's status changed (carries section and new status)
- `week:submitted` — The week was submitted and is now locked (triggers a read-only mode on all clients)

**Events Received from Client:**
- `user:typing` — A user has opened a particular section's form (shows "User X is editing Section Y" indicator)
- `user:left_section` — User closed or submitted a section form

**Room Management:**
- Users are isolated to their department's room so cross-department data is never mixed
- When a user disconnects, their typing indicator is removed from all sections

---

### Module 7: Report Generation

This service assembles all entries for a given week and produces the final report.

**Assembly Process:**

The `reportGenerator.js` service queries all non-deleted entries for the specified `weekId` and `department`, grouped by section. It then maps each section's entries into structured data objects matching the institution's prescribed report format. Empty sections are preserved in the output with empty table rows (as required by the format).

**PDF Generation using Puppeteer:**

The assembled report data is passed to an HTML template that mirrors the institution's format — complete with the BVRIT letterhead, logo, tables for each section, and proper heading hierarchy. Puppeteer launches a headless Chromium browser, renders this HTML, and exports it as a PDF with the exact styling, fonts, and layout of the original document. The PDF is streamed back to the client as a file download.

**DOCX Generation using the `docx` npm library:**

The same assembled report data is passed to the DOCX builder, which programmatically constructs a Word document using the library's Document, Table, TableRow, TableCell, and Paragraph primitives. Each section becomes a heading followed by a formatted table matching the prescribed column structure. The completed document is serialized to a Buffer and streamed to the client as a `.docx` download.

**Generation Permissions:**
- Coordinators and admins can generate reports at any time during the active week (for preview)
- Faculty can only access the live preview, not download
- Once a week is submitted, the final report can be downloaded by all roles

---

### Module 8: Dashboard API

Returns aggregated data for the coordinator and admin dashboard.

**Data returned:**
- Active week details (label, date range, status)
- All 17 section statuses with entry counts per section
- Total entries this week
- List of contributing faculty with entry counts (accountability view)
- Recent activity feed (last 10 audit log entries)
- Overall completion percentage

---

### API Route Summary

**Auth Routes** (`/api/auth`):
- `POST /login` — Login and receive JWT
- `POST /logout` — Invalidate refresh token
- `POST /refresh` — Get new access token using refresh token

**User Routes** (`/api/users`) — Admin only for write operations:
- `GET /` — List all users (admin: all, coordinator: own dept)
- `POST /` — Create a new user (admin only)
- `GET /:id` — Get user profile
- `PUT /:id` — Update user details
- `PATCH /:id/deactivate` — Deactivate a user

**Week Routes** (`/api/weeks`):
- `GET /active` — Get the currently active week for user's department
- `POST /` — Create a new week (coordinator/admin only)
- `PATCH /:id/submit` — Submit and lock a week (coordinator/admin only)
- `GET /` — List all weeks (for archive browsing)

**Entry Routes** (`/api/entries`):
- `GET /` — Get all entries for a section (query params: `weekId`, `section`)
- `POST /` — Create a new entry
- `PUT /:id` — Update an entry
- `DELETE /:id` — Soft delete an entry

**Status Routes** (`/api/status`):
- `GET /` — Get all section statuses for active week
- `PATCH /:section` — Manually update a section status (coordinator/admin)

**Dashboard Routes** (`/api/dashboard`):
- `GET /summary` — Get full dashboard summary
- `GET /activity` — Get recent audit log activity

**Report Routes** (`/api/report`):
- `GET /preview` — Get assembled report data as JSON (for live preview)
- `GET /export/pdf` — Download report as PDF
- `GET /export/docx` — Download report as DOCX

---

### Security Measures

- All routes except `/api/auth/login` require a valid JWT
- Rate limiting applied on auth routes to prevent brute force (max 10 login attempts per 15 minutes per IP)
- Helmet.js applied to set secure HTTP headers
- CORS configured to allow only the frontend domain
- Input sanitization applied on all incoming request bodies to prevent NoSQL injection
- All file generation happens in memory (buffers) — no temporary files stored on disk

---

---

# PART 3: FRONTEND PLAN

## Technology: React.js + React Router + Context API + Socket.io Client

---

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── bvrit_logo.png
├── src/
│   ├── assets/
│   │   └── styles/
│   │       ├── global.css
│   │       └── theme.css           → CSS variables for colors, fonts, spacing
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Toast.jsx           → Notification toasts
│   │   │   ├── ConfirmDialog.jsx   → Delete confirmation dialog
│   │   │   ├── StatusBadge.jsx     → Pending / In Progress / Complete badge
│   │   │   └── ProtectedRoute.jsx  → Route wrapper that checks auth & role
│   │   ├── forms/
│   │   │   ├── SectionFormWrapper.jsx   → Generic wrapper for all section forms
│   │   │   ├── GeneralPointsForm.jsx
│   │   │   ├── FacultyJoinedForm.jsx
│   │   │   ├── FacultyAchievementsForm.jsx
│   │   │   ├── StudentAchievementsForm.jsx
│   │   │   ├── DepartmentAchievementsForm.jsx
│   │   │   ├── FacultyEventsForm.jsx
│   │   │   ├── StudentEventsForm.jsx
│   │   │   ├── NonTechnicalEventsForm.jsx
│   │   │   ├── IndustryVisitsForm.jsx
│   │   │   ├── HackathonForm.jsx
│   │   │   ├── FacultyFDPForm.jsx
│   │   │   ├── FacultyVisitsForm.jsx
│   │   │   ├── PatentsForm.jsx
│   │   │   ├── VEDICProgramsForm.jsx
│   │   │   ├── PlacementsForm.jsx
│   │   │   ├── MoUsForm.jsx
│   │   │   └── SkillDevelopmentForm.jsx
│   │   ├── dashboard/
│   │   │   ├── SectionStatusCard.jsx
│   │   │   ├── CompletionProgressBar.jsx
│   │   │   ├── ContributorTable.jsx
│   │   │   └── ActivityFeed.jsx
│   │   ├── report/
│   │   │   ├── ReportPreview.jsx        → Full live preview component
│   │   │   ├── ReportSection.jsx        → Renders one section in preview format
│   │   │   └── ExportButtons.jsx        → PDF / DOCX download buttons
│   │   └── entries/
│   │       ├── EntryTable.jsx           → Displays entries in a section as a table
│   │       ├── EntryRow.jsx             → Single entry row with edit/delete
│   │       └── LiveEditingIndicator.jsx → Shows "User X is editing this section"
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── SectionPage.jsx         → Dynamic page that renders any of the 17 sections
│   │   ├── ReportPreviewPage.jsx
│   │   ├── UserManagementPage.jsx  → Admin only
│   │   ├── WeekManagementPage.jsx  → Admin/Coordinator only
│   │   └── ProfilePage.jsx
│   ├── context/
│   │   ├── AuthContext.jsx         → Stores user identity, token, role globally
│   │   ├── WeekContext.jsx         → Stores active week data globally
│   │   └── SocketContext.jsx       → Socket.io connection shared across app
│   ├── hooks/
│   │   ├── useAuth.js              → Consumes AuthContext
│   │   ├── useSocket.js            → Consumes SocketContext
│   │   ├── useEntries.js           → Fetch, create, update, delete entries for a section
│   │   ├── useSectionStatus.js     → Fetch and update section statuses
│   │   └── useDashboard.js         → Fetch dashboard summary data
│   ├── services/
│   │   ├── api.js                  → Axios instance with base URL and interceptors
│   │   ├── auth.service.js
│   │   ├── entry.service.js
│   │   ├── week.service.js
│   │   ├── dashboard.service.js
│   │   └── report.service.js
│   ├── utils/
│   │   ├── sectionConfig.js        → Master config for all 17 sections (labels, fields, validation rules)
│   │   ├── dateHelpers.js          → Format dates, check date ranges
│   │   └── rolePermissions.js      → Helper to check if user can perform an action
│   ├── App.jsx                     → Route definitions
│   └── main.jsx                    → React DOM entry point
```

---

## Pages & Their Detailed Behaviour

---

### Page 1: Login Page

**Layout:** Centered card on a gradient background with the BVRIT logo and institution name at the top.

**Fields:** Email address input, password input with show/hide toggle, and a Login button.

**Behaviour:**
- Form is validated client-side before submission (empty field checks, email format)
- On successful login, the JWT is stored in memory (React state via AuthContext) and the refresh token is stored in an httpOnly cookie (handled by the server)
- The user is redirected to the Dashboard
- On failure, a clear error message is shown (invalid credentials, account deactivated)
- The login button shows a loading spinner while the API call is in progress
- If a logged-in user navigates to `/login`, they are immediately redirected to the Dashboard

---

### Page 2: Dashboard Page

**Who sees it:** All roles, but with different capabilities.

**Layout:** Top stats row + 17 section status cards grid + recent activity feed + contributor breakdown table.

**Top Stats Row:**
- Active week label and date range
- Total entries this week
- Overall completion percentage (e.g., "11 of 17 sections complete")
- A "Submit Week" button visible only to coordinators and admins (disabled until all sections are marked complete, or with a warning if submitting with incomplete sections)

**Section Status Grid:**
- 17 cards, one per section, arranged in a responsive grid
- Each card shows the section name, current status badge (colour-coded: grey = pending, yellow = in progress, green = complete), and entry count
- Clicking a card navigates to that section's entry page
- Coordinators see a "Mark Complete" button on each card
- Cards are ordered by priority — sections with entries (in progress) appear first, then pending, then complete

**Activity Feed:**
- Shows the last 15 audit log entries in reverse chronological order
- Format: "[Faculty Name] added an entry to [Section Name] — [time ago]"
- Updates in real time via Socket.io — new activities appear at the top with a subtle animation

**Contributor Breakdown:**
- Table listing each faculty member who has contributed this week, with their entry count and last active time
- Visible to coordinators and admins for accountability

---

### Page 3: Section Page (Dynamic — serves all 17 sections)

**This is the most used page.** It renders differently based on the `section` URL parameter.

**Layout:** Two-panel layout — left panel is the entry form, right panel is the live entries table.

**Left Panel — Entry Form:**
- The form fields are dynamically rendered based on `sectionConfig.js`, which defines the fields, types, labels, and validation rules for each section
- All date fields include a date picker that visually blocks selection of dates outside the active week range
- Required fields are marked with an asterisk
- Field-level validation messages appear inline (below each field) as the user types
- A "Add Entry" button submits the form
- After successful submission, the form resets to blank and the new entry appears in the right panel instantly
- An "Edit" mode can be triggered from the right panel — the entry's data populates the left panel form, the button changes to "Update Entry," and a "Cancel" button appears

**Right Panel — Live Entry Table:**
- Displays all entries for this section in the active week as a formatted table
- Column headers match the section's field names
- Each row has an "Edit" icon (pencil) and a "Delete" icon (trash can)
- Edit is available to the entry's creator, coordinator, and admin
- Delete is a soft delete; it shows a confirmation dialog before proceeding
- "Entered by [Name]" is shown in a small label under each row for accountability
- The table updates in real time when other users add, edit, or delete entries (via Socket.io)
- A subtle "pulse" animation highlights newly added or updated rows for 3 seconds

**Live Editing Indicator:**
- A banner below the section title reads "Dr. Pallavi is currently editing this section" when another user has the form open
- This uses the `user:typing` Socket.io event
- Disappears 5 seconds after the user stops typing or submits

**Read-Only Mode:**
- If the active week has been submitted, all forms are hidden and the table is shown in read-only mode with a banner: "This week has been submitted. Entries are locked."

---

### Page 4: Report Preview Page

**Who can access:** All roles (faculty gets view-only, no export; coordinators and admins get export buttons).

**Layout:** Full-width white paper-like container styled to match the institution's report format, with sticky export buttons at the top right.

**Content:**
- BVRIT institution header with logo
- Week label and date range
- All 17 sections rendered in order, each with a heading and a table matching the prescribed column structure
- Sections with no entries show an empty table (as required by the format)
- The preview is generated from the live `/api/report/preview` endpoint, so it always reflects the current state of entries

**Export Buttons (Coordinator/Admin only):**
- "Export as PDF" — triggers `/api/report/export/pdf` and downloads the file
- "Export as DOCX" — triggers `/api/report/export/docx` and downloads the file
- Both buttons show a loading spinner during generation

**Live Updates:**
- The preview page listens to Socket.io events and shows a "Report updated — click to refresh preview" banner when new entries are added by other users, rather than auto-refreshing (which would be disruptive while reviewing)

---

### Page 5: User Management Page (Admin Only)

**Layout:** Table of all users with filters + "Add User" button.

**Filters:** By department, by role, by active/inactive status.

**Table columns:** Name, email, department, role, status, last login, actions.

**Actions per row:** Edit role/department, deactivate/reactivate.

**Add User Modal:** Name, email, temporary password, role, department fields.

---

### Page 6: Week Management Page (Coordinator/Admin)

**Layout:** Current active week card at top + historical weeks list below.

**Active Week Card:** Shows all details, a "Submit Week" button with a pre-submission checklist showing section completion status.

**Create New Week Form:** Week label, start date, end date, department (admin only — coordinator defaults to own dept).

**Historical Weeks:** Table of past weeks with status (submitted/archived) and a "View Report" button to download the final report for any past week.

---

## State Management Strategy

**AuthContext** stores: user ID, name, role, department, access token. This is initialized from the refresh token on app load, so users stay logged in across page refreshes.

**WeekContext** stores: active week ID, label, start date, end date, status. This is fetched once on app load and shared across all section pages so each page knows the active week without re-fetching.

**SocketContext** stores: the Socket.io connection instance. It is initialized once on login and shared across all pages via context. Each page subscribes to the relevant events when mounted and unsubscribes when unmounted.

**Local component state** handles: form field values, validation errors, loading states, and modal open/close states.

**No Redux is needed** — the data is not deeply nested or shared in complex ways. Context API with custom hooks is sufficient and keeps the codebase simple.

---

## API Integration Strategy

A single Axios instance is created in `api.js` with the backend's base URL. Request interceptors automatically attach the `Authorization: Bearer <token>` header to every request. Response interceptors detect 401 responses (token expired) and automatically call the refresh endpoint to get a new token, then retry the original request. If the refresh also fails, the user is logged out and redirected to the login page.

Each `*.service.js` file wraps the Axios calls for a specific domain (entries, weeks, dashboard, etc.) and returns clean data to the custom hooks. The hooks handle loading and error states and expose them to the components.

---

## Form Validation Strategy

All 17 section forms use a consistent validation approach defined in `sectionConfig.js`. This config file defines, for each section, the list of fields with their type (`text`, `date`, `number`, `select`, `textarea`), label, placeholder, whether they are required, and any format rules (e.g., roll number must match pattern `\d{2}WH\d{1}A\d{4}`).

The `SectionFormWrapper.jsx` component reads this config and renders the appropriate form fields dynamically. It runs validation on every field change and on form submission, preventing submission if any validation fails.

Date fields validate that the selected date falls within the active week's `startDate` to `endDate`. This is validated on the frontend for immediate feedback and also enforced on the backend.

---

## Real-Time UI Updates

When a Socket.io event is received:

- `entry:created` in the current section → the new entry is appended to the local entries array in state, triggering a re-render of the table. The new row is highlighted for 3 seconds.
- `entry:updated` in the current section → the matching entry in the local array is replaced with the updated data.
- `entry:deleted` → the matching entry is removed from the local array.
- `section:status_changed` on the dashboard → the matching section card updates its status badge instantly.
- `week:submitted` → all pages show the read-only banner and forms are hidden.

---

## Responsive Design

- Desktop (1024px+): Two-panel layout on section pages, full grid dashboard
- Tablet (768px–1023px): Single column, form above table
- Mobile (below 768px): Simplified view, collapsible sidebar, stacked cards

The primary target is desktop (faculty will use laptops/PCs), but the layout degrades gracefully on smaller screens.

---

## Section Navigation

The sidebar lists all 17 sections with their status badges. Faculty can jump directly to any section. The active section is highlighted. Sections with the `complete` status have a checkmark icon. This gives users an at-a-glance view of what still needs to be filled.

---

## Key UX Decisions

- **Auto-save is not used** — forms are explicitly submitted to avoid partial/accidental entries being saved
- **Optimistic updates are not used** — the UI waits for the server to confirm before showing the new entry, ensuring data integrity
- **Toast notifications** appear for every successful or failed action (entry added, entry deleted, section marked complete, week submitted)
- **Empty states** are shown when a section has no entries yet, with a prompt to add the first entry
- **Loading skeletons** are shown while entries are being fetched, instead of blank tables

---

# Summary

| Layer | Technology | Key Responsibility |
|---|---|---|
| Database | MongoDB + Mongoose | Flexible document storage, week isolation, audit trail |
| Backend | Node.js + Express | REST API, auth, validation, report generation, real-time events |
| Real-Time | Socket.io | Live collaboration, entry sync, typing indicators |
| Frontend | React.js | Dynamic forms, live preview, dashboard, role-based UI |
| PDF Export | Puppeteer | Headless browser PDF rendering in institution format |
| DOCX Export | docx npm library | Programmatic Word document generation |
| Auth | JWT + Bcrypt | Secure token-based auth with role-based access control |
