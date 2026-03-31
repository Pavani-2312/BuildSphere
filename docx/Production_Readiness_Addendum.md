# Production Readiness Addendum
## Critical Updates to Implementation Plans

**Last Updated:** March 31, 2026

---

## 1. Database Changes

### 1.1 Schema Modifications

**`users` collection:**
- Replace `refreshToken` (String) with `refreshTokenVersion` (Number, default: 0)
- Increment version on logout to invalidate all tokens

**`report_entries` collection:**
- Remove denormalized fields: `enteredByName`, `enteredByRole`, `lastEditedByName`
- Add `version` (Number, default: 1) for optimistic locking
- Add indexes: `{ isDeleted: 1, createdAt: -1 }`, `{ createdAt: 1 }`

**New collection: `audit_logs_archive`**
- Same schema as `audit_logs`
- Stores logs older than 2 years
- Monthly archival via cron job

### 1.2 Connection Configuration

```javascript
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 50,           // Increased from 10
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
});
```

---

## 2. Backend Architecture Updates

### 2.1 New Dependencies

```json
{
  "ioredis": "^5.3.2",
  "bull": "^4.12.0",
  "express-validator": "^7.0.1",
  "helmet": "^7.1.0",
  "express-mongo-sanitize": "^2.2.0",
  "hpp": "^0.2.3",
  "csurf": "^1.11.0"
}
```

### 2.2 Project Structure Additions

```
backend/
├── queues/
│   ├── reportQueue.js          → Bull queue for PDF/DOCX generation
│   └── auditArchiveQueue.js    → Monthly audit log archival
├── jobs/
│   ├── reportWorker.js         → Processes report generation jobs
│   └── archivalWorker.js       → Processes audit archival
├── cache/
│   └── redis.js                → Redis client configuration
└── validators/
    └── request.validator.js    → Express-validator middleware
```

### 2.3 Redis Integration

**Purpose:** Session management, caching, rate limiting

**Cache Strategy:**
- Active week: TTL 5 minutes
- Section statuses: TTL 2 minutes
- User profiles: TTL 10 minutes
- Invalidate on write operations

**Implementation:**
```javascript
// cache/redis.js
const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000)
});
```


### 2.4 Queue System for Report Generation

**Problem:** Puppeteer launches browser per request - kills server under load

**Solution:** Bull queue with Redis backend

```javascript
// queues/reportQueue.js
const Queue = require('bull');
const reportQueue = new Queue('report-generation', {
  redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }
});

// Add job
reportQueue.add('generate-pdf', { weekId, department }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  timeout: 60000
});

// Worker processes jobs
reportQueue.process('generate-pdf', 2, async (job) => {
  return await pdfExporter.generatePDF(job.data);
});
```

**API Changes:**
- `GET /api/report/export/pdf` → Returns `{ jobId }` immediately
- `GET /api/report/status/:jobId` → Poll for completion
- `GET /api/report/download/:jobId` → Download when ready

---

## 3. Security Enhancements

### 3.1 Refresh Token Strategy

**Old:** Hashed token stored in DB
**New:** Token version counter

```javascript
// Generate refresh token with version
const refreshToken = jwt.sign(
  { id: user._id, version: user.refreshTokenVersion },
  JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);

// On logout: increment version to invalidate all tokens
await User.findByIdAndUpdate(userId, { $inc: { refreshTokenVersion: 1 } });
```

### 3.2 CSRF Protection

```javascript
// app.js
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Apply to state-changing routes
app.use('/api/entries', csrfProtection);
app.use('/api/weeks', csrfProtection);
app.use('/api/status', csrfProtection);

// Frontend must send CSRF token in headers
```

### 3.3 Input Sanitization

```javascript
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP parameter pollution
```

### 3.4 Socket.io Security

**Token Re-verification:**
```javascript
// Re-verify JWT every 5 minutes
setInterval(() => {
  socket.clients.forEach(client => {
    jwt.verify(client.token, JWT_ACCESS_SECRET, (err) => {
      if (err) client.disconnect();
    });
  });
}, 300000);
```

**Room Names:** Use hashed values instead of predictable patterns
```javascript
const roomName = crypto
  .createHash('sha256')
  .update(`${weekId}_${department}_${SECRET_SALT}`)
  .digest('hex');
```

---

## 4. API Response Standardization

### 4.1 Error Codes

```javascript
// utils/errorCodes.js
module.exports = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_003',
  WEEK_ALREADY_ACTIVE: 'WEEK_001',
  WEEK_SUBMITTED: 'WEEK_002',
  ENTRY_NOT_FOUND: 'ENTRY_001',
  ENTRY_VERSION_CONFLICT: 'ENTRY_002',
  VALIDATION_FAILED: 'VAL_001',
  RATE_LIMIT_EXCEEDED: 'RATE_001'
};
```

### 4.2 Response Format

```javascript
// Success
{
  "success": true,
  "data": { ... },
  "message": "Entry created successfully",
  "meta": {
    "timestamp": "2026-03-31T11:56:09.404Z",
    "requestId": "uuid-v4"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "ENTRY_VERSION_CONFLICT",
    "message": "Entry was modified by another user",
    "details": { "currentVersion": 3, "providedVersion": 2 }
  },
  "meta": {
    "timestamp": "2026-03-31T11:56:09.404Z",
    "requestId": "uuid-v4"
  }
}
```

---

## 5. Pagination Implementation

### 5.1 Cursor-Based Pagination

```javascript
// GET /api/entries?section=X&weekId=Y&cursor=Z&limit=20
async function getEntries(section, weekId, cursor, limit = 20) {
  const query = { section, weekId, isDeleted: false };
  
  if (cursor) {
    query._id = { $gt: cursor };
  }
  
  const entries = await ReportEntry.find(query)
    .sort({ _id: 1 })
    .limit(limit + 1);
  
  const hasMore = entries.length > limit;
  const results = hasMore ? entries.slice(0, -1) : entries;
  const nextCursor = hasMore ? results[results.length - 1]._id : null;
  
  return { entries: results, nextCursor, hasMore };
}
```

### 5.2 Response Format

```javascript
{
  "success": true,
  "data": {
    "entries": [...],
    "pagination": {
      "nextCursor": "507f1f77bcf86cd799439011",
      "hasMore": true,
      "limit": 20
    }
  }
}
```

---

## 6. Optimistic Locking

### 6.1 Entry Updates

```javascript
// PUT /api/entries/:id
async function updateEntry(entryId, data, version) {
  const result = await ReportEntry.findOneAndUpdate(
    { _id: entryId, version: version, isDeleted: false },
    { 
      $set: { data, lastEditedBy, lastEditedAt: Date.now() },
      $inc: { version: 1 }
    },
    { new: true }
  );
  
  if (!result) {
    throw new Error('ENTRY_VERSION_CONFLICT');
  }
  
  return result;
}
```

### 6.2 Frontend Handling

```javascript
// Store version with entry
const [entry, setEntry] = useState({ data: {}, version: 1 });

// Send version on update
await updateEntry(entryId, data, entry.version);

// On conflict, show merge dialog
```


---

## 7. Rate Limiting Enhancements

### 7.1 Redis-Based Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// Auth routes
const authLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: { code: 'RATE_001', message: 'Too many login attempts' } }
});

// Entry creation
const entryLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 60 * 1000,
  max: 30, // 30 entries per minute per user
  keyGenerator: (req) => req.user.id
});

app.use('/api/auth/login', authLimiter);
app.use('/api/entries', entryLimiter);
```

---

## 8. Database Transactions

### 8.1 Week Creation with Section Status Seeding

```javascript
async function createWeek(weekData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create week
    const [week] = await Week.create([weekData], { session });
    
    // Seed 17 section statuses
    const sectionStatuses = SECTIONS.map(section => ({
      weekId: week._id,
      department: week.department,
      section,
      status: 'pending',
      entryCount: 0
    }));
    
    await SectionStatus.insertMany(sectionStatuses, { session });
    
    await session.commitTransaction();
    return week;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### 8.2 Entry Creation with Status Update

```javascript
async function createEntry(entryData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const [entry] = await ReportEntry.create([entryData], { session });
    
    await SectionStatus.findOneAndUpdate(
      { weekId: entry.weekId, section: entry.section },
      { 
        $inc: { entryCount: 1 },
        $set: { 
          status: 'in_progress',
          lastUpdatedBy: entry.enteredBy,
          lastUpdatedAt: Date.now()
        }
      },
      { session }
    );
    
    await session.commitTransaction();
    return entry;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## 9. Monitoring & Logging

### 9.1 Structured Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.info('Entry created', { 
  userId: user.id, 
  entryId: entry._id, 
  section: entry.section 
});
```

### 9.2 Health Check Endpoint

```javascript
// routes/health.routes.js
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    services: {
      database: 'unknown',
      redis: 'unknown',
      queue: 'unknown'
    }
  };
  
  try {
    await mongoose.connection.db.admin().ping();
    health.services.database = 'healthy';
  } catch (err) {
    health.services.database = 'unhealthy';
    health.status = 'DEGRADED';
  }
  
  try {
    await redis.ping();
    health.services.redis = 'healthy';
  } catch (err) {
    health.services.redis = 'unhealthy';
    health.status = 'DEGRADED';
  }
  
  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### 9.3 Request ID Tracking

```javascript
const { v4: uuidv4 } = require('uuid');

app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Include in all logs and responses
logger.info('Request received', { requestId: req.id, path: req.path });
```

---

## 10. Environment Configuration

### 10.1 Updated .env Template

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bvrit_report_db
DB_NAME=bvrit_report_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRY=8h
JWT_REFRESH_EXPIRY=7d

# CORS
FRONTEND_URL=https://buildsphere.bvrit.ac.in

# Cookie
COOKIE_SECRET=your_cookie_secret_min_32_chars

# Security
SECRET_SALT=your_salt_for_hashing_min_32_chars

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Report Generation
INSTITUTION_NAME=BVRIT HYDERABAD College of Engineering for Women
INSTITUTION_LOGO_PATH=./assets/bvrit_logo.png
REPORT_QUEUE_CONCURRENCY=2

# Logging
LOG_LEVEL=info

# Monitoring
SENTRY_DSN=your_sentry_dsn_optional
```

---

## 11. Frontend Updates

### 11.1 React Query Integration

**Replace Context API for data fetching:**

```javascript
// Replace useEntries hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function useEntries(sectionName, weekId) {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['entries', sectionName, weekId],
    queryFn: () => entryService.getEntries(sectionName, weekId),
    staleTime: 30000
  });
  
  const addMutation = useMutation({
    mutationFn: (data) => entryService.createEntry(sectionName, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['entries', sectionName, weekId]);
    }
  });
  
  return {
    entries: data?.entries || [],
    isLoading,
    error,
    addEntry: addMutation.mutate
  };
}
```

### 11.2 Error Boundaries

```javascript
// components/common/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    logger.error('React error boundary caught', { error, errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 11.3 Form State Persistence

```javascript
// hooks/useFormPersist.js
function useFormPersist(formKey, initialValues) {
  const [values, setValues] = useState(() => {
    const saved = sessionStorage.getItem(formKey);
    return saved ? JSON.parse(saved) : initialValues;
  });
  
  useEffect(() => {
    sessionStorage.setItem(formKey, JSON.stringify(values));
  }, [values, formKey]);
  
  const clearPersisted = () => sessionStorage.removeItem(formKey);
  
  return [values, setValues, clearPersisted];
}
```

### 11.4 Optimistic Locking UI

```javascript
// Handle version conflicts
const handleUpdate = async (entryId, data, version) => {
  try {
    await updateEntry(entryId, data, version);
  } catch (error) {
    if (error.code === 'ENTRY_VERSION_CONFLICT') {
      // Show merge dialog
      setConflictData({
        local: data,
        remote: error.details.currentData,
        onResolve: (merged) => updateEntry(entryId, merged, error.details.currentVersion)
      });
    }
  }
};
```

### 11.5 Async Report Generation

```javascript
// Poll for report completion
const exportPDF = async () => {
  const { jobId } = await reportService.exportPDF();
  
  const pollInterval = setInterval(async () => {
    const status = await reportService.getJobStatus(jobId);
    
    if (status.state === 'completed') {
      clearInterval(pollInterval);
      window.location.href = `/api/report/download/${jobId}`;
    } else if (status.state === 'failed') {
      clearInterval(pollInterval);
      showError('Report generation failed');
    }
  }, 2000);
};
```

---

## 12. Deployment Checklist

### 12.1 Pre-Deployment

- [ ] All environment variables configured
- [ ] Redis instance provisioned and tested
- [ ] MongoDB Atlas cluster configured with proper indexes
- [ ] SSL certificates installed
- [ ] CORS whitelist updated with production domain
- [ ] Rate limiting thresholds reviewed
- [ ] Audit log archival cron job scheduled
- [ ] Health check endpoint tested
- [ ] Load balancer configured with health checks

### 12.2 Security Hardening

- [ ] Helmet configured with strict CSP
- [ ] CSRF protection enabled on all state-changing routes
- [ ] Input sanitization middleware applied
- [ ] JWT secrets rotated from defaults
- [ ] Database user has minimal required permissions
- [ ] Redis password authentication enabled
- [ ] Socket.io room names use hashed values
- [ ] File upload size limits enforced (if applicable)

### 12.3 Performance

- [ ] MongoDB connection pool size set to 50
- [ ] Redis caching enabled for active week and statuses
- [ ] Report generation moved to queue system
- [ ] Pagination implemented on all list endpoints
- [ ] Database indexes verified with explain plans
- [ ] Static assets served via CDN (if applicable)

### 12.4 Monitoring

- [ ] Winston logger configured for production
- [ ] Error tracking service integrated (Sentry/Rollbar)
- [ ] Health check endpoint monitored
- [ ] Database performance metrics tracked
- [ ] Redis memory usage monitored
- [ ] Queue job failure alerts configured

---

## 13. Migration Path

### 13.1 Database Migration Script

```javascript
// migrations/001_add_version_fields.js
async function up() {
  // Add version field to all entries
  await db.collection('report_entries').updateMany(
    { version: { $exists: false } },
    { $set: { version: 1 } }
  );
  
  // Remove denormalized name fields
  await db.collection('report_entries').updateMany(
    {},
    { $unset: { enteredByName: '', enteredByRole: '', lastEditedByName: '' } }
  );
  
  // Replace refreshToken with refreshTokenVersion
  await db.collection('users').updateMany(
    {},
    { $set: { refreshTokenVersion: 0 }, $unset: { refreshToken: '' } }
  );
  
  // Create audit_logs_archive collection
  await db.createCollection('audit_logs_archive');
}
```

### 13.2 Deployment Steps

1. **Backup database** - Full snapshot before migration
2. **Deploy Redis** - Provision and test connectivity
3. **Run migrations** - Execute database schema changes
4. **Deploy backend** - With feature flags for new functionality
5. **Deploy frontend** - With backward compatibility
6. **Enable new features** - Gradually via feature flags
7. **Monitor** - Watch error rates and performance metrics
8. **Rollback plan** - Keep previous version ready for 24 hours

---

## 14. Performance Benchmarks

### 14.1 Target Metrics

| Metric | Target | Critical Threshold |
|---|---|---|
| API response time (p95) | < 200ms | < 500ms |
| Report generation time | < 30s | < 60s |
| Database query time (p95) | < 50ms | < 100ms |
| Socket.io latency | < 100ms | < 300ms |
| Concurrent users | 100+ | 50 minimum |
| Uptime | 99.5% | 99% |

### 14.2 Load Testing

```bash
# Use Artillery for load testing
artillery quick --count 100 --num 50 https://api.buildsphere.bvrit.ac.in/health
```

---

## Summary of Changes

**Database:**
- Removed denormalized fields, added version control
- Audit log archival strategy (2-year retention)
- Increased connection pool to 50

**Backend:**
- Redis for caching and sessions
- Bull queue for report generation
- CSRF protection and input sanitization
- Optimistic locking for concurrent edits
- Cursor-based pagination
- Database transactions for multi-document operations
- Structured logging with Winston
- Health check endpoint

**Frontend:**
- React Query for data fetching (replaces Context API for data)
- Error boundaries
- Form state persistence in sessionStorage
- Conflict resolution UI for version conflicts
- Async report generation with polling

**Security:**
- Token version-based invalidation
- Hashed socket room names
- Enhanced rate limiting with Redis
- Request ID tracking

**Operations:**
- Comprehensive health checks
- Structured logging
- Migration scripts
- Deployment checklist
