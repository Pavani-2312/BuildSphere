# Database Seeders

## Overview

Seed scripts to populate the database with test data for all 5 departments.

## Departments

- EEE
- ECE
- CSE
- AIML
- IT

## What Gets Seeded

### 1. Users (users.seed.js)
- 1 additional admin: admin2@bvrithyderabad.edu.in
- 5 coordinators (one per department)
- 10 faculty members (2 per department)

**Default Passwords:**
- Admin: Admin@123
- Coordinators: Coordinator@123
- Faculty: Faculty@123

### 2. Weeks (weeks.seed.js)
- 1 active week for each department (5 total)
- 2 past weeks for AIML (1 submitted, 1 archived)
- Each week has 17 section statuses initialized

### 3. Sample Entries (entries.seed.js)
- 10 sample report entries for AIML department
- Covers multiple sections: student achievements, placements, events, etc.
- Updates section statuses and entry counts

## Usage

### Run All Seeders
```bash
npm run seed
```

### Run Individual Seeders
```bash
# Seed users only
npm run seed:users

# Seed weeks only
npm run seed:weeks

# Seed sample entries only
npm run seed:entries
```

## Order of Execution

1. **users.seed.js** - Must run first (creates users)
2. **weeks.seed.js** - Must run second (needs admin user)
3. **entries.seed.js** - Must run last (needs users and weeks)

## What You'll Get

After running all seeders:

**Users:**
- 2 admins
- 5 coordinators
- 10 faculty members
- Total: 17 users

**Weeks:**
- 5 active weeks (one per department)
- 2 past weeks for AIML
- Total: 7 weeks

**Section Statuses:**
- 17 statuses × 7 weeks = 119 section status records

**Report Entries:**
- 10 sample entries for AIML department

## Testing the Database

After seeding, test with:
```bash
npm test
```

Or check in MongoDB Atlas:
- Browse Collections
- View users, weeks, reportentries, sectionstatuses

## Credentials for Testing

**Admins:**
- 24wh1a05z1@bvrithyderabad.edu.in / Admin@123
- admin2@bvrithyderabad.edu.in / Admin@123

**Coordinators:**
- coordinator.eee@bvrithyderabad.edu.in / Coordinator@123
- coordinator.ece@bvrithyderabad.edu.in / Coordinator@123
- coordinator.cse@bvrithyderabad.edu.in / Coordinator@123
- coordinator.aiml@bvrithyderabad.edu.in / Coordinator@123
- coordinator.it@bvrithyderabad.edu.in / Coordinator@123

**Faculty (AIML example):**
- faculty1.aiml@bvrithyderabad.edu.in / Faculty@123
- faculty2.aiml@bvrithyderabad.edu.in / Faculty@123

## Notes

- Seeders are idempotent (safe to run multiple times)
- Existing data won't be duplicated
- Use for development and testing only
- Don't run in production with real data
