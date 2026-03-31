# START HERE - Database Implementation Guide

## Current Status

### What's Already Done
- 5 Mongoose models created with full validation
- Database initialization script ready
- Test verification script ready
- All documentation written

### What's NOT Done Yet
- Date validation middleware (planned but not implemented)
- File import functionality (not implemented)
- Backend API (not started)

---

## Where to Start: Step-by-Step

### Phase 1: Set Up MongoDB (Do This First)

**Time: 10 minutes**

1. Follow `COMPLETE_SETUP_GUIDE.md` Part 1 to create MongoDB Atlas account
2. Get your connection string
3. Create `.env` file in `/home/ubuntu/Wings_AI/BuildSphere/database/`
4. Run these commands:

```bash
cd /home/ubuntu/Wings_AI/BuildSphere/database
npm install
npm run init
npm test
```

If all tests pass, your database is ready.

---

## Date Filters - Current Implementation

### What's Implemented:

**1. Week-Level Date Validation (Schema Level)**
- Location: `models/Week.js`
- Validation: `endDate` must be greater than `startDate`
- Automatic: Mongoose validates this on save

```javascript
endDate: {
  type: Date,
  required: [true, 'End date is required'],
  validate: {
    validator: function(value) {
      return value > this.startDate;
    },
    message: 'End date must be after start date'
  }
}
```

**2. Timestamp Tracking**
- All models have `createdAt` and `updatedAt` (automatic via Mongoose)
- `lastEditedAt`, `deletedAt`, `submittedAt` fields exist
- Indexes on date fields for efficient queries

### What's NOT Implemented Yet:

**1. Entry Date Validation Against Week Range**
- Plan says: "Date fields in data must fall within week's startDate to endDate"
- Status: NOT IMPLEMENTED
- Needs: Backend middleware to validate entry dates

**2. Date Range Queries**
- No helper functions for filtering by date range
- No middleware for date validation
- No date parsing utilities

---

## File Import - Current Implementation

### Status: NOT IMPLEMENTED

The plan mentions:
- No file import functionality exists
- No CSV/Excel import
- No bulk upload features
- All data entry is manual through API

If you need file import, you'll need to add:
1. File upload endpoint (multer middleware)
2. CSV/Excel parser (csv-parser or xlsx library)
3. Validation for imported data
4. Bulk insert logic

---

## What You Need to Implement Next

### Priority 1: Backend API (Start Here After Database Setup)

Create backend folder structure:
```
backend/
├── server.js                 (Express server)
├── config/
│   └── db.js                 (Mongoose connection)
├── middleware/
│   ├── auth.js               (JWT authentication)
│   ├── validateWeek.js       (Date validation - NEW)
│   └── errorHandler.js       (Error handling)
├── routes/
│   ├── auth.routes.js        (Login, logout)
│   ├── user.routes.js        (User management)
│   ├── week.routes.js        (Week management)
│   ├── entry.routes.js       (Report entries)
│   └── section.routes.js     (Section status)
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── week.controller.js
│   ├── entry.controller.js
│   └── section.controller.js
└── utils/
    ├── dateValidator.js      (Date validation helper - NEW)
    └── auditLogger.js        (Audit log helper)
```

### Priority 2: Date Validation Middleware (Critical)

Create `backend/middleware/validateWeek.js`:

```javascript
const Week = require('../../database/models/Week');

const validateEntryDates = async (req, res, next) => {
  try {
    const { weekId, data } = req.body;
    
    // Fetch week
    const week = await Week.findById(weekId);
    if (!week) {
      return res.status(404).json({ error: 'Week not found' });
    }
    
    // Extract all date fields from data
    const dateFields = ['date', 'fromDate', 'toDate', 'publicationDate', 'signingDate'];
    
    for (const field of dateFields) {
      if (data[field]) {
        const entryDate = new Date(data[field]);
        
        if (entryDate < week.startDate || entryDate > week.endDate) {
          return res.status(400).json({
            error: `${field} must be between ${week.startDate.toDateString()} and ${week.endDate.toDateString()}`
          });
        }
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { validateEntryDates };
```

### Priority 3: Basic CRUD Operations

Start with entry creation:

```javascript
// backend/controllers/entry.controller.js
const ReportEntry = require('../../database/models/ReportEntry');
const SectionStatus = require('../../database/models/SectionStatus');

exports.createEntry = async (req, res) => {
  try {
    const { weekId, section, data } = req.body;
    const userId = req.user._id; // from JWT middleware
    
    // Create entry
    const entry = await ReportEntry.create({
      weekId,
      department: req.user.department,
      section,
      data,
      enteredBy: userId,
      enteredByName: req.user.name,
      enteredByRole: req.user.role
    });
    
    // Update section status
    await SectionStatus.findOneAndUpdate(
      { weekId, section, department: req.user.department },
      { 
        $inc: { entryCount: 1 },
        status: 'in_progress',
        lastUpdatedBy: userId,
        lastUpdatedByName: req.user.name,
        lastUpdatedAt: new Date()
      }
    );
    
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

---

## Recommended Implementation Order

### Week 1: Backend Foundation
1. Set up Express server
2. Connect to MongoDB using existing models
3. Implement JWT authentication
4. Create user login/logout endpoints
5. Test with Postman

### Week 2: Entry Management
1. Create date validation middleware
2. Implement entry CRUD endpoints
3. Auto-update section status on entry changes
4. Test all 17 sections

### Week 3: Week Management
1. Create week endpoints (create, list, submit)
2. Enforce one active week per department
3. Implement week submission logic
4. Test week lifecycle

### Week 4: Advanced Features
1. Implement audit logging
2. Add soft delete functionality
3. Create dashboard aggregation queries
4. Add real-time updates (Socket.io)

### Week 5: File Import (If Needed)
1. Add file upload endpoint
2. Implement CSV/Excel parser
3. Validate imported data
4. Bulk insert with error handling

---

## Quick Start Commands

```bash
# 1. Set up database (if not done)
cd /home/ubuntu/Wings_AI/BuildSphere/database
npm install
npm run init
npm test

# 2. Create backend folder
cd /home/ubuntu/Wings_AI/BuildSphere
mkdir -p backend/{config,middleware,routes,controllers,utils}

# 3. Initialize backend
cd backend
npm init -y
npm install express mongoose dotenv bcrypt jsonwebtoken cors

# 4. Create basic server
# (I can help you create this next)
```

---

## Key Points About Current Implementation

### Strengths:
- All database schemas are complete and validated
- Indexes are optimized for queries
- Soft delete pattern implemented
- Relationships properly defined
- Timestamps automatic

### Missing:
- No backend API yet
- No date validation middleware
- No file import
- No authentication system
- No audit logging implementation
- No real-time updates

### Next Immediate Step:
**Create the backend API starting with authentication and basic CRUD operations.**

---

## Questions to Answer Before Proceeding

1. **Do you need file import (CSV/Excel)?**
   - If yes, I'll add it to the implementation
   - If no, we skip it

2. **Do you want me to create the backend structure now?**
   - I can create the complete Express backend
   - With authentication, CRUD, and date validation

3. **What's your priority?**
   - Get database working first (do this now)
   - Then build backend API
   - Then build frontend

Let me know and I'll create the next phase!
