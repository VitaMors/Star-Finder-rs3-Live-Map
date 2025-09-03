# Deployment Guide

This guide covers deploying both the web frontend and Discord relay for the RS3 Star Finder.

## Prerequisites

- GitHub account
- Discord bot token and channel access
- Hosting account (Railway, Render, or Fly.io)

## 1. Deploy Discord Relay

### Option A: Railway (Recommended)

1. **Create Railway account** at https://railway.app
2. **Create new project** > Deploy from GitHub repo
3. **Select the `relay/` folder** as root directory
4. **Set environment variables:**
   - `DISCORD_TOKEN`: Your Discord bot token
   - `DISCORD_CHANNEL_IDS`: Channel ID(s) separated by commas
   - `PORT`: 8080 (or leave default)
5. **Deploy** - Railway will provide a URL like `https://your-app.railway.app`

### Option B: Render

1. **Create Render account** at https://render.com
2. **Create new Web Service** from GitHub
3. **Configure:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `relay`
4. **Add environment variables** in Render dashboard
5. **Deploy** - Render will provide a URL

### Option C: Fly.io

1. **Install flyctl** CLI tool
2. **Navigate to relay directory:**
   ```bash
   cd relay
   fly launch
   ```
3. **Set secrets:**
   ```bash
   fly secrets set DISCORD_TOKEN=your-token-here
   fly secrets set DISCORD_CHANNEL_IDS=your-channel-id
   ```
4. **Deploy:**
   ```bash
   fly deploy
   ```

## 2. Deploy Web Frontend

### GitHub Pages (Free)

1. **Update package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/rs3-stars"
   }
   ```

2. **Install gh-pages:**
   ```bash
   cd web
   npm install -D gh-pages
   ```

3. **Build and deploy:**
   ```bash
   npm run build
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Repository Settings > Pages
   - Source: Deploy from branch
   - Branch: `gh-pages`

### Alternative: Netlify

1. **Connect GitHub repo** to Netlify
2. **Configure build:**
   - Build command: `npm run build`
   - Publish directory: `web/dist`
   - Base directory: `web`
3. **Deploy**

### Alternative: Vercel

1. **Connect GitHub repo** to Vercel
2. **Configure:**
   - Framework: Vite
   - Root Directory: `web`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Deploy**

## 3. Connect Frontend to Relay

1. **Get relay WebSocket URL:**
   - Railway: `wss://your-app.railway.app`
   - Render: `wss://your-app.onrender.com` 
   - Fly.io: `wss://your-app.fly.dev`

2. **Update frontend:**
   - Open your deployed website
   - Paste the WebSocket URL in the connection field
   - Verify "Connected" status shows

## 4. Discord Bot Setup

1. **Create Discord Application:**
   - Go to https://discord.com/developers/applications
   - Create new application
   - Go to "Bot" section
   - Create bot and copy token

2. **Invite Bot to Server:**
   - Go to OAuth2 > URL Generator
   - Scopes: `bot`
   - Bot Permissions: `Read Messages`, `Read Message History`
   - Use generated URL to invite bot

3. **Get Channel ID:**
   - Enable Developer Mode in Discord settings
   - Right-click your announcement channel
   - "Copy ID"
   - Add to relay environment variables

## Testing

1. **Verify relay connection:**
   - Check relay logs for "Discord bot ready"
   - Test with a message in your Discord channel

2. **Verify frontend connection:**
   - Open browser developer tools
   - Look for WebSocket connection messages
   - Post a test announcement to see live updates

## Monitoring

- **Railway**: Built-in logs and metrics
- **Render**: Logs available in dashboard  
- **Fly.io**: Use `fly logs` command
- **Frontend**: Browser developer tools for WebSocket events

## Troubleshooting

### Relay Issues
- Check Discord token is valid
- Verify channel IDs are correct
- Ensure bot has message reading permissions

### Frontend Issues  
- Verify WebSocket URL is correct (wss:// not ws:// for HTTPS sites)
- Check CORS settings if connection fails
- Confirm relay is running and accessible

### Deployment Issues
- Check build logs for errors
- Verify all dependencies are in package.json
- Ensure environment variables are set correctly
