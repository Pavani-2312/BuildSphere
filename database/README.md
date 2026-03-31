# Database Setup

## Prerequisites
- MongoDB Atlas account or local MongoDB instance
- Node.js installed

## Setup Steps

### 1. Install Dependencies
```bash
npm install mongodb bcrypt dotenv
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bvrit_report_db
ADMIN_PASSWORD=YourSecurePassword123
```

### 3. Run Initialization Script
```bash
node database/init.js
```

This will:
- Create all required indexes
- Create default admin account (admin@bvrithyderabad.edu.in)
- Create a sample active week for CSE(AI&ML) department
- Initialize 17 section statuses

## Collections Created

1. **users** - System users (faculty, coordinators, admins)
2. **weeks** - Reporting weeks
3. **report_entries** - All section entries
4. **section_status** - Status tracking for 17 sections
5. **audit_logs** - Activity audit trail

## Default Admin Credentials
- Email: `admin@bvrithyderabad.edu.in`
- Password: Set via `ADMIN_PASSWORD` env variable (default: Admin@123)

## Verify Setup
```bash
# Connect to MongoDB and verify
mongosh "<your-connection-string>"
use bvrit_report_db
show collections
db.users.findOne({ role: 'admin' })
```
