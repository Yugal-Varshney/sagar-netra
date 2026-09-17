import React, { useEffect, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { EvidenceCard } from '../components/EvidenceCard';
import { 
  Filter, 
  Wifi, 
  WifiOff, 
  ChevronRight
} from 'lucide-react';

export const VesselAnalysis: React.FC = () => {
  const { 
    vessels, 
    selectedVessel, 
    setSelectedVessel
  } = useSimulation();

  // AIS funnel animate states
  const [funnelStep, setFunnelStep] = useState(0);

  useEffect(() => {
    // Animate funnel stages step-by-step on load
    const timer1 = setTimeout(() => setFunnelStep(1), 400);
    const timer2 = setTimeout(() => setFunnelStep(2), 800);
    const timer3 = setTimeout(() => setFunnelStep(3), 1200);
    const timer4 = setTimeout(() => setFunnelStep(4), 1600);
    const timer5 = setTimeout(() => setFunnelStep(5), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  const getRiskBorder = (level: string, isSelected: boolean) => {
    if (isSelected) return 'border-cyan-500 bg-gradient-to-r from-cyan-950/20 to-blue-950/5';
    if (level === 'HIGH') return 'border-rose-950 hover:border-rose-900';
    if (level === 'MEDIUM-HIGH') return 'border-amber-950 hover:border-amber-900';
    return 'border-slate-850 hover:border-slate-800';
  };

  const getRiskTag = (level: string) => {
    if (level === 'HIGH') return 'text-rose-400 bg-rose-950/30 border border-rose-500/10';
    if (level === 'MEDIUM-HIGH') return 'text-amber-400 bg-amber-950/30 border border-amber-500/10';
    return 'text-yellow-400 bg-yellow-950/30 border border-yellow-500/10';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-y-auto pr-1">
      
      {/* Left Column: AIS Funnel & Suspect Candidates list (7 Columns) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        
        {/* AIS Traffic Filter Funnel (Cascading items) */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">
                AIS Traffic Attribution Filtering
              </h3>
            </div>
            <span className="text-[9px] font-mono text-cyan-500 bg-cyan-950/20 border border-cyan-800/40 px-2 py-0.5 rounded">
              Active Filtering Pipeline
            </span>
          </div>

          {/* Filtering funnel grid */}
          <div className="flex flex-col gap-2 font-mono text-[10px]">
            
            {/* Stage 1 */}
            <div className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-500 ${
              funnelStep >= 1 ? 'border-slate-800 bg-slate-950/40' : 'border-slate-900 opacity-20'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span>Regional AIS Ingestions (24h Window)</span>
              </div>
              <span className="font-bold text-slate-400">1,248 Vessels</span>
            </div>

            {/* Stage 2 */}
            <div className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-500 ${
              funnelStep >= 2 ? 'border-slate-800 bg-slate-950/40' : 'border-slate-900 opacity-20'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                <span>Geographic Bounding Box Matches (AOI)</span>
              </div>
              <span className="font-bold text-cyan-400">86 Vessels</span>
            </div>

            {/* Stage 3 */}
            <div className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-500 ${
              funnelStep >= 3 ? 'border-slate-800 bg-slate-950/40' : 'border-slate-900 opacity-20'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                <span>Discharge Time Window Overlaps</span>
              </div>
              <span className="font-bold text-cyan-400">21 Vessels</span>
            </div>

            {/* Stage 4 */}
            <div className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-500 ${
              funnelStep >= 4 ? 'border-slate-800 bg-slate-950/40' : 'border-slate-900 opacity-20'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Drift Trajectory Intersection (Backward Trace)</span>
              </div>
              <span className="font-bold text-amber-400">8 Vessels</span>
            </div>

            {/* Stage 5 */}
            <div className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-500 ${
              funnelStep >= 5 ? 'border-rose-950 bg-rose-950/5' : 'border-slate-900 opacity-20'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="font-bold text-rose-400">High-Priority Suspect Attributions</span>
              </div>
              <span className="font-bold text-rose-400 animate-pulse">3 Candidates</span>
            </div>

          </div>
        </div>

        {/* Suspect Candidates List */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">
            Attributed Suspect Candidates
          </h4>

          {vessels.map((vessel) => {
            const isSelected = selectedVessel?.id === vessel.id;
            return (
              <button
                key={vessel.id}
                onClick={() => setSelectedVessel(vessel)}
                className={`glass-panel p-4 rounded-xl border text-left flex items-center justify-between transition-all group ${
                  getRiskBorder(vessel.riskLevel, isSelected)
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black border flex-shrink-0 ${
                    isSelected
                      ? 'bg-cyan-950 border-cyan-500/40 text-cyan-400 shadow shadow-cyan-950/20'
                      : 'bg-slate-950 border-slate-850 text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {vessel.rank}
                  </div>
                  
                  {/* Vessel info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100 font-sans group-hover:text-cyan-400 transition-colors">
                        {vessel.name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${getRiskTag(vessel.riskLevel)}`}>
                        {vessel.riskLevel}
                      </span>
                    </div>
                    <p className="text-[9.5px] font-mono text-slate-500 mt-0.5">
                      {vessel.type} • {vessel.imo}
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Suspicion</span>
                    <span className="text-sm font-bold font-mono text-cyan-400">{vessel.score}%</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* AIS Anomaly Gap Timeline Diagram for MV OCEAN STAR (or selected vessel if has gap) */}
        {selectedVessel?.details.aisGap && (
          <div className="glass-panel p-4 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-850 pb-2">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                Suspicious AIS Telemetry Blackout Analysis
              </h4>
              <span className="text-[9px] font-mono text-amber-400 font-bold">1 hr 33 min transmission gap</span>
            </div>

            {/* Gap Timeline Diagram */}
            <div className="flex items-center justify-between gap-1 py-4 font-mono text-[9px] text-slate-400">
              
              {/* Point 1: AIS Active */}
              <div className="flex flex-col items-center gap-1.5 w-3/12 text-center">
                <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Wifi className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-slate-200 block font-bold">AIS Broadcast Active</span>
                  <span className="text-slate-500 text-[8px]">09:00 AM - 10:42 AM</span>
                </div>
              </div>

              {/* Connector line 1 */}
              <div className="h-0.5 bg-emerald-800 flex-grow relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 text-[10px] font-bold">✓</div>
              </div>

              {/* Point 2: AIS Gap lost */}
              <div className="flex flex-col items-center gap-1.5 w-4/12 text-center">
                <div className="w-7 h-7 rounded-full bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
                  <WifiOff className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-amber-400 block font-bold">AIS Gap (DARK TARGET)</span>
                  <span className="text-slate-300 text-[8px] bg-slate-900 border border-slate-800 px-1 rounded">10:42 AM - 12:15 PM</span>
                </div>
              </div>

              {/* Connector line 2 */}
              <div className="h-0.5 bg-slate-800 flex-grow relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500 text-[12px] font-bold font-sans animate-pulse">?</div>
              </div>

              {/* Point 3: AIS Reacquired */}
              <div className="flex flex-col items-center gap-1.5 w-3/12 text-center">
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Wifi className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-slate-200 block font-bold">Signal Reacquired</span>
                  <span className="text-slate-500 text-[8px]">12:15 PM Onward</span>
                </div>
              </div>

            </div>

            <p className="text-[10px] leading-relaxed text-slate-400 bg-slate-950/40 p-2 rounded.5 border border-slate-900 mt-2 font-mono">
              <strong>Telemetry Context:</strong> Transponder gap begins near the high-probability release coordinates. The vessel alters course and reduces transit speeds to 6 knots during the blackout, re-broadcasting only after exiting the critical zone.
            </p>

          </div>
        )}

      </div>

      {/* Right Column: Detailed Evidence card panel (5 Columns) */}
      <div className="lg:col-span-5 h-full">
        <EvidenceCard vessel={selectedVessel} />
      </div>

    </div>
  );
};
export default VesselAnalysis;
