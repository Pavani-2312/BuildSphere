# Quick Setup Reference

## Installation Commands (Run in order)

```bash
# 1. Go to database folder
cd /home/ubuntu/Wings_AI/BuildSphere/database

# 2. Install dependencies
npm install

# 3. Create environment file
nano .env
```

## .env File Template

```
MONGODB_URI=mongodb+srv://buildsphere_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/bvrit_report_db?retryWrites=true&w=majority
ADMIN_PASSWORD=Admin@2026
```

Replace:
- `YOUR_PASSWORD` - from MongoDB Atlas user creation
- `cluster0.xxxxx` - from your connection string

## Run Scripts

```bash
# Initialize database (run once)
npm run init

# Test setup (verify everything works)
npm test
```

## MongoDB Atlas Quick Steps

1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create M0 FREE cluster
3. Create user: `buildsphere_admin` (save password)
4. Network Access: "Allow Access from Anywhere"
5. Get connection string from "Connect" button

## Default Admin Login

```
Email: admin@bvrithyderabad.edu.in
Password: [Your ADMIN_PASSWORD from .env]
```

## Verify Setup

Check in MongoDB Atlas:
- Database: `bvrit_report_db`
- Collections: users (1), weeks (1), sectionstatuses (17)

## Troubleshooting

| Error | Solution |
|-------|----------|
| MONGODB_URI not found | Create .env file in database folder |
| Authentication failed | Check password in .env matches Atlas |
| Connection timeout | Add IP to Network Access in Atlas |
| Duplicate key error | Database already initialized (OK) |
| npm not found | Install Node.js: `sudo apt install nodejs npm` |

## Import Models in Backend

```javascript
const User = require('./database/models/User');
const Week = require('./database/models/Week');
const ReportEntry = require('./database/models/ReportEntry');
const SectionStatus = require('./database/models/SectionStatus');
const AuditLog = require('./database/models/AuditLog');
```

## Connection in Backend

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'bvrit_report_db'
});
```

## What Got Created

- 5 Collections with indexes
- 1 Admin user (hashed password)
- 1 Active week for AIML
- 17 Section statuses (all pending)
- 5 Mongoose models ready to use
