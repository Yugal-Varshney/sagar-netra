import React from 'react';
import type { VesselSuspect } from '../data/mockCases';
import { 
  CheckCircle2, 
  XCircle, 
  Anchor, 
  AlertOctagon, 
  Info,
  Sliders,
  Flag,
  Activity
} from 'lucide-react';

interface EvidenceCardProps {
  vessel: VesselSuspect | null;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ vessel }) => {
  if (!vessel) {
    return (
      <div className="premium-card p-6 flex items-center justify-center h-full text-slate-400 italic font-mono text-xs border border-slate-150 shadow-sm bg-white">
        Select a vessel to review forensic attribution evidence.
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'MEDIUM-HIGH': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-250';
      default: return 'text-slate-500 bg-slate-50 border-slate-150';
    }
  };

  return (
    <div className="premium-card p-5 flex flex-col h-full border border-slate-150 shadow-sm bg-white">
      
      {/* Vessel Profile Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 tracking-wide font-sans">{vessel.name}</h3>
            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border ${getRiskColor(vessel.riskLevel)}`}>
              {vessel.riskLevel} RISK
            </span>
          </div>
          <p className="text-[9.5px] font-mono text-slate-500 mt-1">
            {vessel.imo} • {vessel.type}
          </p>
        </div>
        
        <div className="text-right">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block leading-none">
            Suspicon Index
          </span>
          <span className="text-xl font-black font-mono text-marine-500">
            {vessel.score}<span className="text-xs text-slate-400 font-normal">/100</span>
          </span>
        </div>
      </div>

      {/* Flag and Speed telemetry */}
      <div className="grid grid-cols-2 gap-2.5 mb-4 text-[10px] font-mono bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2 text-slate-600">
          <Flag className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
          <span>Flag: <strong className="text-slate-800">{vessel.flag}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Activity className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
          <span>Speed: <strong className="text-slate-800">{vessel.speed}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Anchor className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
          <span>Heading: <strong className="text-slate-800">{vessel.course}</strong></span>
        </div>
        {vessel.details.aisGap && (
          <div className="flex items-center gap-2 text-amber-600 col-span-2 border-t border-slate-100 pt-1.5 mt-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 animate-pulse" />
            <span>Gap: <strong className="text-slate-700">{vessel.details.aisGapDuration}</strong></span>
          </div>
        )}
      </div>

      {/* Checklist Evidence Summary */}
      <div className="mb-4 flex flex-col gap-2">
        <h4 className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Forensic Conditions Met
        </h4>
        
        <div className="flex items-center gap-2 text-[10.5px]">
          {vessel.details.passedOrigin ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          )}
          <span className={vessel.details.passedOrigin ? 'text-slate-700' : 'text-slate-400'}>
            Traversed high-probability origin boundary
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10.5px]">
          {vessel.details.presentInWindow ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          )}
          <span className={vessel.details.presentInWindow ? 'text-slate-700' : 'text-slate-400'}>
            Present during estimated oil discharge window
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10.5px]">
          {vessel.details.courseDeviation ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          )}
          <span className={vessel.details.courseDeviation ? 'text-slate-700' : 'text-slate-400'}>
            Significant speed / heading maneuvers detected
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10.5px]">
          {vessel.details.aisGap ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          )}
          <span className={vessel.details.aisGap ? 'text-slate-750 font-bold' : 'text-slate-400'}>
            AIS Transmission blackout gap detected
          </span>
        </div>
      </div>

      {/* Quantitative Scoring Breakdown */}
      <div className="mb-4 flex-grow">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sliders className="w-3.5 h-3.5 text-marine-500" />
          <h4 className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
            Attribution Score Weighting
          </h4>
        </div>

        <div className="flex flex-col gap-2">
          {/* Origin Proximity */}
          <div>
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-0.5">
              <span>Origin Proximity Index</span>
              <span>{vessel.breakdown.originProximity}%</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-marine-500 rounded-full transition-all duration-1000"
                style={{ width: `${vessel.breakdown.originProximity}%` }}
              />
            </div>
          </div>

          {/* Time Window Match */}
          <div>
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-0.5">
              <span>Discharge Window Overlap</span>
              <span>{vessel.breakdown.timeWindowMatch}%</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-marine-500 rounded-full transition-all duration-1000"
                style={{ width: `${vessel.breakdown.timeWindowMatch}%` }}
              />
            </div>
          </div>

          {/* Trajectory Overlap */}
          <div>
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-0.5">
              <span>Drift Trajectory Correlation</span>
              <span>{vessel.breakdown.trajectoryOverlap}%</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-marine-500 rounded-full transition-all duration-1000"
                style={{ width: `${vessel.breakdown.trajectoryOverlap}%` }}
              />
            </div>
          </div>

          {/* AIS Gap Severity */}
          {vessel.details.aisGap && (
            <div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-0.5">
                <span>AIS Blackout Severity</span>
                <span>{vessel.breakdown.aisGapSeverity}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                  style={{ width: `${vessel.breakdown.aisGapSeverity}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rationale / Why Suspicious */}
      <div className="mb-3.5 bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] font-mono text-slate-600 leading-relaxed">
        <span className="font-bold text-marine-500 block mb-0.5">Forensic Rationale:</span>
        {vessel.rank === 1 && 'Vessel MV OCEAN STAR is flagged at 82% suspicion due to strong geospatial and temporal correlation. The route highlights a 93 min AIS signal blackout precisely while crossing the high-probability spill origin zone. Course changes and slow speeds within the gap further suggest non-transit operations.'}
        {vessel.rank === 2 && 'Vessel MV BLUE HORIZON crossed the outer margins of the origin probability zone within the estimated release window. Minor course deviations were logged, but the vessel maintained normal speeds and active AIS telemetry throughout the zone, indicating medium-high probability.'}
        {vessel.rank === 3 && 'Vessel MV SEA VOYAGER was present in the outer maritime lane near the boundary during the estimation window. Telemetry is fully consistent with a standard transit profile, exhibiting normal container vessel speeds and a steady course.'}
      </div>

      {/* Legal Disclaimer */}
      <div className="border-t border-slate-100 pt-3 mt-auto flex gap-2 text-[8.5px] font-mono text-slate-400 leading-tight">
        <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          <strong>DISCLAIMER:</strong> This ranking represents probabilistic investigative evidence generated via machine learning algorithms and does not establish legal responsibility or environmental violation.
        </span>
      </div>

    </div>
  );
};
export default EvidenceCard;
