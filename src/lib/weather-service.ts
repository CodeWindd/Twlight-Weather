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

  // Supplementary Data (replaces dead SPC get_sounding.php API)
  // We use Open-Meteo's HRRR (High Resolution Rapid Refresh) model which is the same model that
  // powers the modern SPC Mesoanalysis. This gives us accurate CAPE, and we can also fetch Lifted Index.
  try {
    const lat = weatherData.latitude;
    const lon = weatherData.longitude;
    const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cape,convective_inhibition,lifted_index,wind_speed_10m,wind_speed_500hPa,uv_index&models=best_match&forecast_days=14`;
    
    const omResponse = await fetch(omUrl);
    if (omResponse.ok) {
      const omData = await omResponse.json();
      
      if (weatherData.currentConditions && omData.hourly && omData.hourly.cape) {
        // Find the index for the current UTC hour, fallback to 0
        const currentHourISO = new Date().toISOString().substring(0, 14) + "00";
        let hourIndex = omData.hourly.time.indexOf(currentHourISO);
        if (hourIndex === -1) hourIndex = 0;

        // Current overrides
        weatherData.currentConditions.cape = Math.round(omData.hourly.cape[hourIndex]);
        if (omData.hourly.uv_index) {
          weatherData.currentConditions.uvindex = omData.hourly.uv_index[hourIndex];
        }
        
        if (omData.hourly.convective_inhibition) {
          weatherData.currentConditions.cin = Math.round(omData.hourly.convective_inhibition[hourIndex]);
        }
        
        if (omData.hourly.lifted_index) {
          weatherData.currentConditions.lifted_index = omData.hourly.lifted_index[hourIndex];
        }

        if (omData.hourly.wind_speed_10m && omData.hourly.wind_speed_500hPa) {
          // Approximate 0-6km bulk shear: 500hPa (~5.5km) wind speed minus 10m wind speed
          // Assuming roughly same direction for a scalar magnitude approximation (in km/h converted to knots)
          const sfcWind = omData.hourly.wind_speed_10m[hourIndex];
          const midWind = omData.hourly.wind_speed_500hPa[hourIndex];
          const shearKmh = Math.abs(midWind - sfcWind);
          const shearKnots = shearKmh * 0.539957; // km/h to knots
          weatherData.currentConditions.shear = Math.round(shearKnots);
        }
        
        weatherData.currentConditions._om_spc_proxy = true;

        // Hourly overrides
        if (omData.hourly.uv_index) {
           weatherData.days.forEach((day: any) => {
             if (day.hours) {
               day.hours.forEach((h: any) => {
                  // Find matching hour in OM data to override UV
                  const dateStr = new Date(h.datetimeEpoch * 1000).toISOString().substring(0, 14) + "00";
                  const hIdx = omData.hourly.time.indexOf(dateStr);
                  if (hIdx !== -1) {
                    h.uvindex = omData.hourly.uv_index[hIdx];
                  }
               });
             }
           });
        }
      }
    }
  } catch (omErr) {
    console.warn('[WeatherService] Open-Meteo HRRR fetch failed:', omErr);
  }

  return weatherData;
}
