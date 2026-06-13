import React from 'react';
import { Globe, ShieldCheck } from 'lucide-react';

interface SettingsTabProps {
  currentLocation: string;
  onUpdateLocation: (newLocation: string) => void;
}

export default function SettingsTab({ currentLocation, onUpdateLocation }: SettingsTabProps) {
  return (
    <div className="space-y-8 pb-12">
      <div className="px-2">
        <h2 className="text-xl font-bold tracking-tight uppercase">System Configuration</h2>
        <p className="text-xs text-zinc-500 font-mono mt-1">Terminal Environment Settings</p>
      </div>

      {/* API Credits / System Info */}
      <section className="space-y-4">
         <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 font-mono text-zinc-500">System Integrity</h3>
         <div className="bg-[#1a1a1a] border border-zinc-800 rounded-[2rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-black rounded-xl border border-zinc-900">
                     <Globe className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                     <div className="text-[11px] font-bold uppercase tracking-widest">Atmosphere Node</div>
                     <div className="text-[10px] font-mono text-zinc-600">Visual Crossing V1</div>
                  </div>
               </div>
               <span className="px-2 py-1 bg-green-950/20 text-green-500 text-[8px] font-bold uppercase rounded-md border border-green-900/50 tracking-widest">Active</span>
            </div>

            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-black rounded-xl border border-zinc-900">
                     <ShieldCheck className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                     <div className="text-[11px] font-bold uppercase tracking-widest">Data Encryption</div>
                     <div className="text-[10px] font-mono text-zinc-600">Secure Protocol</div>
                  </div>
               </div>
               <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-tighter">Verified</span>
            </div>
         </div>
      </section>

      <div className="pt-8 text-center px-6">
        <p className="text-[10px] text-zinc-700 font-mono text-center uppercase tracking-widest leading-loose">
          Visual Crossing Weather Protocol • V4.1a Terminal<br />
          Twilight Grey Sub-Main Configuration
        </p>
      </div>
    </div>
  );
}
