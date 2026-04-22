# Deployment Guide: IEMS Backend to Render

## Overview
This guide covers deploying the Industrial Equipment Management System backend to Render.com, a modern cloud platform that supports Node.js applications and PostgreSQL databases.

## Prerequisites
- GitHub account (to push your code)
- Render account (free at https://render.com)
- Your project code pushed to GitHub

---

## Step 1: Prepare Your Project for Deployment

### 1.1 Create a GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add files to git
git add .

# Create initial commit
git commit -m "Initial commit: IEMS backend ready for deployment"

# Add your GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR-USERNAME/iems-backend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 1.2 Verify Files Are Created
Ensure these files exist in your project root:
- `.gitignore` - Excludes node_modules and .env
- `Procfile` - Tells Render how to start your app
- `package.json` - Contains all dependencies
- `.env.example` - Template for environment variables

---

## Step 2: Create a PostgreSQL Database on Render

### 2.1 Sign Up & Login to Render
1. Go to https://render.com
2. Sign up with GitHub (recommended for easier deployment)
3. Click "New +" in the top menu
4. Select "PostgreSQL"

### 2.2 Configure PostgreSQL Database
- **Name:** `iems-db` (or your choice)
- **Database:** `iems_db`
- **User:** `postgres` (or custom user)
- **Region:** Choose closest to you (e.g., `oregon`, `frankfurt`)
- **Plan:** Free tier (suitable for testing)

### 2.3 Save Connection Details
After creation, you'll see connection details like:
```
postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/iems_db
```
**Copy the full connection URL** — you'll need it later.

---

## Step 3: Deploy Web Service on Render

### 3.1 Create a New Web Service
1. In Render dashboard, click "New +" → "Web Service"
2. Select "Build and deploy from a Git repository"
3. Connect your GitHub account if not already done
4. Select your `iems-backend` repository

### 3.2 Configure Web Service
Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `iems-backend` |
| **Region** | Same as database (e.g., `oregon`) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm ci` |
| **Start Command** | `node src/server.js` |
| **Plan** | Free (suitable for testing) |

### 3.3 Add Environment Variables

Click "Advanced" → "Add Environment Variable" and add:

```
NODE_ENV = production
JWT_SECRET = your_very_secure_jwt_secret_here_min_32_chars
JWT_EXPIRES_IN = 7d

# Database connection (from Step 2.3)
DATABASE_URL = postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/iems_db
# OR use individual variables:
DB_HOST = YOUR_HOST
DB_PORT = 5432
DB_NAME = iems_db
DB_USER = postgres
DB_PASSWORD = YOUR_PASSWORD
```

⚠️ **Important:** Make sure your actual `.env` file is in `.gitignore` (it already is) so secrets aren't pushed to GitHub.

---

## Step 4: Update Your Code for Cloud Environment

### 4.1 Modify database.js to Use DATABASE_URL (Optional but Recommended)

If you want to support the `DATABASE_URL` environment variable format (which Render provides), update your [src/config/database.js](src/config/database.js):

```javascript
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || undefined,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'iems_db',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// ... rest of code
```

### 4.2 Enable Health Checks

Your health check endpoint is already available at `/api/v1/health`. Render can use this to verify your app is running.

In Render dashboard → "Health Check Path" → Set to `/api/v1/health`

---

## Step 5: Deploy & Monitor

### 5.1 Deploy
1. Once you've configured the web service, click **"Deploy"**
2. Render will:
   - Clone your GitHub repo
   - Run `npm ci` to install dependencies
   - Start your app with `node src/server.js`
   - Initialize your database schema automatically

### 5.2 Monitor Deployment
- Watch the "Logs" tab for any errors
- Deployment typically takes 2-5 minutes
- Once done, you'll see a public URL like: `https://iems-backend.onrender.com`

### 5.3 Test Your Deployment
```bash
# Health check
curl https://iems-backend.onrender.com/api/v1/health

# Expected response:
# {"status":"OK","service":"Industrial Equipment Management System","timestamp":"2026-04-22T..."}
```

---

## Step 6: Update Frontend URLs (If Separate)

If your frontend is deployed separately, update the API base URL:

In [files/js/api.js](files/js/api.js), change:
```javascript
const API_BASE = 'https://iems-backend.onrender.com/api/v1';
```

---

## Common Issues & Troubleshooting

### Issue: "Failed to connect to database"
- **Solution:** Double-check your `DATABASE_URL` or individual DB credentials in environment variables
- Make sure PostgreSQL database was successfully created on Render

### Issue: "Module not found" errors
- **Solution:** Ensure `npm ci` installs all dependencies from `package-lock.json`
- Delete `package-lock.json` locally, run `npm install`, commit, and push

### Issue: "PORT already in use"
- **Solution:** Render assigns a dynamic PORT. Update [src/server.js](src/server.js) to use:
```javascript
const PORT = process.env.PORT || 3000;
```
(Already implemented ✓)

### Issue: "Static files not serving"
- Your frontend files in [files/](files/) are already served by Express
- They're accessible at `https://iems-backend.onrender.com/`

### Issue: TimeZone issues
- Render uses UTC. Your PostgreSQL handles timestamp conversions (uses TIMESTAMPTZ)

---

## Scaling Up (Optional)

Once your app is working:

1. **Upgrade Plan:** Switch from Free to Starter ($7/month) for more stability
2. **Custom Domain:** Add your domain in Render settings
3. **SSL/TLS:** Automatic HTTPS for all Render domains
4. **Auto-Deploy:** Every push to `main` branch triggers new deployment

---

## Production Checklist

Before going live with real users:

- [ ] Change `JWT_SECRET` to a strong, unique value (minimum 32 characters)
- [ ] Update `CORS` policy in [src/app.js](src/app.js) for your actual domain
- [ ] Enable HTTPS only (automatic on Render)
- [ ] Add password hashing with `bcrypt` (Phase 2 TODO)
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Backup your PostgreSQL database regularly
- [ ] Review security headers in `helmet` configuration

---

## Quick Reference: Environment Variables for Production

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:secure_password@host:5432/iems_db
JWT_SECRET=your_super_secure_random_string_at_least_32_chars
JWT_EXPIRES_IN=7d
```

---

## Next Steps

1. Push your code to GitHub
2. Create PostgreSQL database on Render
3. Create Web Service on Render
4. Set environment variables
5. Deploy and monitor
6. Test API endpoints
7. Share the public URL!

For more help: https://render.com/docs

---

**Deployed URL:** `https://iems-backend.onrender.com`  
**API Documentation:** See [src/app.js](src/app.js) for available endpoints
