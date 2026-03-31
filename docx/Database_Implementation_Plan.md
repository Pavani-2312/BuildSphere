# Database Implementation Plan
## Collaborative Weekly Report Management System
### Technology: MongoDB + Mongoose ODM

---

## 1. Why MongoDB

This system revolves around a weekly report with 17 sections, each containing variable-length entries. MongoDB is chosen because:

- Each weekly report is a naturally nested, document-shaped structure
- Sections can have zero to many entries without schema migration
- JSON-native storage eliminates serialization overhead from the Node.js backend
- Flexible `data` field per entry allows 17 different section shapes in one collection
- Horizontal scaling is straightforward if institutional usage grows
- Mongoose ODM provides schema enforcement, validation, and middleware hooks on top of MongoDB's flexibility

---

## 2. Database Name

```
bvrit_report_db
```

---

## 3. Folder Structure

```
database/
├── schemas/
│   ├── User.schema.js
│   ├── Week.schema.js
│   ├── ReportEntry.schema.js
│   ├── SectionStatus.schema.js
│   └── AuditLog.schema.js
├── seeders/
│   ├── adminSeeder.js          → Creates default admin user on first run
│   └── weekSeeder.js           → Creates a sample active week for testing
├── indexes/
│   └── indexDefinitions.js     → All compound index definitions in one place
├── migrations/
│   └── README.md               → Instructions for future schema changes
├── docs/
│   ├── ERD.md                  → Entity relationship description
│   └── SectionFieldSpecs.md    → Full field specification for all 17 sections
└── README.md                   → Setup and connection instructions
```

---

## 4. Collections — Detailed Design

---

### Collection 1: `users`

**Purpose:** Stores all system users — faculty, coordinators, and admins. This is the identity and authentication source for the entire system.

**Schema Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | MongoDB auto-generated primary key |
| `name` | String | Yes | Full name of the user |
| `email` | String | Yes | Unique login email — used as username |
| `password` | String | Yes | Bcrypt hashed password (never stored in plain text) |
| `role` | String (Enum) | Yes | One of: `faculty`, `coordinator`, `admin` |
| `department` | String | Yes | Department name (e.g., `CSE(AI&ML)`, `EEE`, `ECE`) |
| `employeeId` | String | No | Optional institutional employee ID |
| `phoneNumber` | String | No | Contact number |
| `isActive` | Boolean | Yes | Defaults to `true`. Set to `false` to deactivate without deleting |
| `createdBy` | ObjectId (ref: User) | No | Admin who created this account |
| `createdAt` | Date | Auto | Timestamp of account creation (via Mongoose timestamps) |
| `updatedAt` | Date | Auto | Last modification timestamp |
| `lastLogin` | Date | No | Updated on every successful login |
| `refreshToken` | String | No | Hashed refresh token stored for session management |

**Validations:**
- `email` must be unique across the collection
- `email` must match a valid email format (regex enforced at schema level)
- `role` must be one of the three allowed enum values
- `name` minimum length: 2 characters
- `password` is never returned in any query (select: false on the field)

**Indexes:**
- Unique index on `email` — enforces no duplicate accounts
- Index on `role` — for admin user management filters
- Compound index on `department + role` — for fetching all faculty of a specific department

**Relationships:**
- Referenced by `report_entries.enteredBy`
- Referenced by `report_entries.lastEditedBy`
- Referenced by `weeks.createdBy` and `weeks.submittedBy`
- Referenced by `audit_logs.performedBy`
- Referenced by `section_status.lastUpdatedBy`

**Business Rules:**
- Deactivating a user (`isActive: false`) does not delete their entries — all historical contributions remain intact and attributed to them
- Only admin can create, deactivate, or change roles of users
- Faculty can only update their own name and phone number
- Password changes require the current password to be provided (except admin reset)

---

### Collection 2: `weeks`

**Purpose:** Represents a reporting period. Every entry, section status, and report is tied to a week. This collection enforces week-based data isolation — data from one week never bleeds into another.

**Schema Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `weekLabel` | String | Yes | Human-readable label (e.g., "Week 13 - March 2026") |
| `startDate` | Date | Yes | First day of the reporting period (inclusive) |
| `endDate` | Date | Yes | Last day of the reporting period (inclusive) |
| `department` | String | Yes | The department this week belongs to |
| `status` | String (Enum) | Yes | One of: `active`, `submitted`, `archived`. Defaults to `active` |
| `createdBy` | ObjectId (ref: User) | Yes | The admin or coordinator who opened this week |
| `createdByName` | String | Yes | Denormalized name for display without joins |
| `submittedBy` | ObjectId (ref: User) | No | Populated when week is submitted |
| `submittedByName` | String | No | Denormalized name of submitter |
| `submittedAt` | Date | No | Timestamp when week was locked |
| `totalEntries` | Number | No | Cached count, updated on each entry add/delete for dashboard performance |
| `createdAt` | Date | Auto | Timestamp |
| `updatedAt` | Date | Auto | Timestamp |

**Validations:**
- `endDate` must be strictly after `startDate`
- Week duration cannot exceed 7 days (enforced in the backend service before saving)
- Only one week per department can have `status: active` at any time (unique compound index)
- `weekLabel` minimum length: 5 characters

**Indexes:**
- Compound unique index on `{ department: 1, status: 1 }` where status is `active` — enforces single active week per department (partial index)
- Index on `startDate` descending — for listing recent weeks
- Index on `department` — for department-filtered queries

**Week Lifecycle:**

```
[Created] → status: active
    ↓
[All 17 sections reviewed by coordinator]
    ↓
[Coordinator clicks Submit] → status: submitted
    ↓
[Admin archives old weeks] → status: archived
```

**Business Rules:**
- Once `status` becomes `submitted`, no entries can be added, edited, or deleted for this week — enforced both in backend middleware and returned as a flag to the frontend
- A new active week cannot be created for a department that already has an active week
- Archived weeks are read-only and their reports can still be downloaded

---

### Collection 3: `report_entries`

**Purpose:** The core data collection. Every single data point across all 17 sections is stored as an individual document here. This design allows entries to be independently created, edited, deleted, and tracked — without touching the rest of the report.

**Schema Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `weekId` | ObjectId (ref: Week) | Yes | Which week this entry belongs to |
| `department` | String | Yes | Department — denormalized from week for faster queries |
| `section` | String (Enum) | Yes | Which of the 17 sections this entry belongs to (see enum list below) |
| `data` | Mixed (Object) | Yes | Section-specific fields — structure varies by section |
| `enteredBy` | ObjectId (ref: User) | Yes | Who created this entry |
| `enteredByName` | String | Yes | Denormalized name for display |
| `enteredByRole` | String | Yes | Denormalized role for access control display |
| `lastEditedBy` | ObjectId (ref: User) | No | Who last modified this entry |
| `lastEditedByName` | String | No | Denormalized name |
| `lastEditedAt` | Date | No | When last edit occurred |
| `isDeleted` | Boolean | Yes | Defaults to `false`. Soft delete flag — never hard delete |
| `deletedBy` | ObjectId (ref: User) | No | Who deleted this entry |
| `deletedAt` | Date | No | When it was soft-deleted |
| `createdAt` | Date | Auto | Timestamp |
| `updatedAt` | Date | Auto | Timestamp |

**Section Enum Values:**

```
general_points
faculty_joined_relieved
faculty_achievements
student_achievements
department_achievements
faculty_events_conducted
student_events_conducted
non_technical_events
industry_college_visits
hackathon_participation
faculty_fdp_certifications
faculty_visits
patents_published
vedic_programs
placements
mous_signed
skill_development_programs
```

**Indexes:**
- Compound index on `{ weekId: 1, section: 1, isDeleted: 1 }` — primary query pattern: "all active entries for section X in week Y"
- Compound index on `{ weekId: 1, department: 1, isDeleted: 1 }` — for report generation: "all entries for department D in week Y"
- Index on `{ enteredBy: 1 }` — for accountability: "all entries by user X"
- Index on `{ weekId: 1, enteredBy: 1 }` — for contributor breakdown on dashboard

**The `data` Field — Section-Specific Structures:**

The `data` field is a flexible embedded object. Below are the exact field specifications for each section:

---

#### `general_points`
```
pointType       String (Enum): parent_teacher_meeting | department_meeting | announcement | other
description     String (required) — description of the general point
date            Date (required) — date of the event/meeting
```

#### `faculty_joined_relieved`
```
facultyName     String (required)
designation     String (required) — e.g., Assistant Professor, Associate Professor
type            String (Enum, required): joined | relieved
date            Date (required) — date of joining or relieving
```

#### `faculty_achievements`
```
facultyName         String (required)
achievementType     String (Enum): award | guest_lecture | reviewer | jury | other
details             String (required) — full description of the achievement
date                Date (required)
```

#### `student_achievements`
```
studentName         String (required)
rollNumber          String (required) — validated against pattern like 22WH1A6622
achievementDetails  String (required)
date                Date (required)
```

#### `department_achievements`
```
details     String (required)
date        Date (required)
```

#### `faculty_events_conducted`
```
eventName               String (required)
eventType               String (Enum): FDP | Workshop | STTP | Orientation | Other
resourcePersonDetails   String (required) — name and institution of resource persons
coordinatorName         String (required)
facultyParticipated     Number (required, min: 0)
fromDate                Date (required)
toDate                  Date (required)
```

#### `student_events_conducted`
```
eventName               String (required) — topic or event name
eventType               String (Enum): Workshop | Guest_Lecture | Technical_Event | Other
resourcePersonDetails   String (required)
coordinatorName         String (required)
studentsParticipated    Number (required, min: 0)
fromDate                Date (required)
toDate                  Date (required)
```

#### `non_technical_events`
```
eventName               String (required)
resourcePersonDetails   String
coordinatorName         String (required)
studentsParticipated    Number (required, min: 0)
fromDate                Date (required)
toDate                  Date (required)
```

#### `industry_college_visits`
```
institutionName         String (required)
location                String (required)
coordinatorName         String (required)
studentsParticipated    Number (required, min: 0)
fromDate                Date (required)
toDate                  Date (required)
```

#### `hackathon_participation`
```
eventName               String (required)
conductedBy             String (required) — organizing institution
mentorDetails           String — mentoring faculty name
studentsParticipated    Number (required, min: 0)
studentRollNumbers      String — optional comma-separated roll numbers
fromDate                Date (required)
toDate                  Date (required)
```

#### `faculty_fdp_certifications`
```
facultyName         String (required)
certificationName   String (required)
platform            String (Enum): NPTEL | Coursera | EDX | Industry | Other
organizedBy         String (required)
fromDate            Date (required)
toDate              Date (required)
```

#### `faculty_visits`
```
facultyName             String (required)
institutionVisited      String (required) — name and location
fromDate                Date (required)
toDate                  Date (required)
```

#### `patents_published`
```
facultyName         String (required) — inventor(s)
patentTitle         String (required)
applicationNumber   String (required) — unique patent application number
publicationDate     Date (required)
```

#### `vedic_programs`
```
programName         String (required)
participantType     String (Enum, required): student | faculty
centre              String (Enum, required): Hyderabad | Bangalore
participantsCount   Number (required, min: 0)
fromDate            Date (required)
toDate              Date (required)
facultyWorkshop     String — only for faculty participants: workshop name
facultyAssociation  String — only for faculty: in association with
```

#### `placements`
```
companyName         String (required)
studentsPlaced      Number (required, min: 1)
packageLPA          Number (required, min: 0) — package in LPA
date                Date (required) — date of placement drive
```

#### `mous_signed`
```
organizationName    String (required)
signingDate         Date (required)
validityPeriod      String (required) — e.g., "3 years", "2026-2029"
purpose             String (required) — main objective of the MoU
```

#### `skill_development_programs`
```
programName         String (required) — e.g., MLOPs, BFSI, Juniper
facultyCoordinator  String (required)
topicsCovered       String (required) — topics and faculty who handled
studentsCount       Number (required, min: 0)
batchYear           String — e.g., "2nd year", "3rd year"
sessionsCount       Number (required, min: 1)
```

**Business Rules:**
- `isDeleted: false` must always be part of fetch queries to exclude soft-deleted records
- Date fields in `data` must fall within the parent week's `startDate` to `endDate` — validated at backend before save
- The `enteredBy` field is always set server-side from the authenticated user's JWT — clients cannot override it

---

### Collection 4: `section_status`

**Purpose:** Tracks the completion status of each of the 17 sections, per week, per department. This powers the dashboard's section status cards and the coordinator's review workflow.

**Schema Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `weekId` | ObjectId (ref: Week) | Yes | Which week |
| `department` | String | Yes | Which department |
| `section` | String (Enum) | Yes | Which of the 17 sections |
| `status` | String (Enum) | Yes | One of: `pending`, `in_progress`, `complete`. Defaults to `pending` |
| `entryCount` | Number | Yes | Cached count of active entries in this section. Defaults to 0 |
| `lastUpdatedBy` | ObjectId (ref: User) | No | Who last changed the status |
| `lastUpdatedByName` | String | No | Denormalized name |
| `lastUpdatedAt` | Date | No | Timestamp of last status change |
| `createdAt` | Date | Auto | Timestamp |
| `updatedAt` | Date | Auto | Timestamp |

**Indexes:**
- Compound unique index on `{ weekId: 1, department: 1, section: 1 }` — ensures exactly one status document per section per week per department
- Index on `{ weekId: 1, department: 1 }` — for fetching all 17 statuses in one dashboard query

**Auto-Seeding:**
When a new week is created, the backend automatically creates 17 `section_status` documents (one per section) all with `status: pending` and `entryCount: 0`. This ensures the dashboard is immediately populated.

**Auto-Transitions:**
- When first entry added to a section → `entryCount` increments, `status` changes to `in_progress` if it was `pending`
- When an entry is soft-deleted → `entryCount` decrements. If `entryCount` reaches 0, `status` reverts to `pending`
- Manual override: coordinator/admin can set `status` to `complete` regardless of entry count

**Business Rules:**
- `entryCount` is always kept in sync by the backend entry service — never directly mutated by client
- Status can only be set to `complete` by coordinator or admin, not by faculty

---

### Collection 5: `audit_logs`

**Purpose:** Immutable record of every meaningful action in the system. Provides full accountability and traceability. Audit logs are never deleted.

**Schema Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `action` | String (Enum) | Yes | One of: `create`, `update`, `delete`, `submit_week`, `login`, `logout`, `user_created`, `role_changed`, `status_changed` |
| `performedBy` | ObjectId (ref: User) | Yes | Who performed the action |
| `performedByName` | String | Yes | Denormalized name |
| `performedByRole` | String | Yes | Role at time of action |
| `targetCollection` | String | Yes | Which collection was affected (e.g., `report_entries`, `weeks`) |
| `targetId` | ObjectId | No | ID of the affected document |
| `weekId` | ObjectId | No | Week context if applicable |
| `section` | String | No | Section context if applicable |
| `changeDescription` | String | Yes | Human-readable description: "Added entry to Student Achievements" |
| `previousValue` | Mixed | No | Snapshot of data before update (for update/delete actions) |
| `newValue` | Mixed | No | Snapshot of new data after update |
| `ipAddress` | String | No | Client IP address for login events |
| `timestamp` | Date | Yes | Exact timestamp — not using Mongoose timestamps, explicitly set |

**Indexes:**
- Index on `{ weekId: 1, timestamp: -1 }` — for fetching recent activity in a week (dashboard activity feed)
- Index on `{ performedBy: 1, timestamp: -1 }` — for user activity history
- Index on `{ action: 1 }` — for filtering specific action types
- TTL index on `timestamp` with expiry of 365 days — auto-removes logs older than one year to manage storage (optional, can be removed if permanent audit is required)

**Business Rules:**
- Audit logs are append-only — no update or delete operations are ever performed on this collection
- The `previousValue` for delete actions stores the complete entry data so recovery is possible
- Login failures are also logged (with a failed action variant) to detect brute force attempts

---

## 5. Data Flow Diagram

```
[User Logs In]
      ↓
[JWT Issued] → stored in AuthContext (frontend)
      ↓
[User Opens Section Page]
      ↓
[Frontend fetches active week] → queries weeks collection (status: active, dept: user.dept)
      ↓
[Frontend fetches section entries] → queries report_entries (weekId, section, isDeleted: false)
      ↓
[User fills form and submits]
      ↓
[Backend validates JWT → validates data → validates dates against week range]
      ↓
[Backend saves to report_entries]
      ↓
[Backend updates section_status entryCount + status]
      ↓
[Backend writes to audit_logs]
      ↓
[Backend emits Socket.io event]
      ↓
[All connected users' frontends update their entry tables in real time]
```

---

## 6. Date Validation Strategy

Every entry's date fields are validated against the parent week's date range. The process:

1. The frontend's date picker is configured to only allow dates within the active week range (visual enforcement)
2. On form submission, the frontend performs a pre-submission check against the week dates stored in WeekContext
3. The backend middleware `validateWeek.js` fetches the active week and checks every date in the request body falls within `startDate` and `endDate` inclusive
4. If any date is out of range, the entry is rejected with a descriptive error message

This three-layer validation (UI restriction → frontend check → backend enforcement) ensures data integrity.

---

## 7. Soft Delete Strategy

Hard deletion is never performed on `report_entries`. Instead:

- `isDeleted` is set to `true`
- `deletedBy` and `deletedAt` are populated
- An audit log entry is created with the full previous value
- `entryCount` in `section_status` is decremented
- All regular fetch queries include `{ isDeleted: false }` in their filter

This approach ensures:
- Accidental deletes can be recovered by admin
- Audit trail is complete — deleted entries can be investigated
- Accountability is maintained — who deleted what and when

---

## 8. Seeder Scripts

### Admin Seeder (`adminSeeder.js`)

Run once on first deployment. Creates the default admin account:
- Name: System Administrator
- Email: admin@bvrit.ac.in
- Password: Set via environment variable (never hardcoded)
- Role: admin
- Department: Administration

The seeder checks if an admin already exists before creating one, making it safe to run multiple times.

### Week Seeder (`weekSeeder.js`)

For development and testing only. Creates a sample active week for CSE(AI&ML) department with the current week's dates and seeds all 17 section_status documents as pending.

---

## 9. Environment Configuration

The database connection string and credentials must be stored in a `.env` file and never committed to version control.

Required environment variables:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bvrit_report_db
DB_NAME=bvrit_report_db
```

The connection setup (`config/db.js`) uses Mongoose's `connect()` with the following options:
- Connection pooling enabled (maxPoolSize: 10)
- Server selection timeout: 5000ms
- Socket timeout: 45000ms
- Automatic reconnection enabled

---

## 10. Backup & Recovery Strategy

- MongoDB Atlas automated backups enabled (daily snapshots retained for 7 days)
- Before any week is archived, the final report data should be exported and stored separately
- The soft-delete pattern means no data loss from accidental deletion — admin can recover by flipping `isDeleted` back to `false`
- Audit logs retain the `previousValue` of every updated/deleted entry for forensic recovery

---

## 11. Implementation Steps (Order of Execution)

**Step 1:** Set up MongoDB Atlas cluster and create the `bvrit_report_db` database.

**Step 2:** Configure environment variables for the connection string.

**Step 3:** Write and test the `User` Mongoose schema with all validations and indexes.

**Step 4:** Write and test the `Week` schema with the partial unique index for active week enforcement.

**Step 5:** Write the `ReportEntry` schema with the flexible `data` field and all indexes.

**Step 6:** Write the `SectionStatus` schema with the compound unique index.

**Step 7:** Write the `AuditLog` schema with the TTL index.

**Step 8:** Run the admin seeder to create the first admin account.

**Step 9:** Run the week seeder to create a test active week and verify the 17 section_status documents are auto-created.

**Step 10:** Test all indexes using MongoDB Atlas's query performance advisor.

**Step 11:** Verify soft delete flow by creating, deleting, and querying entries.

**Step 12:** Connect to backend and test the full data flow end-to-end.
