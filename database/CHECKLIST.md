# Setup Checklist

Copy this checklist and mark items as you complete them.

## Phase 1: MongoDB Atlas Setup

- [ ] Created MongoDB Atlas account at https://www.mongodb.com/cloud/atlas/register
- [ ] Created M0 FREE cluster (AWS, closest region)
- [ ] Created database user `buildsphere_admin`
- [ ] Saved the auto-generated password
- [ ] Added Network Access rule "Allow Access from Anywhere"
- [ ] Copied connection string from "Connect" button
- [ ] Saved connection string in a safe place

## Phase 2: Local Setup

- [ ] Navigated to database folder: `cd /home/ubuntu/Wings_AI/BuildSphere/database`
- [ ] Ran `npm install` successfully
- [ ] Created `.env` file with `nano .env`
- [ ] Added MONGODB_URI with actual password (no `<password>` placeholder)
- [ ] Added ADMIN_PASSWORD
- [ ] Saved .env file (Ctrl+X, Y, Enter)
- [ ] Verified .env with `cat .env`

## Phase 3: Database Initialization

- [ ] Ran `npm run init`
- [ ] Saw "Connected to MongoDB" message
- [ ] Saw "Admin user created" message
- [ ] Saw "Sample week created" message
- [ ] Saw "17 section statuses initialized" message
- [ ] Saw "Database initialization complete!" message

## Phase 4: Verification

- [ ] Ran `npm test`
- [ ] Test 1 (Admin User) passed
- [ ] Test 2 (Active Week) passed
- [ ] Test 3 (Section Statuses) passed - shows 17 sections
- [ ] Test 4 (Indexes) passed
- [ ] Saw "All tests passed!" message

## Phase 5: Visual Verification (Optional)

- [ ] Logged into MongoDB Atlas dashboard
- [ ] Clicked "Browse Collections"
- [ ] Saw database `bvrit_report_db`
- [ ] Saw collection `users` with 1 document
- [ ] Saw collection `weeks` with 1 document
- [ ] Saw collection `sectionstatuses` with 17 documents

## Phase 6: Security

- [ ] Added `.env` to `.gitignore`
- [ ] Verified .env is not tracked by git: `git status`
- [ ] Saved admin credentials in password manager
- [ ] Saved MongoDB Atlas login credentials

## Ready for Backend Development

- [ ] All models available in `database/models/` folder
- [ ] Connection string working
- [ ] Database initialized with sample data
- [ ] Ready to build backend API

---

## If Any Step Failed

Refer to:
- `COMPLETE_SETUP_GUIDE.md` - Full detailed instructions
- `QUICK_REFERENCE.md` - Quick commands and troubleshooting
- Part 5 of COMPLETE_SETUP_GUIDE.md - Common issues and solutions

## Next Steps After Completion

1. Start building backend API
2. Import models: `const User = require('./database/models/User')`
3. Connect to database in your server.js
4. Create API routes for CRUD operations
5. All validation is already built into the models
