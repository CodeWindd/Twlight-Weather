import React from 'react';
import { WeatherData, HourlyForecast } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getMeteoconUrl, UI_ICONS } from '../lib/weather-icons';

export default function Hourly96Tab({ weather }: { weather: WeatherData }) {
  // Combine next 96 hours starting from current local hour
  const allHours: HourlyForecast[] = [];
  weather.days.forEach(day => {
    allHours.push(...day.hours);
  });

  const nowEpoch = weather.currentConditions.datetimeEpoch;
  // Start from the current hour or next hour
  const next96 = allHours
    .filter(h => h.datetimeEpoch >= nowEpoch - 3500) // Ensure current hour is included
    .slice(0, 96);

  const formatTime = (timeStr: string) => {
    const [hour] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour} ${ampm}`;
  };

  const formatTimeAMPM = (timeStr: string) => {
    const [hour] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour} ${ampm}`;
  };

  const chartData = next96.map((h, idx) => ({
    time: formatTimeAMPM(h.datetime),
    temp: h.temp,
    precip: h.precipprob,
    humidity: h.humidity,
    dew: h.dew,
    uv: h.uvindex
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2 mb-6">
        <h2 className="text-xl font-bold tracking-tight uppercase">96-Hour Chronology</h2>
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Projected Path</span>
      </div>

      {/* Hourly Temp Chart */}
      <div className="bg-[#1a1a1a] border border-zinc-800 p-8 rounded-[2rem]">
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Atmospheric Chronology</h3>
          <div className="flex items-center gap-4 flex-wrap">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
               <span className="text-zinc-500 text-[8px] font-mono uppercase tracking-widest">Temp</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-cyan-700"></div>
               <span className="text-zinc-600 text-[8px] font-mono uppercase tracking-widest">Precip</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
               <span className="text-zinc-600 text-[8px] font-mono uppercase tracking-widest">Dew</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
               <span className="text-zinc-600 text-[8px] font-mono uppercase tracking-widest">UV</span>
             </div>
          </div>
        </div>
        <div className="w-full mt-8 relative h-[500px]" style={{ minHeight: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp96" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPrecip96" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0e7490" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0e7490" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDew96" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUV96" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#4b5563', fontSize: 8, fontFamily: 'monospace'}}
                interval={8}
              />
              <YAxis yAxisId="tempDew" domain={['auto', 'auto']} hide />
              <YAxis yAxisId="precip" domain={[0, 100]} hide />
              <YAxis yAxisId="uv" domain={[0, 15]} hide />
              <Tooltip 
                contentStyle={{backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px'}}
                itemStyle={{color: '#fff'}}
                labelStyle={{color: '#71717a'}}
              />
              <Area yAxisId="uv" type="monotone" name="UV" dataKey="uv" stroke="#eab308" strokeWidth={1} fillOpacity={1} fill="url(#colorUV96)" />
              <Area yAxisId="precip" type="monotone" name="Precip Probability" dataKey="precip" stroke="#0e7490" strokeWidth={1} fillOpacity={1} fill="url(#colorPrecip96)" />
              <Area yAxisId="tempDew" type="monotone" name="Dew Point" dataKey="dew" stroke="#059669" strokeWidth={1} fillOpacity={1} fill="url(#colorDew96)" />
              <Area yAxisId="tempDew" type="monotone" name="Temp" dataKey="temp" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTemp96)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vertical List for Detail */}
      <div className="grid gap-2 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {next96.map((hour, idx) => {
          // Rule of thumb for day/night in hourly list
          const h = parseInt(hour.datetime.split(':')[0], 10);
          const isDay = h > 6 && h < 20;

          return (
            <div key={idx} className="flex items-center justify-between p-5 bg-[#1a1a1a] border border-zinc-800 rounded-[1.5rem] hover:bg-zinc-900/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 text-xs font-mono text-zinc-500">
                  {idx === 0 ? 'Now' : formatTime(hour.datetime)}
                </div>
                <div className="p-1 bg-black/40 rounded-lg">
                   <img src={getMeteoconUrl(hour.icon, isDay)} alt={hour.conditions} className="w-8 h-8" />
                </div>
                <div className="text-sm font-medium">{Math.round(hour.temp)}°</div>
              </div>
              
              <div className="flex-1 px-8 hidden md:block">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono italic">
                  <span className="w-2 h-2 rounded-full bg-zinc-700"></span>
                  {hour.conditions}
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono text-zinc-500">
                <div className="flex items-center gap-1">
                  <img src={UI_ICONS.raindrop} className="w-4 h-4 opacity-70" />
                  {Math.round(hour.precipprob)}%
                </div>
                <div className="flex items-center gap-1 w-12 justify-end">
                   <img src={UI_ICONS.humidity} className="w-4 h-4 opacity-70" />
                  {hour.humidity}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
