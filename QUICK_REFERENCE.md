# Render Cloud Deployment - Reference Card

## 📋 Files Created for Deployment

✅ **Deployment Configuration**
- `.gitignore` - Excludes secrets from GitHub
- `Procfile` - Tells Render how to start your app
- `render.yaml` - Optional Render infrastructure config
- `.env.example` - Template for required environment variables

✅ **Code Updates**
- `src/config/cors.js` - Production-safe CORS settings
- `src/config/database.js` - Updated for Render's DATABASE_URL
- `src/app.js` - Updated to use new CORS config

✅ **Documentation**
- `README_DEPLOYMENT.md` - **START HERE** (5 steps, 20 min)
- `QUICK_DEPLOYMENT.md` - Step-by-step checklist
- `DEPLOYMENT_GUIDE.md` - Comprehensive reference
- `ARCHITECTURE.md` - Visual deployment architecture
- `QUICK_REFERENCE.md` - This file!

---

## 🎯 Your Next Steps (In Order)

### 1️⃣ Push Code to GitHub (5 min)
```bash
git init
git add .
git commit -m "Ready for Render deployment"
git remote add origin https://github.com/YOUR-USERNAME/iems-backend.git
git branch -M main
git push -u origin main
```

### 2️⃣ Create PostgreSQL on Render (3 min)
1. https://render.com/dashboard
2. Click "New +" → "PostgreSQL"
3. Name: `iems-db`
4. Create and **copy connection string**

### 3️⃣ Create Web Service (5 min)
1. Click "New +" → "Web Service"
2. Select your GitHub repo
3. Settings: name, build cmd, start cmd
4. Click "Advanced" → Add env vars:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = *[paste from Step 2]*
   - `JWT_SECRET` = *[generate random string]*
   - `JWT_EXPIRES_IN` = `7d`

### 4️⃣ Deploy (2 min)
- Click "Create Web Service"
- Wait 2-5 minutes
- Get public URL

### 5️⃣ Test (1 min)
```bash
curl https://iems-backend.onrender.com/api/v1/health
```

---

## 🔑 Environment Variables Quick Reference

| Variable | Value | Example |
|----------|-------|---------|
| `NODE_ENV` | `production` | *(fixed)* |
| `DATABASE_URL` | From Render DB | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | 32+ random chars | `a1b2c3d4e5f6...` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 Key URLs After Deployment

| URL | Purpose |
|-----|---------|
| `https://iems-backend.onrender.com` | Your API |
| `https://iems-backend.onrender.com/api/v1/health` | Check server |
| `https://render.com/dashboard` | Logs & monitoring |

---

## ✅ Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] PostgreSQL database created on Render
- [ ] Database connection string copied
- [ ] Environment variables added to Render
- [ ] Web service created
- [ ] Deployment completed without errors
- [ ] Health endpoint responds with 200 OK
- [ ] API endpoints callable

---

## ❌ Troubleshooting Quick Fixes

| Error | Fix |
|-------|-----|
| Database connection fails | Verify DATABASE_URL in environment variables |
| Module not found | Check Logs tab; rebuild if needed |
| 502 Bad Gateway | Wait 5 min, check health endpoint logs |
| Port binding error | Ensure `process.env.PORT` is used (already done ✓) |
| CORS errors | Update CORS origins in `src/config/cors.js` |
| Deployment stuck | Check GitHub repository is public |
| No logs showing | Check Logs tab in Render dashboard |

---

## 📊 Monitoring Commands

### Check Health
```bash
curl https://iems-backend.onrender.com/api/v1/health
```

### Create Test Machine
```bash
curl -X POST https://iems-backend.onrender.com/api/v1/machines \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Machine","type":"Pump"}'
```

### Get All Machines
```bash
curl https://iems-backend.onrender.com/api/v1/machines
```

---

## 💡 Pro Tips

1. **Keep MongoDB/PostgreSQL together** - Same region = faster, cheaper
2. **Monitor first week** - Check logs daily for issues
3. **Set up uptime monitor** - Use free tools like UptimeRobot
4. **Enable email alerts** - Get notified if service goes down
5. **Backup password** - Save DB password in secure location
6. **Test critical paths** - Verify most-used endpoints work
7. **Scale gradually** - Start on free tier, upgrade if needed

---

## 📞 Support Resources

| Resource | Link |
|----------|------|
| Render Docs | https://render.com/docs |
| Node.js Guide | https://render.com/docs/deploy-node-express |
| PostgreSQL Guide | https://render.com/docs/databases |
| Render Support | https://render.com/support |
| GitHub Issues | Create one if stuck |

---

## 🎓 Learning Resources

**After Deployment:**
- Read full [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Study [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Explore Render dashboard features
- Set up monitoring & alerts
- Plan upgrades for growth

---

## 📈 Cost Estimates (No Credit Card Required)

| Component | Free Tier | Starter | Notes |
|-----------|-----------|---------|-------|
| Web Service | $0 | $7/mo | Generous limits |
| PostgreSQL | $0 | $7/mo | 256MB free tier |
| **Total** | **$0** | **$14** | Everything you need |

---

## ✨ Deployment Success Indicators

✅ Deployment successful when:
- [ ] Build logs show "✓ Deployed"
- [ ] URL is `https://iems-backend.onrender.com`
- [ ] Health check returns `{"status":"OK",...}`
- [ ] API endpoints respond (not 502/503)
- [ ] Database queries work (no connection errors)
- [ ] Env variables are loaded (check logs)

---

## 🎉 Congratulations!

Once deployed, you have:
- ✅ Production-grade API server
- ✅ Automated database backups
- ✅ HTTPS encryption
- ✅ Global CDN
- ✅ 99% uptime guarantee
- ✅ Auto-scaling capability
- ✅ Zero additional DevOps effort

---

## 📝 Important: Changing Secrets Later

Once deployed, if you need to update `JWT_SECRET`:

1. In Render dashboard → Your service
2. Settings → Environment Variables
3. Edit `JWT_SECRET`
4. Save (service auto-restarts)
5. No code changes needed!

---

## 🔐 Security Checklist

Before production users:
- [ ] JWT_SECRET is 32+ characters
- [ ] .env file is NOT on GitHub
- [ ] Database password is strong
- [ ] HTTPS enforced (auto with Render)
- [ ] CORS origins restricted
- [ ] Error messages don't leak secrets
- [ ] Helmet.js enabled (✓ already)

---

## 📞 Emergency Contacts

- **Render Status:** https://status.render.com
- **Render Support:** https://render.com/support
- **Check Render Logs** first for any issues

---

## 🚀 Ready?

1. Read **README_DEPLOYMENT.md** (this folder)
2. Follow the **5 deployment steps**
3. Verify with **health check**
4. Done! Your app is live globally! 🌍

**Total time: 20 minutes**  
**Cost: $0**  
**Result: World-accessible API** ✨

---

Last updated: April 2026  
For latest info: https://render.com/docs
