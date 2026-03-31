# Complete MongoDB Setup Guide - Step by Step

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Node.js is installed (should be v16 or higher)
node --version

# Check npm is installed
npm --version

# If not installed, install Node.js:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Part 1: MongoDB Atlas Setup (Cloud Database - FREE)

### Step 1: Create MongoDB Atlas Account

1. Open your web browser
2. Go to: https://www.mongodb.com/cloud/atlas/register
3. You have 3 options to sign up:
   - Sign up with Google (fastest)
   - Sign up with email and password
   - Sign up with GitHub
4. Choose one and complete registration
5. Verify your email if prompted

### Step 2: Create a Free Cluster

1. After login, you'll see the Atlas dashboard
2. Click the green button "Create" or "Build a Database"
3. You'll see 3 pricing tiers:
   - **M0 (FREE)** - Select this one
   - M10 (Paid)
   - M30 (Paid)
4. Click "Create" under M0 FREE

5. Configure your cluster:
   
   **Cloud Provider & Region:**
   - Provider: Select "AWS" (recommended)
   - Region: Choose closest to your location:
     * For India: "Mumbai (ap-south-1)"
     * For US: "N. Virginia (us-east-1)"
     * For Europe: "Ireland (eu-west-1)"
   
   **Cluster Tier:**
   - Leave as "M0 Sandbox" (Free Forever)
   
   **Cluster Name:**
   - You can keep "Cluster0" or change to "BuildSphere"
   
6. Click "Create Deployment" button at the bottom
7. Wait 3-5 minutes while cluster is being created
8. You'll see a loading screen - don't close the browser

### Step 3: Create Database User (IMPORTANT)

1. A popup will appear: "Security Quickstart"
2. If popup doesn't appear, click "Database Access" in left sidebar

**Create User:**
1. You'll see "How would you like to authenticate your connection?"
2. Choose "Username and Password"
3. Fill in the form:
   - Username: `buildsphere_admin`
   - Password: Click "Autogenerate Secure Password" button
   - **CRITICAL**: A password will be generated. Click "Copy" button
   - **SAVE THIS PASSWORD** - paste it in a text file temporarily
   
4. Database User Privileges:
   - Select "Built-in Role"
   - Choose "Atlas admin" from dropdown
   
5. Click "Create User" button

### Step 4: Setup Network Access

1. Still in the popup, or click "Network Access" in left sidebar
2. Click "Add IP Address" button
3. You'll see a dialog with options:
   
   **For Development (Choose this):**
   - Click "Allow Access from Anywhere"
   - This adds IP: 0.0.0.0/0
   - Click "Confirm"
   
   **For Production (Later):**
   - Click "Add Current IP Address"
   - Or manually enter your server IP
   
4. Wait 1-2 minutes for the rule to activate
5. Status will change from "Pending" to "Active"

### Step 5: Get Connection String

1. Click "Database" in the left sidebar
2. You'll see your cluster (Cluster0 or BuildSphere)
3. Click the "Connect" button
4. Choose "Connect your application"
5. You'll see:
   - Driver: Node.js
   - Version: 5.5 or later
6. Copy the connection string shown:

```
mongodb+srv://buildsphere_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **SAVE THIS STRING** - you'll need it in the next part

**Important Notes:**
- The `<password>` part is a placeholder
- The `cluster0.xxxxx` will be your actual cluster address
- Example: `cluster0.ab1cd.mongodb.net`

---

## Part 2: Local Project Setup

### Step 1: Navigate to Database Folder

```bash
cd /home/ubuntu/Wings_AI/BuildSphere/database
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

This will install:
- `mongoose@8.2.0` - MongoDB object modeling tool
- `bcrypt@5.1.1` - Password hashing library
- `dotenv@16.4.5` - Environment variable loader

You should see output like:
```
added 50 packages, and audited 51 packages in 5s
```

### Step 3: Create Environment Configuration File

```bash
nano .env
```

This opens a text editor. Type or paste the following:

```
MONGODB_URI=mongodb+srv://buildsphere_admin:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/bvrit_report_db?retryWrites=true&w=majority
ADMIN_PASSWORD=Admin@2026
```

**Now replace the placeholders:**

1. Replace `YOUR_ACTUAL_PASSWORD` with the password you copied in Part 1, Step 3
2. Replace `cluster0.xxxxx` with your actual cluster address from Part 1, Step 5
3. You can change `Admin@2026` to any secure password you want

**Example of completed .env file:**
```
MONGODB_URI=mongodb+srv://buildsphere_admin:Xy9kL2mP4nQ8@cluster0.ab1cd.mongodb.net/bvrit_report_db?retryWrites=true&w=majority
ADMIN_PASSWORD=MySecurePass123!
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y` (for yes)
- Press `Enter`

### Step 4: Verify .env File Was Created

```bash
cat .env
```

You should see your configuration printed. Make sure:
- No `<password>` placeholder remains
- No spaces around the `=` sign
- Connection string is on one line

### Step 5: Initialize the Database

```bash
npm run init
```

**What this does:**
1. Connects to MongoDB Atlas
2. Creates database: `bvrit_report_db`
3. Creates 5 collections with indexes
4. Creates admin user with hashed password
5. Creates a sample active week
6. Creates 17 section status records

**Expected Output:**

```
Connected to MongoDB
Admin user created
  Email: admin@bvrithyderabad.edu.in
  Password: Admin@2026
Sample week created
  Week: Week 5 - March 2026
  Department: CSE(AI&ML)
17 section statuses initialized

Database initialization complete!

Collections created:
  - users
  - weeks
  - reportentries
  - sectionstatuses
  - auditlogs

Connection closed
```

**If you see this, SUCCESS! Your database is ready.**

### Step 6: Verify Setup with Test Script

```bash
npm test
```

**Expected Output:**

```
Connected to MongoDB

Test 1 - Admin User:
  Name: System Administrator
  Email: admin@bvrithyderabad.edu.in
  Role: admin
  Status: PASS

Test 2 - Active Week:
  Label: Week 5 - March 2026
  Department: CSE(AI&ML)
  Start: Sun Mar 29 2026
  End: Sat Apr 04 2026
  Status: PASS

Test 3 - Section Statuses:
  Count: 17
  Expected: 17
  Status: PASS

  Sections:
    - general_points: pending (0 entries)
    - faculty_joined_relieved: pending (0 entries)
    - faculty_achievements: pending (0 entries)
    - student_achievements: pending (0 entries)
    - department_achievements: pending (0 entries)
    - faculty_events_conducted: pending (0 entries)
    - student_events_conducted: pending (0 entries)
    - non_technical_events: pending (0 entries)
    - industry_college_visits: pending (0 entries)
    - hackathon_participation: pending (0 entries)
    - faculty_fdp_certifications: pending (0 entries)
    - faculty_visits: pending (0 entries)
    - patents_published: pending (0 entries)
    - vedic_programs: pending (0 entries)
    - placements: pending (0 entries)
    - mous_signed: pending (0 entries)
    - skill_development_programs: pending (0 entries)

Test 4 - Indexes:
  User indexes: 3
  Week indexes: 4
  Status: PASS

All tests passed!
```

---

## Part 3: Verify in MongoDB Atlas Dashboard

### View Your Data in the Browser

1. Go back to MongoDB Atlas: https://cloud.mongodb.com
2. Click "Database" in left sidebar
3. Click "Browse Collections" button on your cluster
4. You should see:
   - Database: `bvrit_report_db`
   - Collections: users, weeks, reportentries, sectionstatuses, auditlogs

5. Click on "users" collection
6. You should see 1 document (the admin user)
7. Click on "weeks" collection
8. You should see 1 document (the active week)
9. Click on "sectionstatuses" collection
10. You should see 17 documents (one for each section)

---

## Part 4: Understanding What Was Created

### Database Structure

```
bvrit_report_db/
├── users (1 document)
│   └── Admin user with hashed password
├── weeks (1 document)
│   └── Active week for CSE(AI&ML) department
├── reportentries (0 documents)
│   └── Empty, ready for report data
├── sectionstatuses (17 documents)
│   └── One status record for each of 17 sections
└── auditlogs (0 documents)
    └── Empty, ready for audit trail
```

### Mongoose Models Created

Located in `/home/ubuntu/Wings_AI/BuildSphere/database/models/`:

1. **User.js** - User schema
   - Fields: name, email, password, role, department, etc.
   - Validations: email format, role enum, required fields
   - Indexes: email (unique), role+department

2. **Week.js** - Week schema
   - Fields: weekLabel, startDate, endDate, department, status
   - Validations: endDate > startDate, status enum
   - Indexes: department+status (unique for active), startDate

3. **ReportEntry.js** - Entry schema
   - Fields: weekId, section, data, enteredBy, isDeleted
   - Validations: section enum (17 sections)
   - Indexes: weekId+section+isDeleted, weekId+department

4. **SectionStatus.js** - Status schema
   - Fields: weekId, section, status, entryCount
   - Validations: status enum (pending/in_progress/complete)
   - Indexes: weekId+department+section (unique)

5. **AuditLog.js** - Audit schema
   - Fields: action, performedBy, targetCollection, timestamp
   - Validations: action enum
   - Indexes: weekId+timestamp, performedBy+timestamp

### Default Admin Credentials

```
Email: admin@bvrithyderabad.edu.in
Password: [Whatever you set in ADMIN_PASSWORD in .env]
```

Use these to login to your application once backend is built.

---

## Part 5: Common Issues and Solutions

### Issue 1: "MONGODB_URI not found in .env file"

**Cause:** .env file doesn't exist or is in wrong location

**Solution:**
```bash
# Check if .env exists
ls -la /home/ubuntu/Wings_AI/BuildSphere/database/.env

# If not found, create it
cd /home/ubuntu/Wings_AI/BuildSphere/database
nano .env
# Add your configuration and save
```

### Issue 2: "Authentication failed"

**Cause:** Wrong password in connection string

**Solution:**
1. Go to MongoDB Atlas
2. Click "Database Access"
3. Find your user `buildsphere_admin`
4. Click "Edit"
5. Click "Edit Password"
6. Generate new password
7. Copy it and update .env file

### Issue 3: "Connection timeout" or "ETIMEDOUT"

**Cause:** IP address not whitelisted

**Solution:**
1. Go to MongoDB Atlas
2. Click "Network Access"
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere"
5. Wait 2 minutes for it to activate
6. Try again

### Issue 4: "MongoServerError: E11000 duplicate key error"

**Cause:** Database already initialized

**Solution:**
This is normal if you run `npm run init` twice. Your database is already set up. You can:
- Ignore this error, or
- Drop the database and reinitialize:

```bash
# Connect to MongoDB and drop database
mongosh "your-connection-string"
use bvrit_report_db
db.dropDatabase()
exit

# Then run init again
npm run init
```

### Issue 5: "Cannot find module 'mongoose'"

**Cause:** Dependencies not installed

**Solution:**
```bash
cd /home/ubuntu/Wings_AI/BuildSphere/database
npm install
```

### Issue 6: "npm: command not found"

**Cause:** Node.js not installed

**Solution:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

---

## Part 6: Next Steps - Using the Database

### In Your Backend API

```javascript
// Import models
const User = require('./database/models/User');
const Week = require('./database/models/Week');
const ReportEntry = require('./database/models/ReportEntry');
const SectionStatus = require('./database/models/SectionStatus');
const AuditLog = require('./database/models/AuditLog');

// Connect to database (in your server.js or app.js)
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'bvrit_report_db'
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Connection error:', err));

// Example: Find active week
const activeWeek = await Week.findOne({ 
  department: 'CSE(AI&ML)', 
  status: 'active' 
});

// Example: Create new entry
const entry = await ReportEntry.create({
  weekId: activeWeek._id,
  department: 'CSE(AI&ML)',
  section: 'student_achievements',
  data: {
    studentName: 'John Doe',
    rollNumber: '22WH1A6601',
    achievementDetails: 'Won first prize in hackathon',
    date: new Date()
  },
  enteredBy: userId,
  enteredByName: 'Faculty Name',
  enteredByRole: 'faculty'
});

// Example: Get all entries for a section
const entries = await ReportEntry.find({
  weekId: activeWeek._id,
  section: 'student_achievements',
  isDeleted: false
}).sort({ createdAt: -1 });

// Example: Update section status
await SectionStatus.findOneAndUpdate(
  { weekId: activeWeek._id, section: 'student_achievements' },
  { 
    status: 'in_progress',
    entryCount: entries.length,
    lastUpdatedBy: userId,
    lastUpdatedByName: 'Faculty Name',
    lastUpdatedAt: new Date()
  }
);
```

### Validation is Automatic

All these validations happen automatically:
- Email format checking
- Required fields
- Enum values (role must be faculty/coordinator/admin)
- Date validations (endDate > startDate)
- Unique constraints (one active week per department)

---

## Summary of Commands

```bash
# 1. Navigate to database folder
cd /home/ubuntu/Wings_AI/BuildSphere/database

# 2. Install dependencies
npm install

# 3. Create .env file
nano .env
# Add MONGODB_URI and ADMIN_PASSWORD, then save

# 4. Initialize database
npm run init

# 5. Test setup
npm test

# 6. View files
ls -la models/
```

---

## Files Created

```
database/
├── models/
│   ├── User.js              (Mongoose schema for users)
│   ├── Week.js              (Mongoose schema for weeks)
│   ├── ReportEntry.js       (Mongoose schema for entries)
│   ├── SectionStatus.js     (Mongoose schema for statuses)
│   └── AuditLog.js          (Mongoose schema for audit logs)
├── init.js                  (Database initialization script)
├── test.js                  (Verification test script)
├── package.json             (Dependencies configuration)
├── .env                     (Your environment variables - DO NOT COMMIT)
├── .env.example             (Template for .env)
└── README.md                (Documentation)
```

---

## Security Notes

1. **Never commit .env file to Git**
   ```bash
   # Add to .gitignore
   echo ".env" >> /home/ubuntu/Wings_AI/BuildSphere/.gitignore
   ```

2. **Use strong passwords**
   - Admin password should be complex
   - Database user password is auto-generated (good)

3. **Restrict IP access in production**
   - Change from "Allow Access from Anywhere"
   - Add only your server's IP address

4. **Rotate passwords regularly**
   - Change admin password every 90 days
   - Update .env file accordingly

---

Your database is now fully set up and ready to use!
