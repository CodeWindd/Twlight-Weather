import React, { useState } from 'react';
import { ShieldAlert, Map, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type SevereTab = 'day1' | 'day2' | 'day3';

export default function SevereOutlooksTab() {
  const [activeSubTab, setActiveSubTab] = useState<SevereTab>('day1');

  const configs = {
    day1: {
      label: 'Day 1',
      description: 'Current convective outlook covering the next 24 hours.',
      images: [
        { label: 'Categorical Hazard', url: 'https://www.spc.noaa.gov/partners/outlooks/national/swody1.png' },
        { label: 'Tornado Probability', url: 'https://www.spc.noaa.gov/partners/outlooks/national/swody1_TORN.png' },
        { label: 'Severe Wind', url: 'https://www.spc.noaa.gov/partners/outlooks/national/swody1_WIND.png' },
        { label: 'Severe Hail', url: 'https://www.spc.noaa.gov/partners/outlooks/national/swody1_HAIL.png' },
      ]
    },
    day2: {
      label: 'Day 2',
      description: 'Convective hazards predicted for tomorrow.',
      images: [
        { label: 'Categorical Hazard', url: 'https://www.spc.noaa.gov/partners/outlooks/national/swody2.png' },
        { label: 'Tornado Probability', url: 'https://www.spc.noaa.gov/partners/outlooks/national/swody2_TORN.png' },
        { label: 'Severe Wind', url: 'https://www.spc.noaa.gov/partners/outlooks/national/swody2_WIND.png' },
        { label: 'Severe Hail', url: 'https://www.spc.noaa.gov/partners/outlooks/national/swody2_HAIL.png' },
      ]
    },
    day3: {
      label: 'Day 3',
      description: 'Projections for atmospheric instability in 48-72 hours.',
      images: [
        { label: 'Categorical Hazard', url: 'https://www.spc.noaa.gov/partners/outlooks/national/swody3.png' },
        { label: 'Probabilistic Risk', url: 'https://www.spc.noaa.gov/partners/outlooks/national/swody3_PROB.png' },
      ]
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2 mb-2">
        <div>
          <h2 className="text-xl font-medium tracking-tight">SPC Convective Outlooks</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">National Prediction Center Visuals</p>
        </div>
        <ShieldAlert className="w-6 h-6 text-red-500 opacity-50" />
      </div>

      {/* Sub tabs */}
      <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
        {(Object.keys(configs) as SevereTab[]).map(t => (
          <button
            key={t}
            onClick={() => setActiveSubTab(t)}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl text-xs font-mono transition-all uppercase tracking-widest",
              activeSubTab === t ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {configs[t].label}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl flex items-start gap-3">
        <Info className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-zinc-500 leading-relaxed font-mono italic">
          {configs[activeSubTab].description} Outlooks are provided via the Storm Prediction Center (SPC). Hazards levels range from Marginal (MRGL) to High (HIGH).
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {configs[activeSubTab].images.map((img, idx) => (
            <div key={idx} className="bg-[#1a1a1a] border border-zinc-800 rounded-[2rem] overflow-hidden group shadow-xl">
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-black/20">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{img.label}</span>
                <Map className="w-4 h-4 text-zinc-600" />
              </div>
              <div className="relative aspect-[16/10] bg-zinc-950 p-2">
                <img 
                  src={img.url} 
                  alt={img.label} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter brightness-90 border border-zinc-900 rounded-xl"
                  onError={(e) => {
                   (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/18181b/ffffff?text=Direct+Satellite+Link+Offline';
                  }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
