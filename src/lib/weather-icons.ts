export const getMeteoconUrl = (icon: string, isDay: boolean = true) => {
  const baseUrl = 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/';
  
  const mapping: Record<string, string> = {
    'clear-day': 'clear-day.svg',
    'clear-night': 'clear-night.svg',
    'cloudy': 'cloudy.svg',
    'fog': 'fog.svg',
    'hail': 'hail.svg',
    'partly-cloudy-day': 'partly-cloudy-day.svg',
    'partly-cloudy-night': 'partly-cloudy-night.svg',
    'rain-day': 'partly-cloudy-day-rain.svg',
    'rain-night': 'partly-cloudy-night-rain.svg',
    'rain': 'rain.svg',
    'showers-day': 'partly-cloudy-day-rain.svg',
    'showers-night': 'partly-cloudy-night-rain.svg',
    'showers': 'rain.svg',
    'sleet': 'sleet.svg',
    'snow-day': 'partly-cloudy-day-snow.svg',
    'snow-night': 'partly-cloudy-night-snow.svg',
    'snow': 'snow.svg',
    'thunder-rain': 'thunderstorms-rain.svg',
    'thunder-showers-day': 'thunderstorms-day-rain.svg',
    'thunder-showers-night': 'thunderstorms-night-rain.svg',
    'thunder': 'thunderstorms.svg',
    'wind': 'wind.svg',
  };

  // Visual Crossing icon names
  let target = mapping[icon] || 'not-available.svg';
  
  // Fallbacks if mapping fails
  if (target === 'not-available.svg') {
    if (icon.includes('clear')) target = isDay ? 'clear-day.svg' : 'clear-night.svg';
    else if (icon.includes('cloudy')) target = isDay ? 'partly-cloudy-day.svg' : 'partly-cloudy-night.svg';
    else if (icon.includes('rain')) target = 'rain.svg';
    else if (icon.includes('snow')) target = 'snow.svg';
    else if (icon.includes('fog')) target = 'fog.svg';
    else if (icon.includes('wind')) target = 'wind.svg';
    else if (icon.includes('lightning') || icon.includes('thunder')) target = 'thunderstorms.svg';
  }

  return baseUrl + target;
};

export const getMoonIcon = (phase: number) => {
  const baseUrl = 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/';
  let icon = 'moon-new.svg';
  let name = 'New Moon';

  if (phase === 0 || phase === 1) {
    icon = 'moon-new.svg';
    name = 'New Moon';
  } else if (phase > 0 && phase < 0.25) {
    icon = 'moon-waxing-crescent.svg';
    name = 'Waxing Crescent';
  } else if (phase === 0.25) {
    icon = 'moon-first-quarter.svg';
    name = 'First Quarter';
  } else if (phase > 0.25 && phase < 0.5) {
    icon = 'moon-waxing-gibbous.svg';
    name = 'Waxing Gibbous';
  } else if (phase === 0.5) {
    icon = 'moon-full.svg';
    name = 'Full Moon';
  } else if (phase > 0.5 && phase < 0.75) {
    icon = 'moon-waning-gibbous.svg';
    name = 'Waning Gibbous';
  } else if (phase === 0.75) {
    icon = 'moon-last-quarter.svg';
    name = 'Last Quarter';
  } else if (phase > 0.75 && phase < 1) {
    icon = 'moon-waning-crescent.svg';
    name = 'Waning Crescent';
  }

  return { url: baseUrl + icon, name };
};

export const UI_ICONS = {
  humidity: 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/humidity.svg',
  wind: 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/wind.svg',
  uv: 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/uv-index.svg',
  pressure: 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/barometer.svg',
  visibility: 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/fog.svg',
  thermometer: 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thermometer.svg',
  sunrise: 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/sunrise.svg',
  sunset: 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/sunset.svg',
  compass: 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/compass.svg',
  raindrop: 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/raindrop.svg',
  raindrops: 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/raindrops.svg',
  uv_levels: [
    'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/uv-index.svg',
    'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/uv-index-1.svg',
    'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/uv-index-2.svg',
    'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/uv-index-3.svg',
    'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/uv-index-4.svg',
    'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/uv-index-5.svg',
    'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/uv-index-6.svg',
    'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/uv-index-7.svg',
    'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/uv-index-8.svg',
    'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/uv-index-9.svg',
    'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/uv-index-10.svg',
    'https://cdn.meteocons.com/3.0.0-next.10/svg/fill/uv-index-11.svg'
  ]
};
