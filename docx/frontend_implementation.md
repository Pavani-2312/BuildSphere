# Frontend Implementation Plan
## Collaborative Weekly Report Management System
### Technology: React.js + React Router + Context API + Socket.io Client

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Routing Architecture](#4-routing-architecture)
5. [State Management](#5-state-management)
6. [Context Providers](#6-context-providers)
7. [Custom Hooks](#7-custom-hooks)
8. [Services Layer](#8-services-layer)
9. [Utility Modules](#9-utility-modules)
10. [Pages — Detailed Implementation](#10-pages--detailed-implementation)
    - [Page 1: Login Page](#page-1-login-page)
    - [Page 2: Dashboard Page](#page-2-dashboard-page)
    - [Page 3: Section Page](#page-3-section-page-dynamic--serves-all-17-sections)
    - [Page 4: Report Preview Page](#page-4-report-preview-page)
    - [Page 5: User Management Page](#page-5-user-management-page-admin-only)
    - [Page 6: Week Management Page](#page-6-week-management-page)
11. [Component Library](#11-component-library)
    - [Common Components](#common-components)
    - [Form Components](#form-components)
    - [Dashboard Components](#dashboard-components)
    - [Entry Components](#entry-components)
    - [Report Components](#report-components)
12. [Section Configuration System](#12-section-configuration-system)
13. [Form Validation Strategy](#13-form-validation-strategy)
14. [Real-Time Collaboration (Socket.io)](#14-real-time-collaboration-socketio)
15. [API Integration Strategy](#15-api-integration-strategy)
16. [Role-Based Access Control](#16-role-based-access-control)
17. [Responsive Design Strategy](#17-responsive-design-strategy)
18. [UX Decisions & Behaviour Guidelines](#18-ux-decisions--behaviour-guidelines)
19. [Implementation Phases](#19-implementation-phases)

---

## 1. Project Overview

The frontend is a React.js single-page application (SPA) that enables faculty, coordinators, and admins to collaboratively fill, manage, and export weekly department reports. It consists of six main pages, 17 dynamic section forms, real-time collaboration via Socket.io, role-based access control, and a live report preview with PDF and DOCX export capability.

The primary users are faculty and coordinators working on desktop or laptop computers. The UI must be clean, fast, and real-time — reflecting changes from other logged-in users instantly without requiring a page refresh.

---

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| React.js (Vite) | UI framework and build tool |
| React Router v6 | Client-side page routing |
| Context API | Global state (auth, week, socket) |
| Axios | HTTP client for API calls |
| Socket.io Client | Real-time bi-directional events |
| React Hot Toast | Toast notification system |
| React DatePicker | Date input with range restriction |
| CSS Modules / Global CSS | Scoped and global styling |

No Redux is used. The data flow is not deeply nested or cross-cutting enough to justify it. Context API with custom hooks covers all requirements cleanly.

---

## 3. Project Structure

The frontend source directory is organized as follows:

```
frontend/
├── public/
│   ├── index.html
│   └── bvrit_logo.png
└── src/
    ├── assets/
    │   └── styles/
    │       ├── global.css          → Reset, base typography, utility classes
    │       └── theme.css           → CSS variables: colors, fonts, spacing, shadows
    ├── components/
    │   ├── common/                 → Shared UI components used across all pages
    │   ├── forms/                  → One form component per section (17 total) + wrapper
    │   ├── dashboard/              → Dashboard-specific components
    │   ├── entries/                → Entry table, row, and live editing indicator
    │   └── report/                 → Report preview and export components
    ├── pages/                      → Top-level page components (one per route)
    ├── context/                    → React Context providers (Auth, Week, Socket)
    ├── hooks/                      → Custom React hooks
    ├── services/                   → Axios service modules (one per API domain)
    ├── utils/                      → Pure helper functions and configuration
    ├── App.jsx                     → Route definitions and layout wrapper
    └── main.jsx                    → React DOM entry point
```

---

## 4. Routing Architecture

All routes are defined in `App.jsx` using React Router v6.

### Route Map

| Path | Page Component | Access |
|---|---|---|
| `/login` | LoginPage | Public only (redirect if logged in) |
| `/dashboard` | DashboardPage | All roles |
| `/section/:sectionName` | SectionPage | All roles |
| `/report/preview` | ReportPreviewPage | All roles |
| `/users` | UserManagementPage | Admin only |
| `/weeks` | WeekManagementPage | Coordinator, Admin |
| `/profile` | ProfilePage | All roles |
| `*` | Redirect to `/dashboard` | — |

### Protected Route Behaviour

Every route except `/login` is wrapped in a `ProtectedRoute` component. This component reads the current user from `AuthContext`. If no user is found (not logged in), it redirects to `/login`. If a user is found but does not have the required role, it redirects to `/dashboard` with a "not authorized" toast message.

The `:sectionName` URL parameter in the section route corresponds directly to the section identifiers used in the database (e.g., `general_points`, `placements`, `faculty_fdp_certifications`). The SectionPage reads this parameter and renders the appropriate form and table.

---

## 5. State Management

State is divided into three tiers:

### Tier 1 — Global Context State
Shared across the entire application. Changes trigger re-renders in all subscribed components.

- **AuthContext**: Stores the logged-in user's ID, name, email, role, and department. Also stores the current JWT access token in memory (never in localStorage for security).
- **WeekContext**: Stores the active week's ID, label, start date, end date, and submission status. Fetched once after login and shared across all section pages.
- **SocketContext**: Stores the single Socket.io connection instance. Initialized after successful login and shared to all pages for event subscription.

### Tier 2 — Hook-Level State
Managed inside custom hooks, scoped to the component or page that uses the hook.

- **useEntries**: Holds the list of entries for the currently open section, plus loading and error states.
- **useSectionStatus**: Holds the status of all 17 sections for the active week.
- **useDashboard**: Holds summary stats, contributor data, and activity feed items.

### Tier 3 — Local Component State
Managed with `useState` inside individual components. Not shared.

- Form field values
- Validation error messages per field
- Modal open/close state
- Edit mode vs add mode toggle
- Loading spinner state during form submission

---

## 6. Context Providers

### AuthContext

Provides user identity throughout the app. Initialized on app load by calling the `/api/auth/refresh` endpoint using the httpOnly cookie. If the refresh succeeds, the user is set in context and the app loads normally. If it fails, the user is treated as logged out.

Exposes:
- `user` — the current user object (or null if not logged in)
- `login(credentials)` — calls the login API, sets user in context
- `logout()` — calls the logout API, clears user from context
- `accessToken` — the in-memory JWT used in API request headers

### WeekContext

Fetched immediately after the user is authenticated. Calls `/api/weeks/active` for the user's department and stores the result globally.

Exposes:
- `activeWeek` — the full active week object
- `isWeekSubmitted` — boolean flag for read-only mode enforcement
- `refreshWeek()` — re-fetches the active week data on demand

### SocketContext

Initialized once after login by creating a Socket.io connection to the backend server, passing the access token for authentication.

Exposes:
- `socket` — the Socket.io client instance
- Components use the `useSocket` hook to access this instance and subscribe to events via `useEffect` (subscribing on mount, unsubscribing on unmount)

---

## 7. Custom Hooks

### useAuth
Consumes `AuthContext`. Used in every component that needs to know who is logged in or what their role is.

### useSocket
Consumes `SocketContext`. Returns the socket instance. Used in page-level components to subscribe to section-specific real-time events.

### useEntries(sectionName, weekId)
Handles all data operations for a specific section:
- Fetches all entries for the section on mount
- Exposes `addEntry`, `updateEntry`, `deleteEntry` functions that call the corresponding service methods
- Manages `entries` array, `loading` boolean, and `error` state
- Applies real-time Socket.io event handlers to keep the local entries array in sync

### useSectionStatus(weekId)
Fetches and exposes the status (pending / in_progress / complete) of all 17 sections. Used by the Dashboard page and the Sidebar component to render status badges.

### useDashboard(weekId)
Fetches and returns the full dashboard summary: stats, section statuses with entry counts, contributor breakdown, and the recent activity feed.

---

## 8. Services Layer

A single Axios instance is created in `api.js` and shared by all service modules.

### api.js
Configures:
- Base URL pointing to the backend API
- Request interceptor that attaches `Authorization: Bearer <token>` to every request, reading the token from `AuthContext`
- Response interceptor that catches 401 errors, attempts a token refresh via `/api/auth/refresh`, retries the original request if refresh succeeds, and redirects to `/login` if refresh fails

### Service Modules

Each service module wraps the Axios calls for one domain and returns clean, typed data to the hooks.

| File | Responsibilities |
|---|---|
| `auth.service.js` | login, logout, refresh token |
| `entry.service.js` | getEntries, createEntry, updateEntry, softDeleteEntry |
| `week.service.js` | getActiveWeek, getAllWeeks, createWeek, submitWeek |
| `dashboard.service.js` | getDashboardSummary, getActivityFeed |
| `report.service.js` | getReportPreview, exportPDF, exportDOCX |
| `user.service.js` | getAllUsers, createUser, updateUser, deactivateUser |
| `status.service.js` | getAllSectionStatuses, updateSectionStatus |

---

## 9. Utility Modules

### sectionConfig.js
The master configuration file for all 17 sections. This is the single source of truth for form rendering, validation, and display labels across the entire frontend.

For each section it defines:
- Section display name and description
- Ordered list of fields, each with: field key, label, input type (text / number / date / select / textarea), placeholder, whether it is required, and any special validation rules (e.g., roll number pattern)
- Column headers for the entry table display

### dateHelpers.js
Pure functions for:
- Formatting ISO date strings to readable display formats
- Checking whether a given date falls within the active week's start and end date range
- Calculating "time ago" strings for the activity feed (e.g., "3 hours ago")

### rolePermissions.js
A set of pure functions that accept a `user` object and return booleans for permission checks. Examples:
- `canEditEntry(user, entry)` — true if user is the entry's creator, a coordinator, or an admin
- `canSubmitWeek(user)` — true if user is coordinator or admin
- `canManageUsers(user)` — true if user is admin
- `canExportReport(user)` — true if user is coordinator or admin

These functions are used throughout the UI to conditionally render action buttons and controls.

---

## 10. Pages — Detailed Implementation

---

### Page 1: Login Page

**Route:** `/login`

**Layout:** A vertically and horizontally centered card on a neutral gradient background. The BVRIT logo and institution name sit above the card.

**Form Fields:**
- Email address input (type: email)
- Password input (type: password) with a show/hide toggle icon button
- Login button

**Behaviour:**

Client-side validation runs before any API call is made. It checks that the email field is non-empty and correctly formatted, and that the password field is non-empty. Validation errors appear below the respective fields as inline red text.

When the user submits valid credentials, the login button is replaced by a loading spinner while the API call is in progress. On success, the JWT is stored in `AuthContext` and the user is redirected to `/dashboard`. On failure, a descriptive error message is shown in a red banner inside the card — not as a toast — so it cannot be missed. Possible failure messages include "Invalid email or password" and "Your account has been deactivated."

If a user who is already logged in navigates to `/login`, they are immediately redirected to `/dashboard` without seeing the login form.

---

### Page 2: Dashboard Page

**Route:** `/dashboard`

**Accessible by:** All roles. Coordinators and admins see additional controls.

**Layout:**
The page is divided into three vertical zones:
1. Top stats row
2. Section status grid
3. Bottom row: Activity feed (left) + Contributor breakdown table (right)

**Top Stats Row:**

Four stat cards displayed in a horizontal row:
- Active week label and date range
- Total number of entries submitted this week
- Overall completion count (e.g., "11 of 17 sections complete")
- A "Submit Week" button (visible only to coordinators and admins)

The Submit Week button is disabled and shown in a muted style if not all sections are marked complete. When clicked, it opens a confirmation modal that lists the status of all 17 sections. The coordinator can either cancel or proceed. If any sections are still pending, a warning is shown inside the modal before the confirm button is enabled.

**Section Status Grid:**

17 cards arranged in a responsive CSS grid (4 columns on large screens, 2 on tablet, 1 on mobile). Each card shows:
- Section name
- Status badge (grey = pending, yellow = in progress, green = complete) using the `StatusBadge` component
- Entry count for the section this week

Clicking any card navigates to `/section/:sectionName`.

Cards are sorted dynamically: in-progress sections appear first, then pending, then complete — giving users an at-a-glance view of what needs attention.

Coordinators and admins see a "Mark Complete" button on each card. Clicking it calls the status update API and immediately updates the badge via the response.

**Activity Feed:**

Rendered by the `ActivityFeed` component. Shows the last 15 audit log entries in reverse chronological order. Each item is formatted as: "[Faculty Name] added an entry to [Section Name] — [time ago]". New entries animate in from the top using a slide-down transition when received via the `activity:new` Socket.io event.

**Contributor Breakdown Table:**

Rendered by the `ContributorTable` component. Shows each faculty member who has contributed at least one entry this week, their entry count, and their last active timestamp. Visible only to coordinators and admins.

---

### Page 3: Section Page (Dynamic — serves all 17 sections)

**Route:** `/section/:sectionName`

**Accessible by:** All roles.

**Layout:** Two-panel layout side by side.
- Left panel: Entry form (40% width)
- Right panel: Live entry table (60% width)

On tablet, the panels stack: form on top, table below. On mobile, the form is collapsible.

**Section Header:**

Above the two panels, a section title bar shows the section's display name and a status badge. Below the title, the `LiveEditingIndicator` component conditionally shows "Dr. [Name] is currently editing this section" when another user has the form open, using the `user:typing` Socket.io event.

**Left Panel — Entry Form:**

Form fields are rendered dynamically by the `SectionFormWrapper` component based on the configuration for the current section read from `sectionConfig.js`. No hardcoded field rendering happens in this component.

Field types rendered include:
- Text inputs
- Number inputs
- Textarea for longer content
- Select dropdowns for enum fields
- Date pickers that visually disable and block selection of dates outside the active week's start and end date range

Required fields are marked with a red asterisk. Validation errors appear inline below each field as the user types. The form does not allow submission while any required field is empty or any validation rule is violated.

The form operates in two modes:
- **Add mode** (default): The button reads "Add Entry". On successful submission, the form resets to blank and the new entry appears in the right panel.
- **Edit mode**: Triggered when the user clicks the Edit icon on an entry row in the right panel. The entry's data populates the form fields. The button changes to "Update Entry" and a "Cancel" button appears. Cancelling resets the form to Add mode.

During API submission, the button is replaced by a loading spinner.

**Right Panel — Live Entry Table:**

Rendered by the `EntryTable` component. Shows all entries for this section in the active week as a formatted table. Column headers are drawn from `sectionConfig.js`.

Each row is rendered by the `EntryRow` component and includes:
- All field values for that entry
- A small "Entered by [Name]" label below the row
- An Edit icon (pencil) — visible if the user is the entry creator, a coordinator, or an admin
- A Delete icon (trash can) — same visibility rules

Clicking Delete opens a `ConfirmDialog` asking the user to confirm before the soft delete API call is made.

The table shows a skeleton loader (placeholder rows) while entries are being fetched on initial load. When no entries exist yet, an empty state message is shown with a prompt encouraging the user to add the first entry.

Newly added or updated rows are highlighted with a subtle pulse animation for 3 seconds after the change.

**Read-Only Mode:**

If the active week's status is "submitted", the left panel (form) is hidden entirely and a full-width banner is shown: "This week has been submitted. Entries are locked." The right panel remains visible for reference.

---

### Page 4: Report Preview Page

**Route:** `/report/preview`

**Accessible by:** All roles (faculty: view only; coordinator and admin: view + export).

**Layout:** A centered white paper-like container styled to match the institution's report format, with sticky export buttons pinned to the top-right corner of the viewport.

**Content:**

The preview is generated from a live API call to `/api/report/preview`, so it always reflects the current state of all entries. The page renders:
- BVRIT institution header with the logo
- Week label and date range
- All 17 sections in their prescribed order, each with a heading and a formatted table matching the institution's column structure
- Sections with no entries render an empty table (not hidden), as required by the report format

The `ReportPreview` component is the outer wrapper, and it renders one `ReportSection` component per section.

**Export Controls:**

The `ExportButtons` component is rendered only for coordinators and admins. It shows two buttons: "Export as PDF" and "Export as DOCX". Clicking either button triggers the corresponding API download endpoint. During file generation, the button is replaced by a loading spinner and is disabled to prevent double-clicks.

**Real-Time Update Banner:**

The preview page listens to Socket.io events and shows a non-intrusive banner at the top of the page when other users make changes: "Report updated — click to refresh preview." This approach is used instead of auto-refreshing the preview, which would be disruptive while the coordinator is reviewing the document.

---

### Page 5: User Management Page (Admin Only)

**Route:** `/users`

**Accessible by:** Admin only. Any other role is redirected to `/dashboard`.

**Layout:** A filter bar at the top, an "Add User" button aligned to the right, and a full-width user table below.

**Filters:**
- Dropdown: Filter by department
- Dropdown: Filter by role (faculty / coordinator / admin)
- Toggle: Show active / inactive users

**User Table Columns:**
Name, Email, Department, Role, Status, Last Login, Actions

**Actions per row:**
- Edit: Opens an inline edit form or modal to change the user's role or department
- Deactivate / Reactivate: Toggles the user's `isActive` status with a confirmation dialog

**Add User Modal:**

A modal form with fields: Full name, Email, Temporary password, Role, Department. On submission, the new user is created and appears at the top of the table with a success toast notification.

---

### Page 6: Week Management Page

**Route:** `/weeks`

**Accessible by:** Coordinator, Admin.

**Layout:** Two vertical sections:
1. Active week card at the top
2. Historical weeks list below

**Active Week Card:**

Displays the current week's label, start date, end date, and submission status. Contains a "Submit Week" button with the same behaviour as on the Dashboard page — including the pre-submission checklist modal showing the completion status of all 17 sections.

**Create New Week Form:**

A form (inline, not in a modal) below the active week card with fields: Week label, Start date, End date. Admins also see a Department dropdown. Coordinators default to their own department. Submitting this form creates the new week and refreshes the page.

**Historical Weeks Table:**

Shows all past weeks with columns: Week Label, Date Range, Department, Status (submitted / archived), Actions. Each row has a "View Report" button that triggers the DOCX or PDF download for that archived week.

---

## 11. Component Library

### Common Components

**Navbar**
Fixed top navigation bar. Shows the BVRIT logo and institution name on the left, and on the right shows the currently logged-in user's name, department, and role, along with a logout button. The logout button calls `AuthContext.logout()` and redirects to `/login`.

**Sidebar**
Collapsible left sidebar listing all 17 sections. Each section item shows its name and a `StatusBadge`. The currently active section (based on the URL) is highlighted. Sections with "complete" status show a checkmark icon. Faculty can click any section to navigate directly to it.

**Loader**
A full-page centered spinner shown during initial app load (while the auth refresh is in progress). Also used as a smaller inline variant inside buttons during API calls.

**Modal**
A reusable modal dialog wrapper. Accepts `isOpen`, `onClose`, `title`, and `children` props. Renders a semi-transparent overlay with the dialog centered on screen. Closes on clicking the overlay or pressing Escape.

**Toast**
Wraps the React Hot Toast library. Provides `showSuccess(message)`, `showError(message)`, and `showInfo(message)` utility functions used throughout the app for feedback after API operations.

**ConfirmDialog**
A specialized modal used for destructive actions (delete entry, submit week, deactivate user). Shows a warning message and two buttons: Cancel and Confirm. The Confirm button is styled in red for destructive actions.

**StatusBadge**
A small colored pill component. Renders in grey for "pending", amber/yellow for "in_progress", and green for "complete". Accepts a `status` prop and applies the appropriate CSS class.

**ProtectedRoute**
A wrapper component for all authenticated routes. Reads the user from `AuthContext`. If no user exists, redirects to `/login`. If a required role is specified and the user's role does not match, redirects to `/dashboard`.

---

### Form Components

**SectionFormWrapper**
The generic form wrapper used by all 17 section forms. Reads the section's field configuration from `sectionConfig.js`, renders the appropriate input types dynamically, handles all validation logic, and manages the add/edit mode toggle. Individual section form components (e.g., `PlacementsForm.jsx`) use this wrapper and pass their section key to it.

**Individual Section Form Components (17 total)**

One file per section. Each file imports `SectionFormWrapper` and passes its section identifier. This structure keeps the form rendering logic centralized while allowing section-specific customization if needed in the future.

Sections:
- GeneralPointsForm
- FacultyJoinedRelievedForm
- FacultyAchievementsForm
- StudentAchievementsForm
- DepartmentAchievementsForm
- FacultyEventsForm
- StudentEventsForm
- NonTechnicalEventsForm
- IndustryVisitsForm
- HackathonForm
- FacultyFDPForm
- FacultyVisitsForm
- PatentsForm
- VEDICProgramsForm
- PlacementsForm
- MoUsForm
- SkillDevelopmentForm

---

### Dashboard Components

**SectionStatusCard**
Renders a single card in the 17-section grid. Props: section key, display name, status, entry count. Shows a "Mark Complete" button conditionally based on user role.

**CompletionProgressBar**
A horizontal progress bar showing the ratio of complete sections to total sections (e.g., 11/17). Animates on mount and whenever the count changes.

**ContributorTable**
A table component listing contributing faculty, their entry counts, and last active time. Visible only to coordinators and admins.

**ActivityFeed**
A scrollable list of recent audit log entries. Each item shows the faculty name, action type, section name, and time ago. New items animate in from the top when received via Socket.io.

---

### Entry Components

**EntryTable**
Renders all entries for a section as a formatted table. Columns are derived from `sectionConfig.js` for the current section. Handles loading skeleton state and empty state. Accepts a callback for when an edit or delete action is triggered on a row.

**EntryRow**
Renders a single entry as a table row. Shows all field values, the "Entered by" label, and the Edit and Delete action icons. Applies the highlight animation class if the entry was just added or updated.

**LiveEditingIndicator**
A dismissible banner shown below the section title when another user is actively typing in this section. Uses the `user:typing` Socket.io event. Auto-dismisses 5 seconds after the last typing event is received from the other user.

---

### Report Components

**ReportPreview**
The outer container for the report preview. Fetches the full report data from the API on mount, renders the institution header, and maps over all 17 sections passing data to `ReportSection`.

**ReportSection**
Renders one section of the report. Shows the section heading and a formatted table matching the institution's prescribed column structure. Renders the table with an empty body if no entries exist (required by the format — sections are never hidden).

**ExportButtons**
Two buttons for PDF and DOCX export. Shows loading spinners during file generation. Rendered only for coordinators and admins. Positioned as a sticky block in the top-right of the report preview page.

---

## 12. Section Configuration System

The `sectionConfig.js` file is the most critical utility file in the frontend. It is a JavaScript object keyed by each of the 17 section identifiers. For each section it exports:

- **displayName**: The human-readable section title shown in the sidebar, section header, and dashboard cards
- **description**: A one-line description shown as a subtitle on the section page
- **fields**: An ordered array of field definition objects. Each object contains:
  - `key`: The field's database key (used for API payloads)
  - `label`: The label shown above the input
  - `type`: One of `text`, `number`, `date`, `dateRange`, `select`, `textarea`
  - `options`: An array of option strings for `select` fields
  - `required`: Boolean
  - `placeholder`: Hint text shown inside the input when empty
  - `validation`: An optional object with rules such as `pattern`, `minLength`, `maxLength`, or custom validator functions
- **tableColumns**: An ordered array of column definitions for the `EntryTable`. Each column has a `header` (display name) and a `dataKey` (maps to the field key in the entry's data object)

The `SectionFormWrapper` reads this configuration to dynamically render form fields without any hardcoded section-specific logic in the form itself. This means adding a new field to a section in the future only requires updating `sectionConfig.js`.

---

## 13. Form Validation Strategy

Validation runs at three moments:
1. On blur (when the user leaves a field) — validates only that field
2. On change (live, after the field has been touched once) — re-validates as the user types
3. On form submission — validates all fields before the API call is made

If any field fails validation on submission, the API call is blocked, all errors are shown simultaneously, and the page scrolls to the first error field.

**Validation Rules Applied:**

- Required fields: Must not be empty or contain only whitespace
- Date fields: The selected date must fall within the active week's `startDate` to `endDate`. This is enforced both visually (the date picker disables out-of-range dates) and programmatically (a validation function confirms the value before submission)
- Number fields: Must be a non-negative integer
- Select fields: Must be one of the valid enum options
- Pattern fields: Roll numbers must match the pattern `\d{2}WH\d{1}A\d{4}`. Application numbers for patents must be non-empty strings
- Textarea fields: Have a configurable maximum character count shown as a live counter

All error messages are written in plain language and appear directly below the relevant field. No modal or toast is used for field-level errors.

---

## 14. Real-Time Collaboration (Socket.io)

The Socket.io client connection is initialized once after login and shared through `SocketContext`. It is disconnected automatically when the user logs out.

### Events the Frontend Listens To

| Event | Where Handled | Action |
|---|---|---|
| `entry:created` | SectionPage | Append new entry to entries array, highlight row for 3 seconds |
| `entry:updated` | SectionPage | Replace the matching entry in the array, highlight row for 3 seconds |
| `entry:deleted` | SectionPage | Remove the matching entry from the array |
| `section:status_changed` | DashboardPage | Update the matching section card's status badge |
| `user:typing` | SectionPage | Show the LiveEditingIndicator with the other user's name |
| `week:submitted` | All pages | Show read-only banner, hide all entry forms |
| `activity:new` | DashboardPage | Prepend new item to the activity feed |

### Events the Frontend Emits

| Event | When Emitted |
|---|---|
| `user:typing` | When the user starts typing in a section form. Debounced — emitted at most once every 2 seconds |
| `user:join_section` | When the user navigates to a section page |
| `user:leave_section` | When the user navigates away from a section page (cleanup in useEffect return) |

### Subscription Pattern

Each page subscribes to the events it needs inside a `useEffect` hook with the socket as a dependency. The cleanup function of the effect unsubscribes from all events by calling `socket.off(eventName)`. This ensures no stale listeners accumulate as the user navigates between sections.

---

## 15. API Integration Strategy

All API calls go through service modules that use the shared Axios instance from `api.js`.

**Request Flow:**
1. A user action triggers a hook function (e.g., `addEntry(data)`)
2. The hook calls the corresponding service method (e.g., `entry.service.createEntry(sectionName, weekId, data)`)
3. The service makes the Axios call with the correct endpoint, method, and payload
4. The request interceptor in `api.js` attaches the `Authorization` header automatically
5. On success, the service returns the response data to the hook
6. On 401, the response interceptor calls the refresh endpoint, stores the new token, and retries the original request automatically
7. The hook updates its state (entries, loading, error) and the UI re-renders

**Error Handling:**

All API errors are caught at the hook level. Network errors and server errors (4xx, 5xx) are handled by setting an `error` state in the hook and showing a toast with the error message. The component UI shows an error state (e.g., "Failed to load entries — please refresh the page") without crashing.

---

## 16. Role-Based Access Control

Three roles exist: `faculty`, `coordinator`, `admin`. RBAC is enforced both at the route level (via `ProtectedRoute`) and within page components (via `rolePermissions.js` helper functions).

### Role Capabilities Summary

| Feature | Faculty | Coordinator | Admin |
|---|---|---|---|
| View dashboard | ✓ | ✓ | ✓ |
| Add entries | ✓ | ✓ | ✓ |
| Edit own entries | ✓ | ✓ | ✓ |
| Edit any entry | ✗ | ✓ | ✓ |
| Delete own entries | ✓ | ✓ | ✓ |
| Delete any entry | ✗ | ✓ | ✓ |
| Mark section complete | ✗ | ✓ | ✓ |
| Submit week | ✗ | ✓ | ✓ |
| Export report (PDF/DOCX) | ✗ | ✓ | ✓ |
| View report preview | ✓ (no export) | ✓ | ✓ |
| Create/manage users | ✗ | ✗ | ✓ |
| Create new weeks | ✗ | ✓ (own dept) | ✓ (any dept) |
| View contributor table | ✗ | ✓ | ✓ |

The UI elements for restricted features (buttons, action icons, navigation links) are conditionally rendered based on the user's role. They are not just disabled — they are not rendered at all, so unauthorized users do not see controls they cannot use.

---

## 17. Responsive Design Strategy

The primary target is desktop (1024px an. All design decisions prioritize the desktop experience. The layout degrades gracefully at smaller sizes.

### Breakpoints

| Breakpoint | Layout |
|---|---|
| 1024px and above | Two-panel section layout, full sidebar, 4-column dashboard grid |
| 768px to 1023px | Single column, form above table on section pages, 2-column dashboard grid, sidebar collapses to icon strip |
| Below 768px | Fully stacked layout, sidebar becomes a hamburger menu overlay, 1-column dashboard grid |

### Sidebar Behaviour

On desktop, the sidebar is always visible on the left. On tablet, it collapses to a narrow icon strip showing only status color dots — hovering or clicking an icon expands it. On mobile, the sidebar is hidden and accessed via a hamburger icon in the navbar, which opens it as a full-height overlay.

### Section Page on Mobile

On mobile, the entry form and entry table are shown as two separate tabs ("Add Entry" and "View Entries") rather than side by side. A tab bar appears below the section header for navigationetween the two panels.

---

## 18. UX Decisions & Behaviour Guidelines

### No Auto-Save
Forms are never auto-saved. Every entry must be explicitly submitted by clicking "Add Entry" or "Update Entry". This prevents partial or accidental entries from being saved to the database.

### No Optimistic Updates
The UI does not immediately show a new entry before the server confirms it. The form's submit button shows a loading spinner while the API call is in progress. Only after the server responds with success does the entry appear in the table. This ensures the user never sees data that wasn't actually saved.

### Toast Notifications
A toast notification is shown for every meaningful user action:
- Entry added successfully
- Entry updated successfully
- Entry deleted
- Section marked as complete
- Week submitted
- Export started / Export failed
- Any API error

Toasts appear in the bottom-right corner and auto-dismiss after 4 seconds. Error toasts stay until dismissed manually.

### Empty States
When a section has no entries yet, the entry table shows an empty state panel with an icon and the text "No entries yet for this section. Use the form to add the first entry." This is friendlier than an empty table with just headers.

### Loading Skeletons
When the entry table is loading (initial fetch), placeholder skeleton rows are shown instead of a spinner or blank space. This gives a more polished and responsive feel, particularly on slower connections.

### Confirmation Dialogs
All destructive actions (delete entry, submit week, deactivate user) require explicit confirmation via a dialog. The confirmation button uses red styling. Cancel is the default focused element so accidental keyboard confirmation is prevented.

### Read-Only Mode Enforcement
When the active week has been submitted, every section page shows a fixed full-width banner at the top: "This week has been submitted. Entries are locked." All form panels are hidden. The entry table remains visible for reference. The banner cannot be dismissed.

---

## 19. Implementation Phases

### Phase 1 — Foundation (Week 1)
- Set up Vite + React project with folder structure
- Configure React Router with all six routes
- Implement AuthContext, WeekContext, and SocketContext
- Build the Axios instance with interceptors in `api.js`
- Implement the Login Page with auth service integration
- Implement `ProtectedRoute` and role-based redirects
- Build the Navbar and Sidebar shell (static, not data-driven yet)

### Phase 2 — Core Section Flow (Weeks 2–3)
- Build `sectionCjs` for all 17 sections
- Build `SectionFormWrapper` with dynamic field rendering and validation
- Build all 17 individual section form components
- Build `EntryTable` and `EntryRow` with edit and delete support
- Build `useEntries` hook and `entry.service.js`
- Wire up the Section Page with the two-panel layout
- Integrate `useSectionStatus` for sidebar status badges

### Phase 3 — Dashboard (Week 4)
- Build Dashboard Page with top stats row
- Build `SectionStatusCard`, `CompletionProgressBar`, `Activityed`, `ContributorTable`
- Integrate `useDashboard` hook and `dashboard.service.js`
- Implement "Mark Complete" and "Submit Week" flows with confirmation dialog and checklist modal

### Phase 4 — Real-Time Collaboration (Week 5)
- Initialize Socket.io client in `SocketContext`
- Add event listeners to Section Page for `entry:created`, `entry:updated`, `entry:deleted`
- Implement `LiveEditingIndicator` with `user:typing` events
- Add `section:status_changed` listener to Dashboard Page
- Add `week:submitted`istener and read-only banner across all pages
- Add `activity:new` listener to Activity Feed

### Phase 5 — Report Preview and Export (Week 6)
- Build `ReportPreview`, `ReportSection`, and `ExportButtons` components
- Integrate `report.service.js` for preview fetch and file downloads
- Style the preview to match the institution's report format
- Add the "Report updated" real-time banner

### Phase 6 — Admin Pages and Polish (Week 7)
- Build User Management Page (admin only) with filters, table, add useral
- Build Week Management Page with active week card, create form, historical list
- Implement Profile Page
- Complete responsive design adjustments for tablet and mobile
- Add empty states, loading skeletons, and error states to all data-loading components
- End-to-end testing across all roles and flows


