/**
 * Cloudflare Pages Function: /api/weather
 * Cloudflare automatically routes requests to this file when deployed.
 */
import { fetchWeatherData } from '../../src/lib/weather-service';

export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const location = url.searchParams.get('location');
  const unitGroup = url.searchParams.get('unitGroup') || 'us';
  
  // Cloudflare stores secrets in the 'env' object
  const apiKey = env.VC_API || env.VISUAL_CROSSING_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'VISUAL_CROSSING_API_KEY or VC_API is not configured in Cloudflare.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!location) {
    return new Response(JSON.stringify({ error: 'Location is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await fetchWeatherData({
      location,
      unitGroup,
      apiKey
    });

    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Optional: helps if you call this from other domains
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
