# IEMS Deployment to Render - Quick Start

## What Was Prepared

Your project now has all the necessary files for cloud deployment:

```
✅ .gitignore           - Prevents committing secrets & node_modules
✅ Procfile             - Tells Render how to start your app
✅ render.yaml          - Optional Render config file
✅ .env.example         - Template for environment variables
✅ src/config/cors.js   - Production-safe CORS configuration
✅ Updated database.js  - Supports Render's DATABASE_URL
✅ DEPLOYMENT_GUIDE.md  - Comprehensive 20-step guide
✅ QUICK_DEPLOYMENT.md  - 20-minute deployment checklist
```

---

## 🚀 Deployment in 5 Steps (20 minutes)

### Step 1: Push to GitHub (5 minutes)
```bash
cd d:\ims

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Render deployment"

# Create GitHub repo at https://github.com/new

# Add remote & push
git remote add origin https://github.com/YOUR-USERNAME/iems-backend.git
git branch -M main
git push -u origin main
```

### Step 2: Create PostgreSQL Database (3 minutes)
1. Go to https://render.com/dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - Name: `iems-db`
   - Database: `iems_db`
   - Region: Your choice
   - Plan: **Free**
4. Click **Create Database**
5. **Copy the connection string** (starts with `postgresql://`)

### Step 3: Deploy Web Service (5 minutes)
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - Name: `iems-backend`
   - Build Command: `npm ci`
   - Start Command: `node src/server.js`
   - Runtime: Node
   - Plan: **Free**

### Step 4: Add Environment Variables (5 minutes)
Click **Advanced** and add:

```
NODE_ENV = production
DATABASE_URL = [paste from Step 2]
JWT_SECRET = [generate a random 32+ character string]
JWT_EXPIRES_IN = 7d
```

⭐ **Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Deploy (2 minutes)
1. Click **"Create Web Service"**
2. Wait for deployment (watch Logs tab)
3. Get your public URL: `https://iems-backend.onrender.com`

---

## ✅ Verify Deployment

```bash
# Test your API
curl https://iems-backend.onrender.com/api/v1/health

# Should return:
# {"status":"OK","service":"Industrial Equipment Management System","timestamp":"..."}
```

---

## 📊 Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | App mode (production/dev) | `production` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `JWT_SECRET` | Token signing key | 64-char random string |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `PORT` | Server port (auto-set) | `3000` |

---

## 🔧 API Endpoints (After Deployment)

Your API is now available at: `https://iems-backend.onrender.com`

#### Health Check
```bash
GET /api/v1/health
```

#### Machines
```bash
GET /api/v1/machines                    # List all
POST /api/v1/machines                   # Create
GET /api/v1/machines/:id                # Get one
PATCH /api/v1/machines/:id              # Update
DELETE /api/v1/machines/:id             # Delete
```

#### Equipment, Maintenance, Auth, Users
```bash
GET /api/v1/equipment
GET /api/v1/maintenance
POST /api/v1/auth/login
GET /api/v1/users
```

---

## 🔐 Security Notes

- **Never commit `.env` file** (it's in `.gitignore` ✓)
- **Keep JWT_SECRET safe** - it's used to sign authentication tokens
- **Use strong passwords** for database user
- **Enable HTTPS** (automatic with Render)
- **Restrict CORS** in production (already configured ✓)

---

## 📈 Monitoring Your Deployment

In Render Dashboard:

1. **Logs** - View real-time application logs
2. **Metrics** - Monitor CPU, memory, disk usage
3. **Events** - See deployment history
4. **Settings** - Update environment variables, add custom domain

### Example: Update JWT_SECRET in Production
1. Go to your web service in Render
2. Settings → Edit Environment Variables
3. Update `JWT_SECRET`
4. Service automatically redeploys

---

## 🌐 Custom Domain (Optional)

After deployment works:

1. In Render → Your service → Settings
2. Find "Custom Domain"
3. Add your domain (e.g., `api.mycompany.com`)
4. Update your DNS records as instructed
5. Render provides free SSL certificate

---

## 📝 Common Issues

| Issue | Fix |
|-------|-----|
| "Cannot connect to database" | Check DATABASE_URL in env vars |
| "Module not found" errors | Rebuild on Render (force redeploy) |
| "Internal server error" | Check Logs tab for error details |
| "Slow response" | Upgrade from Free tier |
| "SSL certificate error" | Wait 5-10 minutes for Render to issue cert |

---

## 🎯 Next Steps

### Immediate
- [ ] Push code to GitHub
- [ ] Create PostgreSQL database
- [ ] Deploy web service
- [ ] Test `/api/v1/health` endpoint

### Short Term (After Verification)
- [ ] Test all API endpoints
- [ ] Update frontend API URLs if separate
- [ ] Set up monitoring/alerts
- [ ] Test database backups

### Medium Term
- [ ] Add password hashing with `bcrypt`
- [ ] Set up error monitoring (Sentry)
- [ ] Configure custom domain
- [ ] Upgrade to paid plans if needed

---

## 📚 Further Reading

- **Full Guide:** Read [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Render Docs:** https://render.com/docs
- **Node.js on Render:** https://render.com/docs/deploy-node-express
- **PostgreSQL on Render:** https://render.com/docs/databases

---

## 💾 Project Files Structure

```
iems-backend/
├── src/
│   ├── app.js                   # Express app setup
│   ├── server.js                # Server entry point
│   ├── config/
│   │   ├── database.js          # DB config (Render-ready)
│   │   └── cors.js              # CORS for production
│   └── modules/                 # API routes
├── files/                       # Frontend static files
├── package.json                 # Dependencies
├── Procfile                     # Render start command ⭐
├── render.yaml                  # Optional Render config
├── .env.example                 # Environment template
├── .gitignore                   # Commit exclusions ⭐
└── DEPLOYMENT_GUIDE.md          # Full deployment steps
```

---

## 🎉 You're Ready to Deploy!

**Estimated Time:** 20 minutes  
**Cost:** $0 (Free tier)  
**Uptime:** 99%+ (even on free tier)

Follow the **5 steps above** and your app will be live on the internet! 🚀

---

## Support

- Check logs at any time in Render dashboard
- Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed steps
- Render support: https://render.com/support
- GitHub issues: Create one if you hit problems

**Happy deploying! 🌟**
