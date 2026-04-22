# Render Cloud Deployment Checklist

## Pre-Deployment (20 minutes)

### Step 1: Initialize Git Repository
```bash
# In your project directory
git init
git add .
git commit -m "Initial commit: IEMS ready for Render deployment"

# Add your GitHub repository
git remote add origin https://github.com/YOUR-USERNAME/iems-backend.git
git branch -M main
git push -u origin main
```

### Step 2: Verify Essential Files
- ✅ `.gitignore` - Created (prevents pushing node_modules)
- ✅ `Procfile` - Created (tells Render how to start)
- ✅ `package.json` - Already exists with dependencies
- ✅ `.env.example` - Created (never commit real .env!)
- ✅ `render.yaml` - Created (optional deployment config)
- ✅ `DEPLOYMENT_GUIDE.md` - Created (full reference)

---

## Render Deployment Steps (15 minutes)

### Step 1: Create PostgreSQL Database
1. Go to https://render.com/dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Set:
   - **Name:** `iems-db`
   - **Database:** `iems_db`
   - **Plan:** Free tier
4. **Create** and copy the connection URL
   - Format: `postgresql://postgres:PASSWORD@HOST:5432/iems_db`

### Step 2: Deploy Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `iems-backend`
   - **Runtime:** Node
   - **Build Command:** `npm ci`
   - **Start Command:** `node src/server.js`
   - **Plan:** Free tier
4. Click **"Advanced"** and add environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *paste from Step 1* |
| `JWT_SECRET` | *generate random 32+ char string* |
| `JWT_EXPIRES_IN` | `7d` |

### Step 3: Deploy
- Click **"Create Web Service"**
- Watch the "Logs" tab (takes 2-5 minutes)
- Once complete, you'll see a public URL: `https://iems-backend.onrender.com`

### Step 4: Verify Deployment
```bash
# Test the health endpoint
curl https://iems-backend.onrender.com/api/v1/health

# Should return:
# {"status":"OK","service":"Industrial Equipment Management System",...}
```

---

## After Deployment

### Configure Custom Domain (Optional)
1. In Render dashboard → Your service → Settings
2. Check "Custom Domain" and add your domain (e.g., `api.mysite.com`)
3. Update DNS records as instructed

### Update Frontend URLs
If you have a separate frontend, update API base URL to:
```javascript
const API_BASE = 'https://iems-backend.onrender.com/api/v1';
```

### Monitor Your App
- **Logs:** View at any time in Render dashboard
- **Metrics:** Check CPU, memory, disk usage
- **Auto-Deploy:** Every push to `main` branch redeploys automatically

---

## Environment Variables Reference

### Required for Production
```
NODE_ENV=production
JWT_SECRET=randomly_generate_this_min_32_characters
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

### Optional (if not using DATABASE_URL)
```
DB_HOST=your-host.render.com
DB_PORT=5432
DB_NAME=iems_db
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## Available API Endpoints

Once deployed, use these endpoints:

```
GET  https://iems-backend.onrender.com/api/v1/health
GET  https://iems-backend.onrender.com/api/v1/machines
POST https://iems-backend.onrender.com/api/v1/machines
GET  https://iems-backend.onrender.com/api/v1/machines/:id
PATCH https://iems-backend.onrender.com/api/v1/machines/:id
DELETE https://iems-backend.onrender.com/api/v1/machines/:id

GET  https://iems-backend.onrender.com/api/v1/equipment
GET  https://iems-backend.onrender.com/api/v1/maintenance
GET  https://iems-backend.onrender.com/api/v1/auth
POST https://iems-backend.onrender.com/api/v1/auth/login
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Database connection fails | Check DATABASE_URL matches Render's connection string |
| Module not found | Run `npm ci` uses package-lock.json; rebuild on Render |
| "Cannot find module"errors | Delete node_modules locally, run `npm install`, commit |
| Port conflicts | Ensure using `process.env.PORT` (already in code ✓) |
| Slow deployment | Free tier has limited resources; upgrade plan if needed |
| Static files not loading | Files in `/files` should load; check file paths in HTML |

---

## Scaling / Upgrades

### When to Upgrade from Free Tier
- More than ~1,000 concurrent users
- Need better performance/uptime SLA
- Want automatic backups for database

### Recommended Free → Paid Path
1. **Web Service:** Starter ($7/month) - ~450/month requests
2. **PostgreSQL:** Starter ($7/month) - 10GB storage, backups

---

## Security Checklist

Before going live:

- [ ] `JWT_SECRET` is 32+ characters, randomly generated
- [ ] `.env` file is in `.gitignore` (never pushed)
- [ ] `NODE_ENV=production` in Render environment
- [ ] Database password is strong and unique
- [ ] HTTPS enabled (automatic with Render)
- [ ] CORS properly configured for your domain
- [ ] Error messages don't leak sensitive info
- [ ] Keep Node.js version updated

---

## Support & Resources

- **Render Docs:** https://render.com/docs
- **Node.js Guide:** https://render.com/docs/deploy-node-express
- **PostgreSQL Guide:** https://render.com/docs/databases
- **GitHub Issues:** Check for deployment errors

---

## Summary

| Step | Time | Status |
|------|------|--------|
| 1. Git setup & push code | 5 min | ⏳ TODO |
| 2. Create PostgreSQL DB | 3 min | ⏳ TODO |
| 3. Create Web Service | 5 min | ⏳ TODO |
| 4. Set environment vars | 2 min | ⏳ TODO |
| 5. Deploy & verify | 5 min | ⏳ TODO |
| **Total** | **20 min** | ⏳ TODO |

---

**Good luck! 🚀**
