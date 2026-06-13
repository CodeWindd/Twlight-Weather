# Cloudflare Pages + GitHub Setup Guide

This project is configured to be deployed as a Full-Stack application on **Cloudflare Pages** via **GitHub**.

## 1. Push to GitHub
1. In AI Studio, click **Share / Export** and select **Export to GitHub**. 
2. Follow the prompts to push this code to a new or existing GitHub repository.

## 2. Deploy to Cloudflare Pages
1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages**.
2. Click **Create application** -> **Pages** -> **Connect to Git**.
3. Select the GitHub repository you just created.
4. In the **Set up builds and deployments** section, use the following settings:
   - **Framework preset**: `None` (or `Vite`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Expand the **Environment variables (advanced)** section and add:
   - Variable name: `VC_API` (or `VISUAL_CROSSING_API_KEY`)
   - Value: `<your-visual-crossing-api-key>`
6. Click **Save and Deploy**.

## How the Code Works
- **Frontend SPA**: Vite builds the React component code inside `/src` into static files in the `/dist` directory. Cloudflare Pages will serve these files directly from its CDN.
- **Backend API**: The `functions/api/weather.ts` file is a [Cloudflare Pages Function](https://developers.cloudflare.com/pages/functions/). Cloudflare automatically detects the `functions` folder and runs these files securely at the edge. The function is executed when the frontend makes a request to `/api/weather`.

*(Note: For the AI Studio preview environment, a local Express `server.ts` is running and mirroring the same `/api/weather` logic so you can test it before exporting).*
