# IEMS Deployment Architecture

## Development Setup (Current)

```
┌─────────────────────────────────────────────────────┐
│                 Your Computer                       │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Node.js Server (localhost:3000)             │  │
│  │  - Express API                               │  │
│  │  - Static Frontend Files                     │  │
│  └──────────────────────────────────────────────┘  │
│          ↕ Connects to                             │
│  ┌──────────────────────────────────────────────┐  │
│  │  PostgreSQL Database (localhost:5432)        │  │
│  │  - Equipment table                           │  │
│  │  - Maintenance table                         │  │
│  │  - Users table                               │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘

Access: http://localhost:3000
```

---

## Production Setup on Render (After Deployment)

```
┌──────────────────────────────────────────────────────────────┐
│                    RENDER.COM (Cloud)                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         WEB SERVICE (Node.js)                       │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  IEMS Backend Application                   │  │   │
│  │  │  ✓ Express API Server                       │  │   │
│  │  │  ✓ Static Frontend (HTML/CSS/JS)            │  │   │
│  │  │  ✓ Authentication (JWT)                     │  │   │
│  │  │  ✓ Auto-scaling & Load Balancing            │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Environment Variables (Secrets)                   │  │
│  │  ✓ DATABASE_URL                                   │  │
│  │  ✓ JWT_SECRET                                     │  │
│  │  ✓ NODE_ENV=production                            │  │
│  └─────────────────────────────────────────────────────┘   │
│           ↕ HTTPS Connection                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │    POSTGRESQL DATABASE                             │   │
│  │  ✓ Managed & Backed Up                             │   │
│  │  ✓ 99.9% Uptime SLA                                │   │
│  │  ✓ Automatic Updates & Patches                     │   │
│  │  ✓ Point-in-time Recovery                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
     ↑
     │ HTTPS (Port 443)
     │ Auto SSL Certificate
     │
┌────┴────────────────────────────────────────────────────────┐
│  Your Users on Internet                                     │
│  https://iems-backend.onrender.com                          │
│  GET  /api/v1/health                                        │
│  GET  /api/v1/machines                                      │
│  POST /api/v1/auth/login                                    │
│  etc.                                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### User Makes Request
```
User's Device
    ↓
Browser/App makes HTTPS request
    ↓
Render's Global CDN
    ↓
Web Service (Node.js Container)
    ↓
Express Routes
    ↓
Database Query (PostgreSQL)
    ↓
Query Result
    ↓
Response Back to User (JSON/HTML)
    ↓
Back to Browser/App (All via HTTPS)
```

---

## File Deployment Flow

```
1. Local Development
   ├── Edit code
   ├── Test locally (localhost:3000)
   └── Commit & push to GitHub
        ↓
2. GitHub Repository
   ├── Code stored & backed up
   └── Triggers webhook to Render
        ↓
3. Render Build Process
   ├── Git clone latest code
   ├── npm ci (install dependencies)
   ├── Build (if needed)
   └── Test connection to Database
        ↓
4. Render Deployment
   ├── Start Node.js process
   ├── Load environment variables
   ├── Initialize schema if needed
   └── Start accepting requests
        ↓
5. Live Application
   └── https://iems-backend.onrender.com
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────┐
│           Render Platform Security              │
├─────────────────────────────────────────────────┤
│  ✓ HTTPS/TLS Encryption (All Traffic)          │
│  ✓ DDoS Protection                              │
│  ✓ Firewall Rules                               │
│  ✓ Automatic Security Updates                   │
└─────────────────────────────────────────────────┘
                      ↓
        ┌─────────────────────────────┐
        │   Your Application          │
        ├─────────────────────────────┤
        │ ✓ helmet.js (Security)      │
        │ ✓ CORS (Cross-origin)       │
        │ ✓ JWT Tokens (Auth)         │
        │ ✓ Input Validation          │
        └─────────────────────────────┘
                      ↓
        ┌─────────────────────────────┐
        │   PostgreSQL Database       │
        ├─────────────────────────────┤
        │ ✓ Isolated Virtual Network  │
        │ ✓ SSL Connections Only      │
        │ ✓ Automatic Backups         │
        │ ✓ Point-in-time Recovery    │
        │ ✓ Encrypted Storage         │
        └─────────────────────────────┘
```

---

## Scaling Potential (As You Grow)

### Current Setup (Free Tier)
- ✓ Suitable for: Learning, testing, small projects
- ✓ Requests: ~1,000-5,000 per day
- ✓ Database: 256MB
- ✓ Uptime: 99%
- **Cost: $0/month**

### Starter Plan ($7/month)
- ✓ Better for: Production-ready apps
- ✓ Requests: ~100,000+ per day
- ✓ Database: 1GB
- ✓ Uptime: 99.9%
- ✓ Better performance & reliability
- **Cost: $7-14/month**

### Professional Plan ($25+/month)
- ✓ Enterprise features
- ✓ Backup management
- ✓ Advanced monitoring
- ✓ Higher resource limits
- **Cost: $25+/month**

---

## Performance Optimization Tips

```
┌────────────────────────────────────────┐
│  Optimization Strategy                 │
├────────────────────────────────────────┤
│  1. Database Indexing                  │
│     CREATE INDEX ON machines(id)       │
│                                        │
│  2. Connection Pooling                 │
│     Already configured (max: 10)       │
│                                        │
│  3. Response Caching                   │
│     Use headers: Cache-Control         │
│                                        │
│  4. API Pagination                     │
│     Limit results: ?limit=50&offset=0  │
│                                        │
│  5. Compress Responses                 │
│     gzip middleware                    │
│                                        │
│  6. CDN for Static Files               │
│     Render serves via CDN              │
│                                        │
│  7. Web Service Scaling                │
│     Auto-scales based on load          │
└────────────────────────────────────────┘
```

---

## Monitoring & Health Checks

### Render Monitors
```
Every 30 seconds:
  GET https://iems-backend.onrender.com/api/v1/health
  
Expected: 200 OK + JSON response
Failure: Render alerts & restarts service
```

### Your Dashboards
```
Render Dashboard
├── Logs (Real-time)
├── Metrics (CPU, Memory, Disk)
├── Events (Deployments, Restarts)
└── Outages & Performance

Third-party (Optional)
├── Sentry (Error tracking)
├── DataDog (Monitoring)
└── Newrelic (Performance)
```

---

## Disaster Recovery

```
Scenario: Database Corrupted
├── Render automatic backups (Daily)
├── Point-in-time recovery
└── Restore to specific date/time

Scenario: Application Crash
├── Render auto-restarts service
├── Failed request retries
├── Load balanced across instances
└── 99.9% uptime guarantee

Scenario: Deployment Issue
├── Fast rollback to previous version
├── Git history preserved
└── No data loss
```

---

## Environment Summary

### Local Development
```
└── Your Computer
    ├── Node.js (Express)
    ├── PostgreSQL (local)
    ├── Port: 3000
    └── URL: http://localhost:3000
```

### Production (Render)
```
└── render.com (Cloud)
    ├── Web Service (Node.js)
    ├── PostgreSQL (Managed)
    ├── Automatic HTTPS
    ├── Auto-scaling
    └── URL: https://iems-backend.onrender.com
```

---

## File Upload Flow (If Applicable)

```
User Uploads File
    ↓
Browser sends HTTPS POST
    ↓
Express Middleware validates
    ↓
File stored (currently in memory/local)
    ↓
For production: Consider cloud storage (AWS S3, etc)
    ↓
File metadata saved to database
    ↓
User receives success response
```

---

## Summary

| Aspect | Development | Production |
|--------|-------------|-----------|
| **Host** | Your Computer | Render.com |
| **Database** | PostgreSQL Local | PostgreSQL Managed |
| **Protocol** | HTTP | HTTPS (Auto) |
| **Uptime** | N/A | 99% (Free), 99.9%+ (Paid) |
| **Cost** | $0 | $0-50+/month |
| **Scaling** | Manual (your computer) | Automatic |
| **Backups** | Manual | Automatic Daily |
| **SSL Cert** | Self-signed/None | Auto-renewed |
| **Logs** | Local terminal | Render dashboard |

---

**Ready to deploy? Follow the 5 steps in README_DEPLOYMENT.md!**
