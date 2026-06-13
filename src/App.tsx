import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Map, 
  Clock, 
  AlertTriangle, 
  Droplets, 
  Settings as SettingsIcon,
  Navigation,
  Wind,
  Sun,
  Thermometer,
  Zap,
  Waves
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WeatherData, TabType } from './types';
import CurrentConditionsTab from './components/CurrentConditionsTab';
import Forecast14DayTab from './components/Forecast14DayTab';
import Hourly96Tab from './components/Hourly96Tab';
import SevereOutlooksTab from './components/SevereOutlooksTab';
import FloodRiskTab from './components/FloodRiskTab';
import SettingsTab from './components/SettingsTab';
import { cn } from './lib/utils';

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string>(() => localStorage.getItem('weather_location') || 'San Francisco, CA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localTime, setLocalTime] = useState<string>('--:--');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchWeather = async (loc: string) => {
    setLoading(true);
    setError(null);
    try {
      // Use relative fetch to avoid issues with sub-paths or proxies
      const response = await fetch('./api/weather?location=' + encodeURIComponent(loc));
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (response.status === 404) {
          throw new Error('Server API endpoint not found (404). This usually means the backend server is still booting up. Please wait 5 seconds and try again.');
        }
        const text = await response.text();
        console.error('[App] Non-JSON response:', text);
        throw new Error(`Server returned unexpected response (${response.status}).`);
      }

      const data = await response.json();
      if (data.error) {
        if (data.error.includes('VISUAL_CROSSING_API_KEY')) {
          throw new Error('Visual Crossing API Key is missing. Click the "Settings" (Gear icon) in the bottom-left sidebar of AI Studio, go to "Secrets", and add VISUAL_CROSSING_API_KEY.');
        }
        throw new Error(data.error);
      }
      setWeather(data);
      localStorage.setItem('weather_location', loc);
    } catch (err: any) {
      console.error('[App] Weather fetch error:', err);
      setError(err.message || 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, []);

  useEffect(() => {
    if (!weather) return;
    
    const updateClock = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        timeZone: weather.timezone,
        hour12: true 
      }));
    };

    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, [weather]);

  const tabs = [
    { id: 'current', label: 'Current', icon: Cloud },
    { id: 'forecast', label: '14-Day', icon: Navigation },
    { id: 'hourly', label: '96-Hour', icon: Clock },
    { id: 'severe', label: 'Severe', icon: Zap },
    { id: 'flood', label: 'Flood', icon: Waves },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const renderTabContent = () => {
    if (loading && !weather) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-400">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Cloud className="w-12 h-12" />
          </motion.div>
          <p className="mt-4 font-mono">Synchronizing with atmosphere...</p>
        </div>
      );
    }

    if (error && !weather) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-red-400 px-6 text-center">
          <AlertTriangle className="w-12 h-12 mb-4" />
          <h2 className="text-xl font-medium mb-2">Connection Error</h2>
          <p className="opacity-80 max-w-md">
            {error}
            {error.toLowerCase().includes('quota') && (
              <span className="block mt-4 text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                Hint: Visual Crossing API Daily Limit Reached. Check API Key in Settings.
              </span>
            )}
          </p>
          <button 
            onClick={() => fetchWeather(location)}
            className="mt-6 px-6 py-2 bg-zinc-800 rounded-full text-white hover:bg-zinc-700 transition-colors"
          >
            Retry Request
          </button>
        </div>
      );
    }

    if (!weather) return null;

    switch (activeTab) {
      case 'current': return <CurrentConditionsTab weather={weather} onUpdateLocation={(l) => { setLocation(l); fetchWeather(l); }} currentLocation={location} />;
      case 'forecast': return <Forecast14DayTab weather={weather} />;
      case 'hourly': return <Hourly96Tab weather={weather} />;
      case 'severe': return <SevereOutlooksTab />;
      case 'flood': return <FloodRiskTab />;
      case 'settings': return <SettingsTab currentLocation={location} onUpdateLocation={(l) => { setLocation(l); fetchWeather(l); }} />;
      default: return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white font-sans flex flex-col selection:bg-zinc-800 selection:text-white">
      {/* Header Section */}
      <header className="p-6 flex justify-between items-center border-b border-zinc-800 bg-black">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
            <Cloud className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">{weather?.address?.split(',')[0] || 'Twilight'}</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono">
              {weather?.resolvedAddress ? `Local: ${localTime}` : 'Detecting...'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          {weather?.alerts && weather.alerts.length > 0 && (
            <span className="hidden sm:inline-block px-3 py-1 bg-red-950/30 text-red-400 border border-red-900/50 text-[10px] font-bold rounded-full animate-pulse tracking-widest uppercase">
              Severe Weather Alert
            </span>
          )}
          {isOffline && (
            <span className="hidden sm:inline-block px-3 py-1 bg-orange-950/30 text-orange-400 border border-orange-900/50 text-[10px] font-bold rounded-full tracking-widest uppercase">
              Offline
            </span>
          )}
          <div className="text-right">
            <div className="text-2xl font-light tracking-tight">{weather ? `${Math.round(weather.currentConditions.temp)}°` : '--°'}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono line-clamp-1 max-w-[120px]">
              {isOffline ? 'Cached Data' : (weather?.currentConditions.conditions || 'Offline')}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tab Bar */}
      <nav className="px-6 py-3 flex space-x-1 bg-zinc-950 border-b border-zinc-900 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all shrink-0 border border-transparent",
              activeTab === tab.id 
                ? "bg-zinc-800 text-white border-zinc-700 shadow-sm" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Grid */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (weather?.resolvedAddress || '')}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Info Strip */}
      <footer className="px-6 py-4 border-t border-zinc-900 bg-zinc-950 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <div className={cn("w-2 h-2 rounded-full", isOffline ? "bg-orange-500" : (weather ? "bg-green-500" : "bg-red-500"))}></div>
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest leading-none">
              API: {isOffline ? 'Offline Mode' : (weather ? 'Visual Crossing Connected' : 'Disconnected')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest leading-none">
              Radar: {activeTab === 'severe' || activeTab === 'flood' ? 'Primary' : 'Background'}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-zinc-600 font-mono tracking-tighter uppercase">
          {weather 
            ? `LAT: ${weather.latitude.toFixed(4)}° // LON: ${weather.longitude.toFixed(4)}° // TZ: ${weather.timezone}`
            : 'POS: DETECTING COORDINATES...'
          }
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  );
}
