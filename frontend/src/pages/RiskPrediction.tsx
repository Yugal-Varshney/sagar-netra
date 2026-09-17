import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  Compass, 
  Clock, 
  ShieldAlert, 
  Info
} from 'lucide-react';

export const RiskPrediction: React.FC = () => {
  const { riskHours, setRiskHours } = useSimulation();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'MEDIUM': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getImpactStatus = (hours: number) => {
    if (hours === 0) return 'Spill stationary at observation point.';
    if (hours === 6) return 'Slick drifting ENE at 1.1 knots. Outer margins spreading.';
    if (hours === 12) return 'Slick enters state maritime boundaries. Spreads to 18 km².';
    if (hours === 24) return 'Shallow water ingress. High risk of coral bed contamination.';
    return 'CRITICAL LANDFALL: Slick impacts Goa sandy beach corridor. Beach cleanup response triggered.';
  };

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      
      {/* Forecast Stepper and Slider Cockpit */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">
              Forward Drift Spill Forecast
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-800/40 px-2 py-0.5 rounded animate-pulse">
            Oceanographic Drift Sim
          </span>
        </div>

        {/* Time Slider */}
        <div className="py-5 px-3 bg-slate-950/40 border border-slate-900 rounded-lg mb-4 flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Projection Interval</span>
            <span className="text-sm font-extrabold text-cyan-400">
              +{riskHours} Hours {riskHours === 0 ? '(Current)' : 'Forecast'}
            </span>
          </div>

          {/* Range Slider */}
          <div className="relative">
            <input 
              type="range" 
              min="0" 
              max="48" 
              step="6"
              value={riskHours}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                // Clamp values to valid options: 0, 6, 12, 24, 48
                const steps = [0, 6, 12, 24, 48];
                const closest = steps.reduce((prev, curr) => 
                  Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
                );
                setRiskHours(closest);
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            {/* Tick labels */}
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-2.5">
              <span>+0h (Observation)</span>
              <span>+6h</span>
              <span>+12h</span>
              <span>+24h</span>
              <span>+48h (Coastal Landfall)</span>
            </div>
          </div>
        </div>

        {/* Forecast Summary */}
        <div className="flex gap-3 bg-slate-950/30 border border-slate-905 p-3 rounded-lg text-xs">
          <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200 block mb-0.5">Forecast Status:</span>
            <p className="text-slate-400 font-mono text-[10px] leading-relaxed">
              {getImpactStatus(riskHours)}
            </p>
          </div>
        </div>

      </div>

      {/* Coastal Impact Assessment (Bottom grid) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-grow">
        
        {/* Risk Areas Table (8 Columns) */}
        <div className="md:col-span-8 flex flex-col gap-3">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">
            Vulnerable Coastal Assets (Landfall Threat)
          </h4>

          <div className="flex flex-col gap-2">
            {/* Zone A */}
            <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-200 font-sans">Coastal Zone A (Goa Sandy Beaches)</span>
                </div>
                <span className="text-[9.5px] font-mono text-slate-400 mt-0.5 block">
                  Asset Type: Tourism Corridor & Fishery Ports • Distance: 15.4 km
                </span>
              </div>
              <div className="text-right">
                <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border ${getRiskColor('HIGH')}`}>
                  HIGH RISK
                </span>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">Impact: 12 Hours</span>
              </div>
            </div>

            {/* Zone B */}
            <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold text-slate-200 font-sans">Marine Sanctuary B (Netrani Coral Beds)</span>
                </div>
                <span className="text-[9.5px] font-mono text-slate-400 mt-0.5 block">
                  Asset Type: Marine Ecological Sanctuary • Distance: 34.2 km
                </span>
              </div>
              <div className="text-right">
                <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border ${getRiskColor('MEDIUM')}`}>
                  MEDIUM RISK
                </span>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">Impact: 28 Hours</span>
              </div>
            </div>

            {/* Zone C */}
            <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-slate-200 font-sans">Industrial Area C (Karwar Port Infrastructure)</span>
                </div>
                <span className="text-[9.5px] font-mono text-slate-400 mt-0.5 block">
                  Asset Type: Commercial Deepwater Port • Distance: 52.8 km
                </span>
              </div>
              <div className="text-right">
                <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border ${getRiskColor('LOW')}`}>
                  LOW RISK
                </span>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">Impact: 44 Hours</span>
              </div>
            </div>

          </div>
        </div>

        {/* Environmental Sensitivity Dashboard (4 Columns) */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-full">
            <div>
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Vulnerability Matrix
              </h4>

              <div className="flex flex-col gap-3 font-mono text-[10.5px]">
                <div className="flex justify-between items-center py-1 border-b border-slate-900">
                  <span className="text-slate-400">Total Vulnerable Assets:</span>
                  <span className="text-slate-200 font-bold">14 Targets</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900">
                  <span className="text-slate-400">Response Assets Available:</span>
                  <span className="text-emerald-400 font-bold">4 Coast Guard Boats</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900">
                  <span className="text-slate-400">Average Slick Spread:</span>
                  <span className="text-rose-400 font-bold">+1.2 km²/hour</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900">
                  <span className="text-slate-400">Ocean Wind Drift Coefficient:</span>
                  <span className="text-slate-200">0.035 m/s</span>
                </div>
              </div>
            </div>

            {/* Ingest info alert */}
            <div className="mt-4 flex gap-1.5 text-[9px] font-mono text-slate-500 leading-normal border-t border-slate-900 pt-3">
              <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span>
                Risk model uses real-time forecast indices blending ECMWF global winds, Copernicus Marine current datasets, and wave heights.
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
export default RiskPrediction;
