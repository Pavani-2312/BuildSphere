# BuildSphere Database Setup

Complete MongoDB + Mongoose setup for the Weekly Report Management System.

## Quick Start

### 1. Install Dependencies
```bash
cd database
npm install
```

### 2. Set Up MongoDB Atlas (Free Cloud Database)

**Step 1: Create Account**
- Go to https://www.mongodb.com/cloud/atlas/register
- Sign up with email or Google

**Step 2: Create Cluster**
- Click "Build a Database"
- Choose "M0 Free" tier
- Select AWS as provider
- Choose region closest to you (e.g., Mumbai for India)
- Click "Create"

**Step 3: Create Database User**
- Go to "Database Access" (left sidebar)
- Click "Add New Database User"
- Username: `buildsphere_admin`
- Password: Click "Autogenerate Secure Password" and copy it
- Database User Privileges: "Atlas admin"
- Click "Add User"

**Step 4: Allow Network Access**
- Go to "Network Access" (left sidebar)
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (for development)
- Click "Confirm"

**Step 5: Get Connection String**
- Go to "Database" (left sidebar)
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string (looks like: `mongodb+srv://buildsphere_admin:<password>@cluster0.xxxxx.mongodb.net/`)

### 3. Configure Environment

Create a `.env` file in the `database` folder:

```bash
cp .env.example .env
nano .env
```

Add your connection details:
```
MONGODB_URI=mongodb+srv://buildsphere_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/bvrit_report_db
ADMIN_PASSWORD=YourSecurePassword123
```

Replace:
- `YOUR_PASSWORD` with the password you copied
- `cluster0.xxxxx` with your actual cluster address
- `YourSecurePassword123` with a strong password for the admin account

### 4. Initialize Database

```bash
npm run init
```

This will:
- Connect to MongoDB
- Create all collections with proper indexes
- Create default admin user
- Create a sample active week
- Initialize 17 section statuses

### 5. Verify Setup

```bash
npm test
```

Expected output:
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

All tests passed!
```

## Default Admin Credentials

- **Email:** `24wh1a05z1@bvrithyderabad.edu.in`
- **Password:** Set via `ADMIN_PASSWORD` in `.env` (default: `Admin@123`)

## Collections Created

1. **users** - System users (faculty, coordinators, admins)
2. **weeks** - Reporting weeks
3. **reportentries** - All section entries
4. **sectionstatuses** - Status tracking for 17 sections
5. **auditlogs** - Activity audit trail

## Mongoose Models

All models are in the `models/` folder:
- `User.js` - User schema with validation
- `Week.js` - Week schema with date validation
- `ReportEntry.js` - Entry schema with 17 section support
- `SectionStatus.js` - Section status tracking
- `AuditLog.js` - Audit trail schema

## Troubleshooting

**Error: MONGODB_URI not found**
- Make sure `.env` file exists in the `database` folder
- Check that `MONGODB_URI` is spelled correctly

**Error: Authentication failed**
- Verify your database username and password
- Make sure you replaced `<password>` in the connection string

**Error: Connection timeout**
- Check your internet connection
- Verify IP address is whitelisted in MongoDB Atlas Network Access
- Try "Allow Access from Anywhere" for testing

**Error: Duplicate key error**
- Database already initialized
- This is normal if you run `npm run init` multiple times

## Next Steps

After successful setup:
1. Use these models in your backend API
2. Import models: `const User = require('./database/models/User')`
3. All validation is built-in
4. Indexes are automatically created

## Local MongoDB (Alternative)

If you prefer local MongoDB instead of Atlas:

```bash
# Install MongoDB on Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Update .env
MONGODB_URI=mongodb://localhost:27017/bvrit_report_db
```
