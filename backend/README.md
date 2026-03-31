# Backend API for BuildSphere

Express.js REST API with MongoDB integration for BVRIT Weekly Reports system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB URI and secrets

4. Start server:
```bash
npm run dev
```

## API Endpoints

### Auth
- POST `/api/auth/login` - Login with email/password
- POST `/api/auth/google` - Google OAuth login

### Weeks
- GET `/api/weeks/active` - Get active week
- POST `/api/weeks` - Create new week (coordinator/admin)
- PATCH `/api/weeks/:id/submit` - Submit week (coordinator/admin)

### Entries
- GET `/api/entries?weekId=&section=` - Get entries
- POST `/api/entries` - Create entry
- DELETE `/api/entries/:id` - Delete entry

### Users
- GET `/api/users` - Get users
- POST `/api/users` - Create user (admin only)

## Models

Uses models from `../database/models/`:
- User
- Week
- ReportEntry
- SectionStatus
- AuditLog
