import React, { useState } from 'react';
import { Waves, ShieldAlert, CircleHelp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type FloodTab = 'day1' | 'day2' | 'day3' | 'day4' | 'day5';

export default function FloodRiskTab() {
  const [activeSubTab, setActiveSubTab] = useState<FloodTab>('day1');

  const configs: Record<FloodTab, { label: string; url: string }> = {
    day1: { label: 'Day 1', url: 'https://www.wpc.ncep.noaa.gov/qpf/94ewbg.gif' },
    day2: { label: 'Day 2', url: 'https://www.wpc.ncep.noaa.gov/qpf/98ewbg.gif' },
    day3: { label: 'Day 3', url: 'https://www.wpc.ncep.noaa.gov/qpf/99ewbg.gif' },
    day4: { label: 'Day 4', url: 'https://www.wpc.ncep.noaa.gov/qpf/ero_d45/images/d4wbg.gif' },
    day5: { label: 'Day 5', url: 'https://www.wpc.ncep.noaa.gov/qpf/ero_d45/images/d5wbg.gif' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl font-medium tracking-tight">WPC Flood Risk Maps</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">Hydrological Impact Projections</p>
        </div>
        <Waves className="w-6 h-6 text-blue-500 opacity-50" />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(configs) as FloodTab[]).map(t => (
          <button
            key={t}
            onClick={() => setActiveSubTab(t)}
            className={cn(
              "flex-1 min-w-[70px] py-3 px-2 rounded-2xl text-[10px] font-mono transition-all uppercase tracking-widest border",
              activeSubTab === t 
                ? "bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
            )}
          >
            {configs[t].label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeSubTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-[2.5rem] overflow-hidden p-4">
             <div className="relative aspect-[4/3] bg-zinc-950 rounded-[2rem] overflow-hidden">
                <img 
                  src={configs[activeSubTab].url} 
                  alt={`Flood Risk ${configs[activeSubTab].label}`} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter contrast-125"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/18181b/ffffff?text=Hydrological+Data+Sync+Required';
                  }}
                />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-[#1a1a1a] border border-zinc-800 p-6 rounded-[2rem]">
                <div className="flex items-center gap-2 mb-2 text-zinc-500">
                   <ShieldAlert className="w-3" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Protocol</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                  Excessive Rainfall Outlook (ERO) maps identify areas where flash flooding likelihood is highest.
                </p>
             </div>
             <div className="bg-[#1a1a1a] border border-zinc-800 p-6 rounded-[2rem]">
                <div className="flex items-center gap-2 mb-2 text-zinc-500">
                   <CircleHelp className="w-3" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Analysis</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                  Probability of rainfall exceeding flash flood guidance within 40km of a point.
                </p>
             </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="p-6 bg-black border border-zinc-900 rounded-3xl flex items-center justify-between">
         <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Source: WPC / NOAA</span>
         <a 
          href="https://www.wpc.ncep.noaa.gov/qpf/ero.php" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-white transition-colors"
         >
           <ExternalLink className="w-4 h-4" />
         </a>
      </div>
    </div>
  );
}
