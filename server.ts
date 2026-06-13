import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route to proxy Visual Crossing Weather API and SPC Mesoanalysis
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV || 'development', 
    hasKey: !!process.env.VISUAL_CROSSING_API_KEY,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/weather', async (req, res) => {
  const { location, unitGroup = 'us' } = req.query;
  const apiKey = process.env.VISUAL_CROSSING_API_KEY;

  console.log(`[Server] Weather request for: ${location}`);

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
    
    // Fetch Visual Crossing Data
    const vcUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(locStr)}?unitGroup=${uGroup}&key=${apiKey}&include=hours,days,current,alerts&elements=${elements}`;
    const vcResponse = await fetch(vcUrl);
    
    if (!vcResponse.ok) {
      const errorText = await vcResponse.text();
      console.error(`[Server] VC API Error: ${vcResponse.status} ${errorText}`);
      return res.status(vcResponse.status).json({ error: errorText || 'Failed to fetch weather data' });
    }

    const weatherData = await vcResponse.json();

    // SPC Supplemental Data (Best Effort)
    try {
      const lat = weatherData.latitude;
      const lon = weatherData.longitude;
      
      // SPC SOUNDING/MESO POINT URL (V7)
      const spcUrl = `https://www.spc.noaa.gov/exper/mesoanalysis/v7/get_sounding.php?lat=${lat}&lon=${lon}&sector=19`;
      console.log(`[Server] Fetching SPC proxy: ${spcUrl}`);
      
      const spcResponse = await fetch(spcUrl);
      if (spcResponse.ok) {
        const text = await spcResponse.text();
        
        // Very basic parsing of SPC text output
        // Example: MLCAPE: 1200 J/kg
        const mlcape = text.match(/MLCAPE:\s*(\d+)/i);
        const mlcin = text.match(/MLCIN:\s*(-?\d+)/i);
        const shear = text.match(/0-6km Bulk Shear:\s*(\d+)/i);
        const srh = text.match(/0-1km SRH:\s*(\d+)/i);

        if (weatherData.currentConditions) {
          if (mlcape) weatherData.currentConditions.cape = parseInt(mlcape[1]);
          if (mlcin) weatherData.currentConditions.cin = Math.abs(parseInt(mlcin[1])); // We show absolute inhibition
          if (shear) weatherData.currentConditions.shear = parseInt(shear[1]);
          if (srh) weatherData.currentConditions.srh = parseInt(srh[1]);
          weatherData.currentConditions._spc_live = true;
        }
      }
    } catch (spcErr) {
      console.warn('[Server] SPC Fetch Failed (Non-fatal):', spcErr);
    }

    res.json(weatherData);
  } catch (error) {
    console.error('[Server] Weather API Proxy Error:', error);
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
