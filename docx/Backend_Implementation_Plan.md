# Backend Implementation Plan
## Collaborative Weekly Report Management System
### Technology: Node.js + Express.js + Mongoose + Socket.io

---

## 1. Technology Choices & Reasoning

| Technology | Purpose | Why This Choice |
|---|---|---|
| Node.js | Runtime environment | Non-blocking I/O handles many simultaneous faculty connections efficiently |
| Express.js | HTTP framework | Minimal, flexible, widely used — easy to structure routes and middleware |
| Mongoose | MongoDB ODM | Schema enforcement, validation hooks, and clean query API on top of MongoDB |
| Socket.io | Real-time collaboration | Handles WebSocket connections with automatic fallbacks; rooms feature fits week/dept isolation |
| JSON Web Tokens | Authentication | Stateless auth — scales across multiple server instances without session storage |
| Bcrypt | Password hashing | Industry standard — computationally expensive to reverse, protects against database breaches |
| Puppeteer | PDF generation | Headless Chromium renders the HTML report template pixel-perfectly into PDF |
| docx (npm) | DOCX generation | Programmatic Word document creation — rich table and formatting API |
| dotenv | Config management | Environment variable management — keeps secrets out of source code |
| helmet | HTTP security | Sets secure response headers automatically |
| cors | Cross-origin control | Restricts API access to the frontend domain only |
| express-rate-limit | Brute force prevention | Limits repeated requests on sensitive routes |
| joi | Request validation | Schema-based request body validation with detailed error messages |
| morgan | HTTP logging | Logs every request for debugging and monitoring |

---

## 2. Project Folder Structure

```
backend/
├── config/
│   ├── db.js                      → MongoDB connection setup using Mongoose
│   ├── constants.js               → All enums: sections, roles, statuses, week statuses
│   └── socketConfig.js            → Socket.io server initialization and auth
│
├── models/
│   ├── User.model.js
│   ├── Week.model.js
│   ├── ReportEntry.model.js
│   ├── SectionStatus.model.js
│   └── AuditLog.model.js
│
├── middleware/
│   ├── auth.middleware.js          → Verifies JWT on every protected request
│   ├── roleGuard.middleware.js     → Checks user role against allowed roles
│   ├── validateWeek.middleware.js  → Confirms active week exists and is not submitted
│   ├── rateLimiter.middleware.js   → Rate limiting for auth routes
│   └── errorHandler.middleware.js  → Centralized error formatting and response
│
├── validators/
│   ├── auth.validator.js           → Login request validation
│   ├── user.validator.js           → User create/update validation
│   ├── week.validator.js           → Week create validation
│   └── entry.validator.js          → Section-specific entry validation (all 17 sections)
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── week.routes.js
│   ├── entry.routes.js
│   ├── status.routes.js
│   ├── dashboard.routes.js
│   └── report.routes.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── week.controller.js
│   ├── entry.controller.js
│   ├── status.controller.js
│   ├── dashboard.controller.js
│   └── report.controller.js
│
├── services/
│   ├── auth.service.js             → Token generation, refresh, hashing logic
│   ├── week.service.js             → Week lifecycle business logic
│   ├── entry.service.js            → Entry CRUD and section status sync
│   ├── report.service.js           → Report data assembly from entries
│   ├── pdfExporter.service.js      → Puppeteer PDF generation
│   ├── docxExporter.service.js     → DOCX generation
│   └── auditLogger.service.js      → Centralized audit log writer
│
├── socket/
│   └── events.socket.js            → All Socket.io event handlers
│
├── templates/
│   └── reportTemplate.html         → HTML template for PDF generation
│
├── utils/
│   ├── dateUtils.js                → Date range validation helpers
│   ├── responseHelper.js           → Standardized API response formatter
│   └── sectionFields.js            → Field definitions for all 17 sections (used in validation)
│
├── .env                            → Environment variables (never commit to git)
├── .env.example                    → Template showing required env variable names
├── .gitignore
├── app.js                          → Express app setup: middleware, routes, error handler
├── server.js                       → HTTP server + Socket.io server entry point
└── package.json
```

---

## 3. Environment Variables (`.env`)

```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bvrit_report_db

# JWT
JWT_ACCESS_SECRET=<long-random-string-for-access-tokens>
JWT_REFRESH_SECRET=<different-long-random-string-for-refresh-tokens>
JWT_ACCESS_EXPIRY=8h
JWT_REFRESH_EXPIRY=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Cookie
COOKIE_SECRET=<another-random-secret>

# Report Generation
INSTITUTION_NAME=BVRIT HYDERABAD College of Engineering for Women
INSTITUTION_LOGO_PATH=./assets/bvrit_logo.png
```

---

## 4. Application Entry Point (`server.js`)

The `server.js` file is the single entry point. Its responsibilities:

1. Load environment variables using dotenv
2. Import the Express app from `app.js`
3. Create an HTTP server wrapping the Express app
4. Attach Socket.io to the same HTTP server (so both REST and WebSocket use the same port)
5. Connect to MongoDB using `config/db.js`
6. Start listening on the configured port
7. Handle uncaught exceptions and unhandled promise rejections — log them and exit gracefully

This separation (server.js for startup, app.js for Express configuration) allows the app to be imported in tests without starting the server.

---

## 5. Express App Setup (`app.js`)

The `app.js` file configures the Express application. Steps in order:

1. **Helmet** — applied first, sets all security headers
2. **CORS** — configured with `FRONTEND_URL` from env, credentials: true (required for cookies)
3. **JSON body parser** — limit set to 1mb to prevent payload attacks
4. **Cookie parser** — for reading the httpOnly refresh token cookie
5. **Morgan** — HTTP request logging (format: `combined` in production, `dev` in development)
6. **Rate limiter** — applied globally but with stricter limits on auth routes
7. **API routes** — all routes mounted under `/api/` prefix
8. **404 handler** — catches any route not matched above and returns a standard 404 response
9. **Global error handler** — the centralized `errorHandler.middleware.js` is registered last

---

## 6. Database Connection (`config/db.js`)

The database connection module:
- Uses Mongoose `connect()` with the URI from environment variables
- Sets `maxPoolSize: 10` to handle concurrent requests efficiently
- Logs a success message when connected
- Logs an error and exits the process (`process.exit(1)`) if initial connection fails
- Mongoose automatically handles reconnection for intermittent failures after initial connection

---

## 7. Constants (`config/constants.js`)

Defines all enums used across models, validators, and controllers as JavaScript objects. Having them in one place means changing a section name or adding a new role only requires editing one file.

Contents:
- `SECTIONS` — Object mapping 17 section keys to their string values
- `ROLES` — `{ FACULTY: 'faculty', COORDINATOR: 'coordinator', ADMIN: 'admin' }`
- `WEEK_STATUS` — `{ ACTIVE: 'active', SUBMITTED: 'submitted', ARCHIVED: 'archived' }`
- `SECTION_STATUS` — `{ PENDING: 'pending', IN_PROGRESS: 'in_progress', COMPLETE: 'complete' }`
- `AUDIT_ACTIONS` — Object of all audit action strings

---

## 8. Middleware — Detailed Explanation

---

### `auth.middleware.js`

**Purpose:** Verifies the JWT access token on every protected route.

**Process:**
1. Extract the `Authorization` header from the request
2. Verify it starts with `Bearer ` — if not, return 401
3. Extract the token string after `Bearer `
4. Verify the token using `jwt.verify()` with the `JWT_ACCESS_SECRET`
5. If verification fails (expired, invalid signature, malformed), return 401 with a specific error message distinguishing "token expired" from "invalid token"
6. If valid, decode the payload and attach the user object (`{ id, name, role, department }`) to `req.user`
7. Call `next()` to proceed to the route handler

**The token payload contains:** user ID, name, role, department, and issued-at timestamp. It does NOT contain the password or sensitive data.

---

### `roleGuard.middleware.js`

**Purpose:** Restricts route access based on user role.

**Usage pattern:** `roleGuard(['admin', 'coordinator'])` — returns a middleware function.

**Process:**
1. Read `req.user.role` (set by auth middleware which always runs first)
2. Check if the role is in the allowed roles array
3. If yes, call `next()`
4. If no, return 403 Forbidden with message "You do not have permission to access this resource"

**Role hierarchy for this system:**
- `admin` — full access to everything
- `coordinator` — can manage weeks, mark sections complete, download reports, view all entries
- `faculty` — can add/edit/delete own entries, view all entries in their department, view read-only preview

---

### `validateWeek.middleware.js`

**Purpose:** Ensures that entry operations (create, update, delete) only occur when an active, non-submitted week exists for the user's department.

**Process:**
1. Query the `weeks` collection for `{ department: req.user.department, status: 'active' }`
2. If no active week is found, return 400 with "No active reporting week found for your department. Contact your coordinator."
3. If found, attach the week document to `req.activeWeek` for use in subsequent handlers
4. Call `next()`

This middleware is applied only to entry creation, update, and delete routes — not to fetch routes (fetching entries from past weeks must still work).

---

### `rateLimiter.middleware.js`

**Purpose:** Prevents brute force attacks on the login endpoint.

**Configuration:**
- Auth routes: maximum 10 requests per 15 minutes per IP address
- General API routes: maximum 200 requests per minute per IP address
- On limit exceeded: returns 429 Too Many Requests with a retry-after header

---

### `errorHandler.middleware.js`

**Purpose:** Single centralized place where all errors are caught and formatted into a consistent response structure.

**Process:**
1. Receives the error object from any route that calls `next(error)` or throws inside async handlers
2. Determines the HTTP status code (uses `error.statusCode` if set, defaults to 500)
3. In development mode: includes the full stack trace in the response for debugging
4. In production mode: hides the stack trace, shows only the message
5. Handles specific Mongoose errors:
   - `ValidationError` → 400 with field-by-field error messages
   - `CastError` (invalid ObjectId) → 400 "Invalid ID format"
   - `duplicate key error (11000)` → 409 with "already exists" message
6. Returns a standardized JSON: `{ success: false, message: "...", errors: [...] }`

**All async route handlers** use a wrapper utility that catches promise rejections and passes them to `next(error)` — this eliminates the need for try-catch blocks in every controller function.

---

## 9. Module 1: Authentication

### Routes (`auth.routes.js`)

```
POST   /api/auth/login      → No auth required
POST   /api/auth/logout     → Auth required
POST   /api/auth/refresh    → No auth required (uses refresh token from cookie)
GET    /api/auth/me         → Auth required — returns current user profile
```

### Controller (`auth.controller.js`)

**Login handler:**
1. Extract email and password from request body
2. Call `auth.service.loginUser(email, password)`
3. Return the access token in the response body and set the refresh token as an httpOnly, sameSite: strict cookie

**Logout handler:**
1. Clear the refresh token cookie
2. Nullify the `refreshToken` field in the user document (invalidates the old refresh token)
3. Write audit log: `action: logout`
4. Return 200 success

**Refresh handler:**
1. Read the refresh token from the httpOnly cookie
2. Call `auth.service.refreshAccessToken(refreshToken)`
3. Return the new access token in the response body

**Me handler:**
1. Use `req.user.id` (set by auth middleware) to fetch the full user profile from MongoDB
2. Return user data excluding password and refresh token

### Service (`auth.service.js`)

**`loginUser(email, password)`:**
1. Find user by email in the database. Include the password field explicitly (it has `select: false` in the schema)
2. If user not found or `isActive: false`, throw 401 error "Invalid credentials" (same message for both — do not reveal whether the email exists)
3. Compare the provided password against the stored hash using `bcrypt.compare()`
4. If mismatch, throw 401
5. Generate access token: `jwt.sign({ id, name, role, department }, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRY })`
6. Generate refresh token: `jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY })`
7. Hash the refresh token with Bcrypt and store it in the user document's `refreshToken` field
8. Update `lastLogin` timestamp
9. Write audit log: `action: login`
10. Return both tokens

**`refreshAccessToken(refreshToken)`:**
1. If no refresh token provided, throw 401
2. Verify the token using `JWT_REFRESH_SECRET`
3. Find the user by the ID in the token payload
4. Compare the incoming refresh token against the stored hash using `bcrypt.compare()`
5. If mismatch (token was rotated/invalidated), throw 401
6. Generate and return a new access token

---

## 10. Module 2: User Management

### Routes (`user.routes.js`)

```
GET    /api/users           → Admin: all users. Coordinator: own dept users. Faculty: 403
POST   /api/users           → Admin only — create new user
GET    /api/users/:id       → Auth required — faculty can only get own profile
PUT    /api/users/:id       → Admin: any field. Faculty/Coordinator: own profile, limited fields
PATCH  /api/users/:id/deactivate   → Admin only
PATCH  /api/users/:id/activate     → Admin only
PATCH  /api/users/:id/reset-password → Admin only
```

### Controller (`user.controller.js`)

**Create user:**
1. Validate request body using `user.validator.js`
2. Hash the provided temporary password
3. Create user document in MongoDB
4. Write audit log: `action: user_created`
5. Return created user (without password)

**List users:**
- Admin: returns all users, supports query params for role and department filters
- Coordinator: returns users from their own department only (enforced server-side regardless of query params)

**Update user:**
- Admin can update any field including role and department
- Faculty/Coordinator can only update own `name` and `phoneNumber`
- Role changes are logged as `action: role_changed` in audit log

**Deactivate user:**
- Sets `isActive: false`
- Does not delete any entries or data
- Writes audit log

---

## 11. Module 3: Week Management

### Routes (`week.routes.js`)

```
GET    /api/weeks/active    → Auth required — returns active week for user's department
GET    /api/weeks           → Auth required — lists all weeks (with pagination)
POST   /api/weeks           → Coordinator/Admin only — create new week
PATCH  /api/weeks/:id/submit   → Coordinator/Admin only — submit and lock week
PATCH  /api/weeks/:id/archive  → Admin only — archive a submitted week
```

### Controller & Service (`week.controller.js`, `week.service.js`)

**Create week:**
1. Validate request body: `weekLabel`, `startDate`, `endDate`, `department`
2. Check `endDate` is after `startDate`
3. Check duration is ≤ 7 days
4. Check no other active week exists for this department — query `{ department, status: 'active' }`
5. If check passes, create the `weeks` document
6. Immediately after creation, seed 17 `section_status` documents (one per section) all with `status: pending`, `entryCount: 0`, `weekId` and `department` set
7. Write audit log
8. Emit Socket.io event `week:created` to the department room

**Get active week:**
- Simple query: `{ department: req.user.department, status: 'active' }`
- Returns week details including `startDate`, `endDate`, and current `status`
- If no active week, return `{ activeWeek: null }` — frontend handles this gracefully

**Submit week:**
1. Verify the week exists and is still `active`
2. Fetch all 17 section statuses — check if any are `pending` (never had entries)
3. If any sections are pending, the API still allows submission but returns a warning flag alongside the 200 response — the coordinator explicitly confirmed they want to submit with empty sections
4. Set week `status` to `submitted`, populate `submittedBy` and `submittedAt`
5. Write audit log: `action: submit_week`
6. Emit Socket.io event `week:submitted` to the department room — this triggers read-only mode on all connected frontends

---

## 12. Module 4: Report Entry Management

This is the largest and most critical module.

### Routes (`entry.routes.js`)

```
GET    /api/entries         → Auth required — query params: weekId, section
POST   /api/entries         → Auth + validateWeek — create new entry
PUT    /api/entries/:id     → Auth + validateWeek — update existing entry
DELETE /api/entries/:id     → Auth + validateWeek — soft delete entry
GET    /api/entries/:id     → Auth — get single entry by ID
```

### Controller (`entry.controller.js`)

**Get entries (GET /api/entries):**
1. Extract `weekId` and `section` from query parameters
2. Validate both are present and valid (valid ObjectId for weekId, valid section enum value)
3. Query `report_entries`: `{ weekId, section, isDeleted: false }`, sorted by `createdAt` ascending
4. Additionally verify the `weekId`'s department matches `req.user.department` (prevents cross-department data leakage)
5. Return entries array

**Create entry (POST /api/entries):**
1. Extract `section` and `data` from request body
2. Run `entry.validator.js` for the specific section — validates all required fields and formats
3. Validate all date fields in `data` are within `req.activeWeek.startDate` to `req.activeWeek.endDate`
4. Call `entry.service.createEntry(weekId, section, data, req.user, req.activeWeek)`
5. Return the created entry with 201 status

**Update entry (PUT /api/entries/:id):**
1. Fetch the entry by ID, verify it exists and `isDeleted: false`
2. Authorization check: `req.user.id === entry.enteredBy` OR `req.user.role` is coordinator or admin — if neither, return 403
3. Validate the updated `data` fields using section validator
4. Validate date fields against active week range
5. Update entry: set `data`, `lastEditedBy`, `lastEditedByName`, `lastEditedAt`
6. Write audit log with `previousValue` (snapshot before change) and `newValue`
7. Emit Socket.io `entry:updated` event

**Delete entry (DELETE /api/entries/:id):**
1. Fetch the entry, verify it exists and `isDeleted: false`
2. Authorization: original creator OR coordinator/admin — else 403
3. Set `isDeleted: true`, `deletedBy`, `deletedAt`
4. Call `entry.service.decrementSectionCount(weekId, section)`
5. Write audit log with full `previousValue` (for potential recovery)
6. Emit Socket.io `entry:deleted` event

### Service (`entry.service.js`)

**`createEntry(weekId, section, data, user, activeWeek)`:**
1. Create the `report_entries` document
2. Call `incrementSectionCount(weekId, section, user)` which:
   - Increments `entryCount` by 1 using `$inc` operator (atomic operation)
   - If `status` was `pending`, change it to `in_progress`
   - Update `lastUpdatedBy` and `lastUpdatedAt`
3. Emit Socket.io event `entry:created` with the new entry and section name

**`incrementSectionCount` and `decrementSectionCount`:**
These use MongoDB's atomic `$inc` operator to safely update the count even when multiple users are adding entries simultaneously. The `$inc` operation is not subject to race conditions.

When `decrementSectionCount` brings `entryCount` to 0, it also sets `status` back to `pending`.

---

## 13. Module 5: Section Status Management

### Routes (`status.routes.js`)

```
GET    /api/status          → Auth — get all 17 section statuses for active week
PATCH  /api/status/:section → Coordinator/Admin — manually update a section status
```

### Controller (`status.controller.js`)

**Get all statuses:**
1. Get active week for user's department
2. Query all 17 `section_status` documents for `{ weekId, department }`
3. Return array of all 17 statuses with entry counts
4. Also compute and return: `completedCount`, `inProgressCount`, `pendingCount`, and `completionPercentage`

**Update section status (manual):**
1. Validate `section` is a valid section enum
2. Validate `status` is one of: `pending`, `in_progress`, `complete`
3. Only coordinators and admins can call this route (roleGuard enforces)
4. Update the section_status document
5. Write audit log: `action: status_changed`
6. Emit Socket.io `section:status_changed` event

---

## 14. Module 6: Real-Time Collaboration (Socket.io)

### Setup (`config/socketConfig.js`)

The Socket.io server is initialized with:
- CORS configuration matching the Express CORS settings
- `transports: ['websocket', 'polling']` — WebSocket preferred, polling as fallback
- Authentication middleware that verifies the JWT before allowing connection:
  - Extract token from the connection handshake `auth` object
  - Verify using `JWT_ACCESS_SECRET`
  - If invalid, reject the connection with an error
  - If valid, attach user info to the socket object

### Events (`socket/events.socket.js`)

**Connection handling:**

When a socket connects successfully:
1. Extract the user's department and `weekId` from the socket's handshake data
2. Join a room named `${weekId}_${department}` — this is the collaboration room
3. Emit `user:joined` to the room (other clients show online presence)
4. Store the socket-to-user mapping in a server-side Map for presence tracking

**Events the server emits to clients:**

| Event | Payload | Trigger |
|---|---|---|
| `entry:created` | `{ section, entry }` | New entry saved successfully |
| `entry:updated` | `{ section, entryId, updatedEntry }` | Entry modified |
| `entry:deleted` | `{ section, entryId }` | Entry soft-deleted |
| `section:status_changed` | `{ section, status, entryCount }` | Status manually changed or auto-transitioned |
| `week:submitted` | `{ weekId, submittedByName }` | Week locked by coordinator |
| `user:typing` | `{ userId, userName, section }` | User opened a section form |
| `user:stopped_typing` | `{ userId, section }` | User closed form or submitted |
| `user:joined` | `{ userId, userName }` | User connected to the room |
| `user:left` | `{ userId }` | User disconnected |

**Events the server listens for from clients:**

| Event | Action |
|---|---|
| `user:typing` | Broadcast to room (re-emit to everyone else in the room) |
| `user:stopped_typing` | Broadcast to room |
| `disconnect` | Remove from presence map, emit `user:left` to room |

**Room isolation:** Each collaboration room is `${weekId}_${department}`. Users from different departments cannot receive events from other departments' rooms. Users from the same department working on the same week are automatically in the same room.

---

## 15. Module 7: Dashboard

### Routes (`dashboard.routes.js`)

```
GET    /api/dashboard/summary     → Coordinator/Admin — full dashboard data
GET    /api/dashboard/activity    → Auth — recent activity feed
GET    /api/dashboard/contributors → Coordinator/Admin — contributor breakdown
```

### Controller (`dashboard.controller.js`)

**Summary (GET /api/dashboard/summary):**

Runs the following queries in parallel using `Promise.all()` for performance:

1. Active week details — from `weeks` collection
2. All 17 section statuses — from `section_status` collection
3. Total entry count for the week — `count()` on `report_entries` with `{ weekId, isDeleted: false }`
4. Completed section count

Assembles and returns:
```json
{
  "activeWeek": { "label": "...", "startDate": "...", "endDate": "...", "status": "..." },
  "sectionStatuses": [ { "section": "...", "status": "...", "entryCount": 0 }, ... ],
  "completionStats": {
    "total": 17,
    "complete": 11,
    "inProgress": 4,
    "pending": 2,
    "percentage": 64.7
  },
  "totalEntries": 38
}
```

**Activity feed (GET /api/dashboard/activity):**
- Queries `audit_logs` for the active week's `weekId`, sorted by `timestamp` descending
- Limits to 20 most recent entries
- Returns `performedByName`, `changeDescription`, `timestamp`, `section`

**Contributors (GET /api/dashboard/contributors):**
- Aggregation pipeline on `report_entries`:
  - Match: `{ weekId, isDeleted: false }`
  - Group by `enteredBy`
  - Count entries per user
  - Lookup user name from `users` collection
  - Sort by entry count descending
- Returns list of faculty with their contribution counts

---

## 16. Module 8: Report Generation

### Routes (`report.routes.js`)

```
GET    /api/report/preview      → Auth — returns assembled report data as JSON
GET    /api/report/export/pdf   → Coordinator/Admin — download PDF
GET    /api/report/export/docx  → Coordinator/Admin — download DOCX
```

### Report Assembly Service (`report.service.js`)

**`assembleReport(weekId, department)`:**

1. Fetch the week document for label and date range
2. Fetch ALL non-deleted entries for this week and department in one query: `{ weekId, department, isDeleted: false }`
3. Group entries by `section` using JavaScript's `reduce()` — results in an object where keys are section names and values are arrays of entries
4. Build the final report structure: an ordered array of 17 sections, each with its name, display label, column headers, and entries array
5. Sections with no entries have an empty `entries: []` array — they are still included in the report with empty table rows
6. Return the structured report object

The column headers for each section are defined in `utils/sectionFields.js` and are used both here (for report assembly) and in the frontend (for table rendering).

### PDF Exporter Service (`pdfExporter.service.js`)

**`generatePDF(reportData)`:**

1. Load the `reportTemplate.html` file from the `templates/` folder
2. Use a JavaScript template engine approach: replace placeholder tokens in the HTML template with the actual report data. For each section, generate an HTML `<table>` with `<tr>` rows for each entry
3. Launch a Puppeteer browser instance in headless mode (`headless: 'new'`)
4. Open a new page and set its content to the populated HTML string
5. Wait for all network requests to complete (for logo loading)
6. Call `page.pdf()` with settings: A4 format, portrait orientation, margins matching the institution's format, print background: true
7. Close the browser
8. Return the PDF as a Buffer

The HTML template includes:
- The BVRIT institution header with logo
- Institution name and accreditation details
- "Weekly Report" heading
- Week duration and department line
- All 17 sections as styled HTML tables with bold headers
- Page numbers in the footer

**Performance note:** Puppeteer launches a browser process which is relatively heavy. For production, consider keeping a browser instance alive and reusing pages rather than launching fresh for every export request.

### DOCX Exporter Service (`docxExporter.service.js`)

**`generateDOCX(reportData)`:**

Uses the `docx` npm library to programmatically construct the Word document.

1. Create a new `Document` instance
2. Add the institution header paragraph with bold formatting and center alignment
3. Add subtitle paragraphs (accreditation details)
4. Add "Weekly Report" as a bold centered heading
5. Add week duration and department as normal paragraphs
6. For each of the 17 sections in order:
   a. Add a bold section heading paragraph (e.g., "1. General Points")
   b. Create a `Table` with the section's column headers as the first `TableRow` (bold, shaded background)
   c. If the section has entries, add one `TableRow` per entry with `TableCell` objects for each field
   d. If the section has no entries, add a single empty `TableRow` to show the empty table
   e. Apply border styling to all cells
7. Pack the document using `Packer.toBuffer()`
8. Return the Buffer

---

## 17. Validators — Detailed Design (`validators/entry.validator.js`)

The entry validator uses the `joi` library. A master validation schema is defined for each of the 17 sections.

**Approach:**

A function `validateEntry(section, data)` receives the section name and the `data` object. It looks up the corresponding Joi schema for that section and runs `.validate(data, { abortEarly: false })`.

`abortEarly: false` means all field errors are collected and returned together — the user sees all problems at once rather than fixing them one at a time.

**Validation rules per section (examples):**

`student_achievements`:
- `studentName`: string, required, min 2 chars, max 100 chars
- `rollNumber`: string, required, regex pattern `/^\d{2}WH[0-9]{1}A\d{4}$/` — matches the institution's roll number format
- `achievementDetails`: string, required, min 5 chars
- `date`: Joi date, required, iso format

`placements`:
- `companyName`: string, required
- `studentsPlaced`: number, integer, required, min 1
- `packageLPA`: number, required, min 0, max 100
- `date`: Joi date, required

`patents_published`:
- `facultyName`: string, required
- `patentTitle`: string, required, min 5 chars
- `applicationNumber`: string, required, min 3 chars
- `publicationDate`: Joi date, required, must not be in the future

**Date range validation (separate from Joi):**

After Joi validation passes, a dedicated `validateDatesInRange(data, startDate, endDate)` function from `dateUtils.js` iterates over all date fields in the entry and checks each one falls within the week's boundaries. This is intentionally a separate step from Joi so date format errors and range errors are reported with different, descriptive messages.

---

## 18. Response Helper (`utils/responseHelper.js`)

All API responses follow a consistent structure via helper functions:

**`sendSuccess(res, data, message, statusCode)`:**
```json
{
  "success": true,
  "message": "Entry created successfully",
  "data": { ... }
}
```

**`sendError(res, message, statusCode, errors)`:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "rollNumber", "message": "Roll number format is invalid" }
  ]
}
```

**`sendPaginated(res, data, page, limit, total)`:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 47,
    "pages": 3
  }
}
```

---

## 19. Audit Logger Service (`services/auditLogger.service.js`)

A single reusable function `logAction({ action, performedBy, performedByName, performedByRole, targetCollection, targetId, weekId, section, changeDescription, previousValue, newValue, req })`:

1. Constructs the audit log document
2. Extracts IP address from `req.ip` or `req.headers['x-forwarded-for']` if behind a proxy
3. Saves to the `audit_logs` collection
4. Does NOT throw errors if the audit log save fails — it logs the failure to console but does not interrupt the main operation (audit logging failure should never break core functionality)

This function is called at the end of every successful create, update, delete, login, logout, and admin action.

---

## 20. Security Checklist

| Threat | Mitigation |
|---|---|
| SQL/NoSQL Injection | Mongoose ORM parameterizes all queries. Input sanitized via Joi before reaching the DB |
| Brute force login | express-rate-limit: 10 attempts per 15 min per IP |
| JWT tampering | Signed with strong secrets, verified on every request |
| Cross-site scripting | Helmet sets Content-Security-Policy headers |
| Cross-site request forgery | SameSite: strict on refresh token cookie |
| Sensitive data exposure | Password field has `select: false` in Mongoose schema |
| Unauthorized cross-department access | Department extracted from JWT (server-side), not from client request params |
| Plaintext passwords | Bcrypt with 12 salt rounds |
| Exposed stack traces | Error handler hides stack trace in production |

---

## 21. Implementation Steps (Order of Execution)

**Step 1 — Project scaffold:**
Initialize Node.js project, install all dependencies, create folder structure, set up `.env` file.

**Step 2 — Database connection:**
Write and test `config/db.js`. Verify the MongoDB Atlas connection works from the local machine.

**Step 3 — Models:**
Write all five Mongoose models with full schema definitions, validations, and indexes. Test each model in isolation using a small test script.

**Step 4 — Constants and utilities:**
Write `config/constants.js`, `utils/responseHelper.js`, `utils/dateUtils.js`, and `utils/sectionFields.js`. These are used everywhere else.

**Step 5 — Auth module:**
Write auth service (login, refresh), auth controller, auth routes, auth middleware. Test login endpoint, verify token structure, verify httpOnly cookie is set.

**Step 6 — User management module:**
Write user controller and routes. Test user creation as admin, role-based access control.

**Step 7 — Middleware stack:**
Write `roleGuard.middleware.js`, `validateWeek.middleware.js`, `rateLimiter.middleware.js`, `errorHandler.middleware.js`. Write and test the async error wrapper.

**Step 8 — Week management module:**
Write week service, controller, routes. Test creating a week, verify the 17 section_status documents are auto-seeded. Test duplicate active week prevention.

**Step 9 — Entry management module:**
Write entry validator for all 17 sections. Write entry service (with section count sync), controller, routes. Test all CRUD operations. Verify soft delete behavior. Verify cross-department access is blocked.

**Step 10 — Section status module:**
Write status controller and routes. Test auto-transitions from create and delete operations. Test manual status override by coordinator.

**Step 11 — Socket.io integration:**
Write `config/socketConfig.js` with JWT authentication. Write `socket/events.socket.js`. Connect Socket.io to the HTTP server in `server.js`. Test that multiple browser tabs receive real-time updates when entries are created.

**Step 12 — Dashboard module:**
Write dashboard controller with parallel queries using `Promise.all()`. Test that all summary data is correct and performance is acceptable.

**Step 13 — Report generation:**
Write `report.service.js` for data assembly. Write the HTML template. Write `pdfExporter.service.js` using Puppeteer. Write `docxExporter.service.js`. Test PDF and DOCX output against the sample document format.

**Step 14 — Audit logger:**
Integrate `auditLogger.service.js` calls into all relevant controllers. Verify the activity feed on the dashboard shows the correct entries.

**Step 15 — Security hardening:**
Apply Helmet, CORS, rate limiting, and input sanitization. Review all routes for missing auth or roleGuard middleware.

**Step 16 — Integration testing:**
Run end-to-end tests simulating a full weekly report cycle:
- Admin creates faculty accounts
- Coordinator opens a week
- Multiple faculty add entries to different sections simultaneously (test Socket.io)
- Coordinator marks sections complete
- Coordinator submits the week
- Download PDF and DOCX and verify against the sample format
- Verify entries are locked after submission

**Step 17 — Error handling review:**
Deliberately trigger edge cases: invalid tokens, expired tokens, wrong roles, out-of-range dates, duplicate weeks, invalid section names — verify all return clean, descriptive error messages.
