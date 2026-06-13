import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route to proxy Visual Crossing Weather API
app.get('/api/weather', async (req, res) => {
  const { location, unitGroup = 'us' } = req.query;
  const apiKey = process.env.VISUAL_CROSSING_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'VISUAL_CROSSING_API_KEY is not configured on the server.' });
  }

  if (!location) {
    return res.status(400).json({ error: 'Location is required.' });
  }

  try {
    const elements = 'datetime,datetimeEpoch,temp,tempmax,tempmin,feelslike,humidity,dew,precip,precipprob,windspeed,windgust,winddir,pressure,visibility,cloudcover,uvindex,sunrise,sunset,conditions,icon,description,cape,cin,shear,severerisk';
    const locStr = String(Array.isArray(location) ? location[0] : location);
    const uGroup = String(Array.isArray(unitGroup) ? unitGroup[0] : unitGroup);
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(locStr)}?unitGroup=${uGroup}&key=${apiKey}&include=hours,days,current,alerts&elements=${elements}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText || 'Failed to fetch weather data' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Weather API Proxy Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`Twilight Weather server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
