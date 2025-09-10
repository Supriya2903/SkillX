# 🚀 SkillX Deployment Guide

## Deploy to Vercel

### Prerequisites
1. **Cloud Database**: Set up MongoDB Atlas or another cloud database
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

### Step-by-Step Deployment

#### 1. Set Up MongoDB Atlas (Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use `0.0.0.0/0` for all IPs)
5. Get your connection string: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/skillswap`

#### 2. Deploy on Vercel
1. Visit [vercel.com](https://vercel.com) and login with GitHub
2. Click "New Project"
3. Import your repository: `https://github.com/Supriya2903/SkillX.git`
4. Configure the following environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (you can generate one at [this link](https://generate-secret.vercel.app/32))

#### 3. Environment Variables Setup
In Vercel dashboard:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillswap
JWT_SECRET=your-super-secure-jwt-secret-here
```

#### 4. Deploy
- Click "Deploy"
- Vercel will automatically build and deploy your app
- You'll get a live URL like: `https://skillx-yourname.vercel.app`

### Alternative: CLI Deployment
If you prefer using CLI:
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Post-Deployment
1. **Test all features**: Registration, login, skills matching, messaging, profile viewing
2. **Monitor**: Check Vercel dashboard for any deployment issues
3. **Update DNS**: If you have a custom domain, configure it in Vercel settings

### Troubleshooting
- **Database Connection Issues**: Ensure your MongoDB connection string is correct
- **Build Errors**: Check the build logs in Vercel dashboard
- **API Issues**: Verify all environment variables are set correctly
