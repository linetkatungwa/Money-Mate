# Money Mate - Deployment Guide

This guide covers deploying Money Mate to popular hosting platforms.

## Quick Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) - **RECOMMENDED**
- ✅ Free tier available
- ✅ Easy setup
- ✅ Automatic deployments from Git
- ✅ SSL certificates included

### Option 2: Netlify (Frontend) + Railway (Backend)
- ✅ Free tier available
- ✅ Simple configuration
- ✅ Good performance

### Option 3: Heroku (Full Stack)
- ✅ All-in-one solution
- ⚠️ No longer has free tier

---

## Prerequisites

1. **MongoDB Atlas** (Free tier available)
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a cluster
   - Get your connection string
   - Whitelist all IPs (0.0.0.0/0) for production

2. **GitHub Account**
   - Push your code to GitHub repository
   - Keep `.env` files in `.gitignore`

3. **Generate Strong JWT Secret**
   ```bash
   # Run in PowerShell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
   ```

---

## 🚀 OPTION 1: Vercel + Render (Recommended)

### Step 1: Deploy Backend to Render

1. **Sign up at https://render.com**

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing Money Mate

3. **Configure Backend Service**
   ```
   Name: money-mate-backend
   Root Directory: backend
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Build Command: npm install
   Start Command: node server.js
   Instance Type: Free
   ```

4. **Add Environment Variables**
   - Go to "Environment" tab
   - Add these variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_generated_secret
   FRONTEND_URL=https://your-app.vercel.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Copy the backend URL (e.g., `https://money-mate-backend.onrender.com`)

### Step 2: Deploy Frontend to Vercel

1. **Sign up at https://vercel.com**

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import from GitHub
   - Select your Money Mate repository

3. **Configure Frontend**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variable**
   - Add Environment Variable:
   ```
   VITE_API_URL=https://money-mate-backend.onrender.com/api
   ```
   (Use your actual Render backend URL)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

6. **Update Backend CORS**
   - Go back to Render
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Trigger redeploy

---

## 🚀 OPTION 2: Netlify + Railway

### Step 1: Deploy Backend to Railway

1. **Sign up at https://railway.app**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**
   - Railway will auto-detect Node.js
   - Set Root Directory: `backend`
   - Set Start Command: `node server.js`

4. **Add Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_generated_secret
   FRONTEND_URL=https://your-app.netlify.app
   ```

5. **Generate Domain**
   - Go to Settings → Generate Domain
   - Copy the URL

### Step 2: Deploy Frontend to Netlify

1. **Sign up at https://netlify.com**

2. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub
   - Select your repository

3. **Configure Build**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

4. **Add Environment Variable**
   - Go to Site settings → Environment variables
   - Add:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app/api
   ```

5. **Deploy**
   - Click "Deploy site"
   - Update Railway's `FRONTEND_URL` with Netlify URL
   - Redeploy Railway service

---

## 🚀 OPTION 3: Heroku (All-in-One)

### Backend Deployment

1. **Install Heroku CLI**
   ```powershell
   # Install via npm
   npm install -g heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd backend
   heroku create money-mate-backend
   ```

3. **Add Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="your_mongodb_connection_string"
   heroku config:set JWT_SECRET="your_secret"
   heroku config:set FRONTEND_URL="https://money-mate-frontend.herokuapp.com"
   ```

4. **Create Procfile**
   ```
   web: node server.js
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Frontend Deployment

1. **Create Frontend App**
   ```bash
   cd ../frontend
   heroku create money-mate-frontend
   ```

2. **Add Buildpack**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. **Update package.json**
   Add to frontend/package.json:
   ```json
   "scripts": {
     "build": "vite build",
     "start": "npm run preview"
   }
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy frontend"
   git push heroku main
   ```

---

## 📋 Post-Deployment Checklist

### Backend Verification
- [ ] Backend URL accessible
- [ ] `/api/auth/login` endpoint works
- [ ] MongoDB connection successful
- [ ] CORS configured for frontend domain

### Frontend Verification
- [ ] Frontend loads correctly
- [ ] API calls reach backend
- [ ] Login/Register works
- [ ] Dashboard loads data
- [ ] All features functional

### Security
- [ ] Environment variables set (not in code)
- [ ] JWT secret is strong and random
- [ ] MongoDB IP whitelist configured
- [ ] HTTPS enabled (automatic on Vercel/Render/Netlify)

---

## 🔧 Common Issues

### CORS Errors
**Problem**: Frontend can't reach backend
**Solution**: 
- Update `FRONTEND_URL` in backend environment variables
- Redeploy backend
- Check backend logs

### MongoDB Connection Failed
**Problem**: Can't connect to database
**Solution**:
- Check MongoDB Atlas IP whitelist (use 0.0.0.0/0 for all IPs)
- Verify connection string format
- Check MongoDB Atlas cluster is running

### API Calls Fail with 404
**Problem**: `/api/...` routes not found
**Solution**:
- Verify `VITE_API_URL` includes `/api` at the end
- Check backend routes are properly set up
- Verify backend is running

### Build Fails on Platform
**Problem**: Deployment build errors
**Solution**:
- Check Node version compatibility
- Verify all dependencies in package.json
- Check build logs for specific errors
- Try building locally first: `npm run build`

---

## 🔄 Continuous Deployment

All platforms support automatic deployments:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Automatic Deploy**
   - Vercel/Netlify/Render will automatically detect changes
   - Builds and deploys automatically
   - No manual intervention needed

---

## 💰 Cost Estimates

### Free Tier (Recommended for Testing)
- **MongoDB Atlas**: Free (512MB storage)
- **Vercel**: Free (100GB bandwidth)
- **Render**: Free (750 hours/month, sleeps after 15min inactivity)
- **Total**: $0/month

### Production (For Real Users)
- **MongoDB Atlas**: $0-$57/month (based on usage)
- **Vercel Pro**: $20/month (unlimited bandwidth)
- **Render**: $7-25/month (always-on instances)
- **Total**: ~$27-100/month

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Railway Docs**: https://docs.railway.app
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

## 🎯 Quick Start (Fastest Deploy)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/money-mate.git
git push -u origin main

# 2. Deploy Backend to Render (via web UI)
# 3. Deploy Frontend to Vercel (via web UI)
# 4. Update environment variables
# 5. Done! 🎉
```

Your Money Mate app will be live in under 15 minutes!
