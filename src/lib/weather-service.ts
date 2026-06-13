/**
 * Shared Weather Logic
 * This file contains the core logic for fetching weather from Visual Crossing
 * and supplemental data from SPC. It is designed to be portable for Express,
 * Cloudflare Functions, or Vercel Serverless.
 */

export interface WeatherParams {
  location: string;
  unitGroup?: string;
  apiKey: string;
}

export async function fetchWeatherData({ location, unitGroup = 'us', apiKey }: WeatherParams) {
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  const elements = 'datetime,datetimeEpoch,temp,tempmax,tempmin,feelslike,humidity,dew,precip,precipprob,windspeed,windgust,winddir,pressure,visibility,cloudcover,uvindex,sunrise,sunset,conditions,icon,description,cape,cin,shear,severerisk';
  
  const vcUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=${unitGroup}&key=${apiKey}&include=hours,days,current,alerts&elements=${elements}`;
  
  const vcResponse = await fetch(vcUrl);
  if (!vcResponse.ok) {
    const errorText = await vcResponse.text();
    throw new Error(errorText || 'Failed to fetch weather data');
  }

  const weatherData = await vcResponse.json();

  // SPC Supplemental Data
  try {
    const lat = weatherData.latitude;
    const lon = weatherData.longitude;
    const spcUrl = `https://www.spc.noaa.gov/exper/mesoanalysis/v7/get_sounding.php?lat=${lat}&lon=${lon}&sector=19`;
    
    const spcResponse = await fetch(spcUrl);
    if (spcResponse.ok) {
      const text = await spcResponse.text();
      const mlcape = text.match(/MLCAPE:\s*(\d+)/i);
      const mlcin = text.match(/MLCIN:\s*(-?\d+)/i);
      const shear = text.match(/0-6km Bulk Shear:\s*(\d+)/i);
      const srh = text.match(/0-1km SRH:\s*(\d+)/i);

      if (weatherData.currentConditions) {
        if (mlcape) weatherData.currentConditions.cape = parseInt(mlcape[1]);
        if (mlcin) weatherData.currentConditions.cin = Math.abs(parseInt(mlcin[1]));
        if (shear) weatherData.currentConditions.shear = parseInt(shear[1]);
        if (srh) weatherData.currentConditions.srh = parseInt(srh[1]);
        weatherData.currentConditions._spc_live = true;
      }
    }
  } catch (spcErr) {
    console.warn('[WeatherService] SPC Fetch Failed:', spcErr);
  }

  return weatherData;
}
