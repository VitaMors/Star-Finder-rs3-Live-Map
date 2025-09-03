# GitHub Pages Deployment Guide

This guide will help you deploy the Star Finder RS3 Live Map to GitHub Pages.

## Prerequisites

1. Push this project to a GitHub repository named `Star-Finder-rs3-Live-Map`
2. Make sure you have the following files in your repository:
   - `.github/workflows/deploy.yml` (GitHub Actions workflow)
   - `web/` directory with all the React app files
   - Updated `vite.config.ts` with correct base path

## Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click on "Settings" tab
   - Scroll down to "Pages" section
   - Under "Source", select "GitHub Actions"

3. **Automatic Deployment:**
   - The GitHub Action will automatically trigger on every push to `main`
   - You can monitor the deployment progress in the "Actions" tab
   - Once complete, your site will be available at: `https://xavie.github.io/Star-Finder-rs3-Live-Map`

## Local Testing

To test the build locally before deploying:

```bash
cd web
npm install
npm run build
npm run preview
```

## Configuration Details

- **Base Path:** `/Star-Finder-rs3-Live-Map/` (matches repository name)
- **Build Output:** `web/dist/` directory
- **Assets:** All assets in `web/public/` are automatically included
- **Node Version:** 18.x (specified in GitHub Actions)

## Troubleshooting

- If deployment fails, check the Actions tab for error logs
- Ensure all file paths are relative (no hardcoded absolute paths)
- Verify that `RuneScape_Worldmap.png` is in the `web/public/` directory

## Live Features

The deployed version will include:
- ✅ Interactive RS3 World Map
- ✅ WebSocket connection for live star data (configurable)
- ✅ Local star reports system
- ✅ Responsive design for mobile and desktop
