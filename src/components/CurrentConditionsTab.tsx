import React, { useState } from 'react';
import { 
  Wind, 
  Droplets, 
  Thermometer, 
  AlertCircle,
  TrendingUp,
  Search,
  MapPin,
  History,
  ShieldCheck,
  Moon,
  Sun,
  Zap,
  Activity
} from 'lucide-react';
import { WeatherData } from '../types';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { getMeteoconUrl, UI_ICONS, getMoonIcon } from '../lib/weather-icons';

interface CurrentConditionsTabProps {
  weather: WeatherData;
  currentLocation: string;
  onUpdateLocation: (newLocation: string) => void;
}

const MoonPhase = ({ phase }: { phase: number }) => {
  const { url, name } = getMoonIcon(phase);
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Moon Phase</span>
        <Moon className="w-3 h-3 text-zinc-600" />
      </div>
      <div className="flex flex-col items-center justify-center py-2">
        <img src={url} alt={name} className="w-16 h-16" />
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-2">{name}</span>
      </div>
      <div className="text-[8px] text-zinc-600 font-mono uppercase tracking-tighter text-center">
        Cycle: {Math.round(phase * 100)}%
      </div>
    </div>
  );
};

const UVGraph = ({ uvindex }: { uvindex: number }) => {
  const getUVLevel = (uv: number) => {
    if (uv <= 2) return { label: 'Low', color: 'text-green-500', bg: 'bg-green-500' };
    if (uv <= 5) return { label: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    if (uv <= 7) return { label: 'High', color: 'text-orange-500', bg: 'bg-orange-500' };
    if (uv <= 10) return { label: 'Very High', color: 'text-red-500', bg: 'bg-red-500' };
    return { label: 'Extreme', color: 'text-purple-500', bg: 'bg-purple-500' };
  };

  const level = getUVLevel(uvindex);
  const iconIdx = Math.min(Math.floor(uvindex), UI_ICONS.uv_levels.length - 1);

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">UV Radiation</span>
          <span className="text-[7px] text-zinc-700 font-mono uppercase tracking-widest mt-0.5">Solar Sensor Active</span>
        </div>
        <Sun className="w-3 h-3 text-zinc-600" />
      </div>
      <div className="flex flex-col items-center py-2">
        <img src={UI_ICONS.uv_levels[iconIdx]} alt="UV Index" className="w-16 h-16" />
        <div className="text-center mt-1">
          <span className="text-3xl font-bold font-mono text-white">{uvindex}</span>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${level.color}`}>{level.label}</p>
        </div>
      </div>
      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-auto">
        <div 
          className={`h-full ${level.bg} transition-all duration-1000`} 
          style={{ width: `${Math.min((uvindex/12)*100, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const CapeMeter = ({ cape, temp, dew, pressure, isSpcLive }: { cape?: number, temp: number, dew: number, pressure: number, isSpcLive?: boolean }) => {
  /**
   * Refined SB-CAPE Heuristic
   */
  const calculateHeuristicCape = () => {
    const tempC = (temp - 32) * (5/9);
    const dewC = (dew - 32) * (5/9);
    if (tempC < 15 || dewC < 10) return 0;
    
    // Lifting Condensation Level (LCL) estimate
    const lclM = 125 * (tempC - dewC);
    
    let integratedBuoyancy = 0;
    const dz = 250;
    
    for (let z = 0; z <= 12000; z += dz) {
      const tEnv = tempC - (6.5 * (z/1000));
      let tParcel;
      if (z <= lclM) {
        tParcel = tempC - (9.8 * (z/1000));
      } else {
        const lapse = z < 5000 ? 6.0 : 5.0;
        tParcel = (tempC - (9.8 * (lclM/1000))) - (lapse * ((z - lclM)/1000));
      }
      
      const buoyancy = tParcel - tEnv;
      if (buoyancy > 0) {
        const g = 9.8;
        const TeK = tEnv + 273.15;
        integratedBuoyancy += g * (buoyancy / TeK) * dz;
      }
    }
    
    const pressFactor = Math.max(0.5, 1 + (1013 - pressure) / 100);
    const finalValue = Math.round(integratedBuoyancy * pressFactor);
    return Math.max(0, finalValue);
  };

  const value = (cape !== undefined && cape !== null) ? cape : calculateHeuristicCape();
  
  const getLevel = (v: number) => {
    if (v < 500) return { label: 'Stable/Inhibited', color: 'text-zinc-600', bg: 'bg-zinc-800' };
    if (v < 1500) return { label: 'Moderate Instability', color: 'text-yellow-600', bg: 'bg-yellow-600' };
    if (v < 2500) return { label: 'Strong Ascent Potential', color: 'text-orange-500', bg: 'bg-orange-500' };
    return { label: 'Extreme Severe Threat', color: 'text-red-500', bg: 'bg-red-500' };
  };
  const level = getLevel(value);
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Convective Energy</span>
            {isSpcLive && <span className="text-[6px] px-1 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-sm font-mono font-bold tracking-tighter">LIVE SPC</span>}
          </div>
          <span className="text-[7px] text-zinc-700 font-mono uppercase tracking-widest mt-0.5">SPC Mesoanalysis Proxy</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${value > 250 ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`}></div>
          <Zap className={`w-3 h-3 ${value > 1000 ? 'text-yellow-500' : 'text-zinc-600'}`} />
        </div>
      </div>
      <div className="flex flex-col items-center py-2">
        <div className="text-4xl font-bold font-mono tracking-tighter text-white">{value}</div>
        <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">J/kg CAPE</div>
        <div className={`mt-2 text-[8px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm bg-black/40 ${level.color}`}>{level.label}</div>
      </div>
      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-auto">
        <div className={`h-full ${level.bg} transition-all duration-1000 ease-out`} style={{ width: `${Math.min((value/4000)*100, 100)}%` }}></div>
      </div>
    </div>
  );
};

const CinMeter = ({ cin, temp, dew, isSpcLive, pressure }: { cin?: number, temp: number, dew: number, isSpcLive?: boolean, pressure: number }) => {
  /**
   * Convective Inhibition (CIN) Heuristic
   */
  const calculateHeuristicCin = () => {
    const dewSpread = Math.max(0, temp - dew);
    const baseCin = dewSpread * 25; 
    const pressInhibition = Math.max(0, (pressure - 1013) * 12);
    return Math.round(baseCin + pressInhibition);
  };

  const value = (cin !== undefined && cin !== null) ? Math.abs(cin) : calculateHeuristicCin();
  
  const getLevel = (v: number) => {
    if (v < 25) return { label: 'Uncapped', color: 'text-emerald-500', bg: 'bg-emerald-600' };
    if (v < 100) return { label: 'Weak MLCIN', color: 'text-blue-500', bg: 'bg-blue-600' };
    return { label: 'Strong Cap', color: 'text-zinc-500', bg: 'bg-zinc-700' };
  };
  const level = getLevel(value);
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Convective Inhibition</span>
            {isSpcLive && <span className="text-[6px] px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded-sm font-mono font-bold tracking-tighter">LIVE SPC</span>}
          </div>
          <span className="text-[7px] text-zinc-700 font-mono uppercase tracking-widest mt-0.5">Atmospheric Cap | MLCIN</span>
        </div>
        <AlertCircle className={`w-3 h-3 ${value > 100 ? 'text-blue-500' : 'text-zinc-600'}`} />
      </div>
      <div className="flex flex-col items-center py-2">
        <div className="text-4xl font-bold font-mono tracking-tighter text-white">{value}</div>
        <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">J/kg MLCIN</div>
        <div className={`mt-2 text-[8px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm bg-black/40 ${level.color}`}>{level.label}</div>
      </div>
      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-auto">
        <div className={`h-full ${level.bg} transition-all duration-1000 ease-out`} style={{ width: `${Math.min((value/250)*100, 100)}%` }}></div>
      </div>
    </div>
  );
};


const ShearMeter = ({ shear, srh, windspeed, windgust, pressure, isSpcLive }: { shear?: number, srh?: number, windspeed: number, windgust: number, pressure: number, isSpcLive?: boolean }) => {
  /**
   * Refined 0-6km Bulk Shear Proxy
   */
  const calculateHeuristicShear = () => {
    const baseShear = windspeed * 2.0;
    const gustBuffer = Math.max(0, windgust - windspeed) * 2.8;
    const pressCorr = Math.max(0, 1013 - pressure) * 1.2;
    
    return Math.round(baseShear + gustBuffer + pressCorr);
  };

  const value = (shear !== undefined && shear !== null) ? shear : calculateHeuristicShear();
  
  const getLevel = (v: number) => {
    if (v < 25) return { label: 'Disorganized Flow', color: 'text-zinc-600', bg: 'bg-zinc-800' };
    if (v < 45) return { label: 'Moderate Shear', color: 'text-blue-500', bg: 'bg-blue-500' };
    if (v < 65) return { label: 'Severe Kinematics', color: 'text-purple-400', bg: 'bg-purple-600' };
    return { label: 'Extreme Kinematics', color: 'text-purple-500', bg: 'bg-purple-600' };
  };
  const level = getLevel(value);
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Deep Layer Shear</span>
            {isSpcLive && <span className="text-[6px] px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded-sm font-mono font-bold tracking-tighter">LIVE SPC</span>}
          </div>
          <span className="text-[7px] text-zinc-700 font-mono uppercase tracking-widest mt-0.5">0-6km Kinematic Profile</span>
        </div>
        <Activity className="w-3 h-3 text-zinc-600" />
      </div>
      <div className="flex flex-col items-center py-2 relative">
        <div className="text-4xl font-bold font-mono tracking-tighter text-white">{value}</div>
        <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">KNOTS (0-6KM)</div>
        {srh !== undefined && (
          <div className="absolute top-1 right-0 text-[7px] font-mono text-zinc-600 uppercase">
             SRH: <span className="text-zinc-400">{srh}</span>
          </div>
        )}
        <div className={`mt-2 text-[8px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm bg-black/40 ${level.color}`}>{level.label}</div>
      </div>
      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-auto">
        <div className={`h-full ${level.bg} transition-all duration-1000 ease-out`} style={{ width: `${Math.min((value/80)*100, 100)}%` }}></div>
      </div>
    </div>
  );
};


export default function CurrentConditionsTab({ weather, currentLocation, onUpdateLocation }: CurrentConditionsTabProps) {
  const current = weather.currentConditions;
  const today = weather.days[0];
  const [searchInput, setSearchInput] = useState(currentLocation);
  const [recentLocations] = useState<string[]>(() => {
    const saved = localStorage.getItem('weather_recent_locations');
    return saved ? JSON.parse(saved) : [currentLocation];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onUpdateLocation(searchInput.trim());
      const newRecent = [searchInput.trim(), ...recentLocations.filter(l => l !== searchInput.trim())].slice(0, 5);
      localStorage.setItem('weather_recent_locations', JSON.stringify(newRecent));
    }
  };

  const formatTimeAMPM = (timeStr: string, includeMinutes: boolean = false) => {
    if (!timeStr) return '--:--';
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return includeMinutes ? `${displayHour}:${minute} ${ampm}` : `${displayHour} ${ampm}`;
  };

  const allHours = weather.days.flatMap(d => d.hours);
  const nowEpoch = current.datetimeEpoch;
  const rolling24 = allHours
    .filter(h => h.datetimeEpoch >= nowEpoch - 3500) // Include current hour more reliably
    .slice(0, 24);

  const hourlyData = rolling24.map(h => ({
    time: formatTimeAMPM(h.datetime),
    temp: h.temp,
    humidity: h.humidity,
    uv: h.uvindex,
    dew: h.dew,
    severerisk: h.severerisk || 0
  }));

  // Create dynamic X-Axis labels based on rolling 24h data
  const timelineLabels = [0, 6, 12, 18, 23].map(idx => {
    if (rolling24[idx]) return formatTimeAMPM(rolling24[idx].datetime);
    return '--';
  });

  // Determine if it's day or night for the icon
  const isDay = current.icon.includes('day') || (!current.icon.includes('night') && current.datetimeEpoch > current.sunrise.split(':').reduce((acc, time) => acc * 60 + +time, 0) * 60);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* Location Search Bar */}
      <div className="md:col-span-12 mb-2">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search city signature..."
            className="w-full bg-[#1a1a1a] border border-zinc-800 focus:border-zinc-500 py-5 pl-14 pr-6 rounded-[2rem] text-lg font-light tracking-tight focus:outline-none transition-all placeholder:text-zinc-700"
          />
          <button 
            type="submit"
            className="absolute inset-y-2.5 right-2.5 px-6 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all text-white border border-zinc-700"
          >
            Update
          </button>
        </form>
        
        {/* Quick History Chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar px-2 pb-2">
          {recentLocations.map((loc, idx) => (
            <button
              key={idx}
              onClick={() => { setSearchInput(loc); onUpdateLocation(loc); }}
              className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-full text-[9px] font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-all whitespace-nowrap flex items-center gap-2"
            >
              <History className="w-2.5 h-2.5" />
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Temp & Conditions */}
      <div className="md:col-span-12 lg:col-span-5 lg:row-span-2 bg-[#1a1a1a] rounded-[2rem] p-8 border border-zinc-800 flex flex-col justify-between min-h-[400px]">
        <div>
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Atmosphere</span>
            <img src={getMeteoconUrl(current.icon, isDay)} alt={current.conditions} className="w-20 h-20" />
          </div>
          <div className="mt-4 flex items-baseline">
            <h2 className="text-9xl font-bold tracking-tighter leading-none">{Math.round(current.temp)}°</h2>
            <span className="text-4xl text-zinc-600 ml-2 font-light">F</span>
          </div>
          <p className="text-2xl text-zinc-400 mt-4 font-medium tracking-tight tracking-[-0.02em]">{current.conditions}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 border-t border-zinc-800/50 pt-8 mt-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <img src={UI_ICONS.thermometer} className="w-8 h-8 opacity-80" />
            </div>
            <div>
              <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-widest font-mono">Max / Min</p>
              <p className="text-xl font-mono font-bold">{Math.round(today.tempmax)}° / {Math.round(today.tempmin)}°</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800">
               <img src={UI_ICONS.visibility} className="w-8 h-8 opacity-80" />
             </div>
             <div>
               <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-widest font-mono">Visibility</p>
               <p className="text-xl font-mono font-bold">{current.visibility} mi</p>
             </div>
          </div>
        </div>
      </div>

      {/* 24 Hour Trend Grid Item - More detail here */}
      <div className="md:col-span-12 lg:col-span-7 bg-[#1a1a1a] rounded-[2rem] p-8 border border-zinc-800 flex flex-col min-h-[600px]">
        <div className="flex justify-between items-center mb-8">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">24h Trajectory</span>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-zinc-400 text-[10px] font-mono uppercase tracking-widest text-[8px]">Temp</span>
            </div>
             <div className="flex items-center gap-2 shrink-0">
              <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
              <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest text-[8px]">Hum</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-700"></div>
              <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest text-[8px]">Dew</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest text-[8px]">UV</span>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full mt-8 relative" style={{ minHeight: '400px' }}>
          <ResponsiveContainer width="99%" aspect={1.5}>

            <AreaChart data={hourlyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTempBento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHumidityBento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3f3f46" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3f3f46" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDewBento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUVBento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#4b5563', fontSize: 8, fontFamily: 'monospace'}}
                interval={4}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="uv" name="UV" stroke="#eab308" strokeWidth={1} fillOpacity={1} fill="url(#colorUVBento)" />
              <Area type="monotone" dataKey="humidity" name="Humidity" stroke="#374151" strokeWidth={1} fillOpacity={1} fill="url(#colorHumidityBento)" />
              <Area type="monotone" dataKey="dew" name="Dew Point" stroke="#059669" strokeWidth={1} fillOpacity={1} fill="url(#colorDewBento)" />
              <Area type="monotone" dataKey="temp" name="Temperature" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTempBento)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-zinc-700 text-[8px] mt-6 font-mono uppercase tracking-[0.4em]">
          {timelineLabels.map((lbl, i) => <span key={i}>{lbl}</span>)}
        </div>
      </div>

      {/* Wind & Gusts */}
      <div className="md:col-span-6 lg:col-span-3 bg-[#1a1a1a] rounded-[2rem] p-6 border border-zinc-800 flex flex-col justify-between min-h-[200px]">
        <div className="flex justify-between items-start">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Wind Profile</span>
          <img src={UI_ICONS.wind} className="w-10 h-10" />
        </div>
        <div className="flex items-end space-x-2 my-4">
          <div className="text-6xl font-bold tracking-tighter">{Math.round(current.windspeed)}</div>
          <div className="text-zinc-500 text-sm mb-2 font-mono tracking-widest uppercase">mph</div>
        </div>
        <div className="flex justify-between items-center text-[9px] border-t border-zinc-800/50 pt-3 font-mono tracking-widest">
          <span className="text-zinc-600 uppercase">Direction</span>
          <span className="text-white font-bold">{current.winddir}° NW</span>
        </div>
      </div>

      {/* Moon Phase Grid Item */}
      <div className="md:col-span-6 lg:col-span-3 bg-[#1a1a1a] rounded-[2rem] p-6 border border-zinc-800 min-h-[200px]">
        <MoonPhase phase={today.moonphase} />
      </div>

      {/* UV Index Grid Item */}
      <div className="md:col-span-6 lg:col-span-3 bg-[#1a1a1a] rounded-[2rem] p-6 border border-zinc-800 min-h-[200px]">
        <UVGraph uvindex={current.uvindex} />
      </div>

      {/* Humidity & Dew Point */}
      <div className="md:col-span-6 lg:col-span-3 bg-[#1a1a1a] rounded-[2rem] p-6 border border-zinc-800 flex flex-col justify-between min-h-[200px]">
        <div className="flex justify-between items-start">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Humidity</span>
          <img src={UI_ICONS.humidity} className="w-10 h-10" />
        </div>
        <div className="text-6xl font-bold tracking-tighter my-4">{Math.round(current.humidity)}%</div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
            <span>Dew Point</span>
            <span className="text-white">{Math.round(current.dew)}°</span>
          </div>
          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${current.humidity}%` }}></div>
          </div>
        </div>
      </div>

      {/* Feels Like & Pressure combined or simplified */}
      <div className="md:col-span-6 lg:col-span-4 bg-[#1a1a1a] rounded-[2rem] p-6 border border-zinc-800 flex flex-col justify-between min-h-[200px]">
        <div className="flex justify-between items-start">
           <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Thermal Index</span>
           <img src={UI_ICONS.thermometer} className="w-10 h-10 opacity-60" />
        </div>
        <div className="flex items-baseline gap-2 my-2">
          <div className="text-6xl font-bold tracking-tighter">{Math.round(current.feelslike)}°</div>
          <span className="text-zinc-600 text-sm font-mono uppercase tracking-widest">Feels</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-[9px] text-zinc-500 font-mono tracking-widest uppercase border-t border-zinc-800/50 pt-4">
          <div>
            <span className="block text-zinc-700">Actual</span>
            <span className="text-zinc-400 font-bold">{Math.round(current.temp)}°</span>
          </div>
          <div>
            <span className="block text-zinc-700">Pressure</span>
            <span className="text-zinc-400 font-bold">{current.pressure} MB</span>
          </div>
        </div>
      </div>

      {/* Sun Cycle */}
      <div className="md:col-span-6 lg:col-span-4 bg-[#1a1a1a] rounded-[2rem] p-6 border border-zinc-800 flex flex-col justify-between min-h-[200px]">
        <div className="flex justify-between items-start">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Solar Cycle</span>
          <img src={UI_ICONS.sunrise} className="w-8 h-8" />
        </div>
        <div className="space-y-4 my-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={UI_ICONS.sunrise} className="w-6 h-6 opacity-60" />
              <span className="text-sm font-mono tracking-widest uppercase text-zinc-400">Sunrise</span>
            </div>
            <span className="text-lg font-bold">{formatTimeAMPM(current.sunrise, true)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={UI_ICONS.sunset} className="w-6 h-6 opacity-60" />
              <span className="text-sm font-mono tracking-widest uppercase text-zinc-400">Sunset</span>
            </div>
            <span className="text-lg font-bold">{formatTimeAMPM(current.sunset, true)}</span>
          </div>
        </div>
        <div className="text-[8px] text-zinc-700 font-mono uppercase tracking-[0.4em] mt-auto">
          Synced Orbit: {weather.timezone}
        </div>
      </div>
      
      {/* Small extra tile for Cloud Cover replaced with CAPE/Shear combo? No, let's just add new ones */}
      <div className="md:col-span-6 lg:col-span-2 bg-[#1a1a1a] rounded-[2rem] p-6 border border-zinc-800 flex flex-col justify-between min-h-[200px]">
        <div className="flex justify-between items-start">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Clouds</span>
          <img src={getMeteoconUrl('cloudy')} className="w-8 h-8" />
        </div>
        <div className="text-4xl font-bold tracking-tighter my-4">{Math.round(current.cloudcover)}%</div>
        <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-auto">
           <div className="bg-zinc-700 h-full transition-all duration-1000" style={{ width: `${current.cloudcover}%` }}></div>
        </div>
      </div>

      <div className="md:col-span-6 lg:col-span-4 bg-[#1a1a1a] rounded-[2rem] p-6 border border-zinc-800 min-h-[220px]">
        <CapeMeter 
          cape={current.cape} 
          temp={current.temp} 
          dew={current.dew} 
          pressure={current.pressure}
          isSpcLive={(current as any)._spc_live}
        />
      </div>

      <div className="md:col-span-6 lg:col-span-4 bg-[#1a1a1a] rounded-[2rem] p-6 border border-zinc-800 min-h-[220px]">
        <CinMeter 
          cin={current.cin} 
          temp={current.temp} 
          dew={current.dew} 
          pressure={current.pressure}
          isSpcLive={(current as any)._spc_live}
        />
      </div>

      <div className="md:col-span-6 lg:col-span-4 bg-[#1a1a1a] rounded-[2rem] p-6 border border-zinc-800 min-h-[220px]">
        <ShearMeter 
          shear={current.shear} 
          srh={(current as any).srh}
          windspeed={current.windspeed} 
          windgust={current.windgust || current.windspeed} 
          pressure={current.pressure}
          isSpcLive={(current as any)._spc_live}
        />
      </div>


      {/* Severe Alerts */}
      {weather.alerts && weather.alerts.length > 0 ? (
        <div className="md:col-span-12 bg-red-950/20 border border-red-900/50 p-6 rounded-[2rem] flex items-center gap-6 mt-4 shadow-xl shadow-red-950/10">
           <img src="https://cdn.meteocons.com/3.0.0-next.10/svg/fill/code-red.svg" className="w-12 h-12 shrink-0" />
           <div>
             <h3 className="text-red-400 text-sm font-bold uppercase tracking-widest">{weather.alerts[0].event}</h3>
             <p className="text-red-300/60 text-xs mt-1 font-mono">{weather.alerts[0].headline}</p>
           </div>
        </div>
      ) : (
        <div className="md:col-span-12 bg-[#1a1a1a] border border-zinc-800 p-6 rounded-[2rem] flex items-center justify-between mt-4">
           <div className="flex items-center gap-4">
             <ShieldCheck className="w-5 h-5 text-green-500/50" />
             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Atmospheric Stability: Locked</span>
           </div>
           <span className="text-[9px] font-mono text-zinc-700 uppercase">Clear Channel</span>
        </div>
      )}
    </div>
  );
}
