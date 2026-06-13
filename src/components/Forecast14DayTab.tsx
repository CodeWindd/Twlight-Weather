import React from 'react';
import { WeatherData } from '../types';
import { motion } from 'motion/react';
import { getMeteoconUrl, UI_ICONS } from '../lib/weather-icons';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Forecast14DayTab({ weather }: { weather: WeatherData }) {
  const chartData = weather.days.slice(0, 14).map(day => ({
    date: new Date(day.datetimeEpoch * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    max: day.tempmax,
    min: day.tempmin
  }));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold tracking-tight uppercase">14-Day Forecast</h2>
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Synchronization Active</span>
      </div>

      {/* High/Low visual range */}
      <div className="bg-[#1a1a1a] border border-zinc-800 p-8 rounded-[2rem]">
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Thermal Corridor</h3>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
               <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Max</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
               <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">Min</span>
             </div>
          </div>
        </div>
        <div className="w-full mt-8 relative" style={{ height: '400px', minHeight: '400px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMax14" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#4b5563', fontSize: 9, fontFamily: 'monospace'}}
              />
              <Tooltip 
                contentStyle={{backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px'}}
                itemStyle={{color: '#fff'}}
                labelStyle={{color: '#71717a'}}
              />
              <Area type="monotone" dataKey="max" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMax14)" />
              <Area type="monotone" dataKey="min" stroke="#3f3f46" strokeWidth={1} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-3">
        {weather.days.slice(0, 14).map((day, idx) => (
          <motion.div 
            key={day.datetime}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="group bg-[#1a1a1a] border border-zinc-800 hover:border-zinc-700 p-5 rounded-[1.5rem] flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-4 min-w-[100px]">
              <div className="text-sm font-mono text-zinc-500">
                {new Date(day.datetimeEpoch * 1000).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  day: 'numeric',
                  timeZone: weather.timezone 
                })}
              </div>
              <div className="p-1 bg-black/40 rounded-xl">
                <img src={getMeteoconUrl(day.icon, true)} alt={day.conditions} className="w-10 h-10" />
              </div>
            </div>

            <div className="flex-1 px-4 hidden sm:block">
              <p className="text-xs text-zinc-400 line-clamp-1 italic">"{day.description}"</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                <img src={UI_ICONS.raindrop} className="w-4 h-4 opacity-70" />
                {Math.round(day.precipprob)}%
              </div>
              <div className="flex items-center gap-3 w-20 justify-end">
                <span className="text-sm font-medium flex items-center gap-1">
                  {Math.round(day.tempmax)}°
                </span>
                <span className="text-sm text-zinc-500 flex items-center gap-1">
                  {Math.round(day.tempmin)}°
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl text-center">
        <p className="text-xs text-zinc-500 font-mono italic">
          Weather data provided by Visual Crossing Weather. 14-day forecasts subject to atmospheric variability.
        </p>
      </div>
    </div>
  );
}
