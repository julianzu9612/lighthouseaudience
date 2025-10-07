# 🚀 Deployment Instructions

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from this directory**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? (select your account)
   - Link to existing project? **N**
   - What's your project's name? **lighthouse-audience-demo**
   - In which directory is your code located? **.**
   - Want to override the settings? **N**

4. **Production deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub + Vercel Dashboard

1. **Create new GitHub repository**
   - Go to https://github.com/new
   - Name: `lighthouse-audience-demo`
   - Keep it public or private
   - Don't initialize with README (already exists)

2. **Push code to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/lighthouse-audience-demo.git
   git branch -M main
   git push -u origin main
   ```

3. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click **Deploy**

## Alternative: Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

## Alternative: Deploy to GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. **Update vite.config.js** (add base path):
   ```js
   export default {
     base: '/lighthouse-audience-demo/',
     // ... rest of config
   }
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Source: Deploy from branch `gh-pages`

## File Size Notes

- **Total size**: ~45 MB (mostly video)
- **Video**: 43 MB (H.264 web-optimized)
- **Metadata**: 1.4 MB (54 tracked persons)
- **Crops**: 776 KB (54 person images)

All platforms support these file sizes in free tier.

## Environment Variables

No environment variables needed! This is a fully static demo.

## Post-Deployment

After deployment, your demo will be available at:
- **Vercel**: `https://lighthouse-audience-demo.vercel.app`
- **Netlify**: `https://lighthouse-audience-demo.netlify.app`
- **GitHub Pages**: `https://YOUR_USERNAME.github.io/lighthouse-audience-demo/`

## Troubleshooting

**Build fails on Vercel:**
- Ensure Node.js version is 18+ (set in Vercel dashboard)

**Assets not loading:**
- Check browser console for CORS errors
- Ensure all paths use relative URLs (starting with `/`)

**Video won't play:**
- Video is H.264 web-compatible
- Some browsers may require HTTPS (Vercel provides this automatically)
