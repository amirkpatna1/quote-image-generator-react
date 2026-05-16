# Deployment Guide

Your Quote Image Generator React app is now ready to deploy to Vercel!

## Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli) installed (`npm install -g vercel`)
- GitHub, GitLab, or Bitbucket account (for Git-based deployments)
- Or deploy directly from your local machine using Vercel CLI

## Deployment Options

### Option 1: Deploy with Vercel CLI (Fastest)

```bash
# From your project directory
vercel

# This will:
# 1. Prompt you to log in/create a Vercel account
# 2. Link to your project
# 3. Set up preview and production deployments
# 4. Provide a live URL
```

### Option 2: Deploy via GitHub/GitLab (Recommended for Team)

#### Step 1: Create a GitHub Repository

```bash
# Create a new repository on GitHub (https://github.com/new)
# Then push your code:

git remote add origin https://github.com/yourusername/quote-image-generator-react.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Vercel

1. Visit [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Paste your GitHub repository URL
4. Vercel will automatically detect it's a Vite app
5. Click "Deploy"

### Option 3: Deploy from Vercel Dashboard

1. Log in to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

## Environment Variables

Add these in Vercel project settings → Environment Variables:

```
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_GOOGLE_FONTS_API_KEY=your_google_fonts_api_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_BUFFER_API_KEY=your_buffer_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Vercel Configuration

The `vercel.json` file is already configured with:
- **buildCommand**: `npm run build`
- **outputDirectory**: `dist` (Vite output)
- **rewrites**: SPA fallback to index.html for client-side routing

## Features Working on Vercel

✅ Quote generation and editing
✅ Background image selection (Picsum Photos / Unsplash)
✅ Style rendering (all 4 styles)
✅ MP4 video export with music
✅ Image export
✅ Audio muxing with ffmpeg.wasm (runs in browser)

## Performance Notes

- Quote image rendering: Client-side (fast)
- MP4 video building: Client-side with ffmpeg.wasm (3-5 minutes for large videos)
- Music generation: Uses browser AudioContext (instant)
- No backend required for core features

## Troubleshooting

**"Build failed" error**
- Check that `npm run build` works locally: `npm run build`
- Verify all dependencies are installed

**Environment variables not working**
- Make sure you added them in Vercel project settings (not in .env)
- Redeploy after adding variables

**Video export taking too long**
- ffmpeg.wasm runs in the browser, so it depends on user's CPU
- This is normal for large videos

**Functions exceed maximum duration**
- This app is purely frontend, so there are no duration limits

## Next Steps

After deployment:

1. **Get Your Live URL**: Vercel will provide a URL like `https://quote-generator-xyz.vercel.app`
2. **Test Core Features**: Try generating quotes and exporting MP4
3. **Share It**: Share your live app link with others
4. **Connect Python MCP Server** (Optional): If you want to integrate the Python MCP server for backend quote generation, you can set up an API proxy

## Future: Integrating Python MCP Server

If you want to use the Python MCP server for backend quote generation:

1. Deploy Python MCP to AWS Lambda + API Gateway
2. Update the frontend to call the Lambda API instead of using Gemini directly
3. This would allow server-side video generation with persistent storage

For now, the React app works fully standalone!

---

**Need help?** Check the main README.md or Vercel docs: https://vercel.com/docs
