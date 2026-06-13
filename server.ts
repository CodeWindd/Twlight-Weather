import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

import { fetchWeatherData } from './src/lib/weather-service';

const app = express();
const PORT = 3000;

app.use(express.json());

// API route to proxy Visual Crossing Weather API and SPC Mesoanalysis
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV || 'development', 
    hasKey: !!(process.env.VISUAL_CROSSING_API_KEY || process.env.VC_API),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/weather', async (req, res) => {
  const { location, unitGroup = 'us' } = req.query;
  const apiKey = process.env.VISUAL_CROSSING_API_KEY || process.env.VC_API;
  
  console.log(`[Server] Weather request for: ${location}`);

  if (!apiKey) {
    return res.status(500).json({ error: 'VISUAL_CROSSING_API_KEY or VC_API is not configured on the server.' });
  }

  if (!location) {
    return res.status(400).json({ error: 'Location is required.' });
  }

  try {
    const locStr = String(Array.isArray(location) ? location[0] : location);
    const uGroup = String(Array.isArray(unitGroup) ? unitGroup[0] : unitGroup);
    
    const weatherData = await fetchWeatherData({
      location: locStr,
      unitGroup: uGroup,
      apiKey: apiKey
    });

    res.json(weatherData);
  } catch (error: any) {
    console.error('[Server] Weather API Proxy Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

async function startServer() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Server] Initializing Vite middleware...');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Twilight Weather server listening on port ${PORT}`);
      console.log(`[Server] Mode: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
