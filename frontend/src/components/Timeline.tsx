import React from 'react';
import { 
  Ship, 
  Satellite, 
  WifiOff, 
  MapPin, 
  CheckCircle2, 
  TrendingDown, 
  AlertTriangle 
} from 'lucide-react';

interface TimelineItemProps {
  time: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'info' | 'warning' | 'danger' | 'success';
}

const TimelineItem: React.FC<TimelineItemProps> = ({ time, title, description, icon: Icon, type }) => {
  const getColorClass = () => {
    switch (type) {
      case 'danger': return 'text-rose-500 border-rose-500 bg-rose-950/40 shadow-rose-950/20';
      case 'warning': return 'text-amber-500 border-amber-500 bg-amber-950/40 shadow-amber-950/20';
      case 'success': return 'text-emerald-500 border-emerald-500 bg-emerald-950/40 shadow-emerald-950/20';
      default: return 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40 shadow-cyan-950/20';
    }
  };

  return (
    <div className="relative pl-8 pb-6 last:pb-0 group">
      {/* Timeline line connection */}
      <div className="absolute left-[15px] top-7 bottom-0 w-[1px] bg-slate-800 group-last:hidden" />
      
      {/* Telemetry dot / Icon */}
      <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-115 ${getColorClass()}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>

      {/* Content */}
      <div className="glass-panel p-3 rounded-lg border border-slate-850 hover:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
          <span className="text-xs font-bold text-slate-100">{title}</span>
          <span className="text-[10px] font-mono font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-900/50 px-1.5 py-0.5 rounded">
            {time}
          </span>
        </div>
        <p className="text-[10.5px] font-mono text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export const Timeline: React.FC = () => {
  const events = [
    {
      time: '09:00 AM',
      title: 'Vessel Inbound Transit',
      description: 'MV OCEAN STAR enters West Coast – Zone 1, heading northwest at 14.2 knots.',
      icon: Ship,
      type: 'info' as const
    },
    {
      time: '10:35 AM',
      title: 'Trajectory Alteration Logged',
      description: 'Vessel executes course deviation from 315° to 270°, reducing speed to 6.8 knots.',
      icon: TrendingDown,
      type: 'warning' as const
    },
    {
      time: '10:42 AM',
      title: 'AIS Blackout / Transmission Lost',
      description: 'AIS transponder signal drops. Vessel status changes to DARK TARGET near coordinates 15.42° N, 73.20° E.',
      icon: WifiOff,
      type: 'danger' as const
    },
    {
      time: '11:00 AM – 12:10 PM',
      title: 'Estimated Spill Release Window',
      description: 'Forensic backtracking models place the probable discharge event within this temporal window.',
      icon: AlertTriangle,
      type: 'danger' as const
    },
    {
      time: '12:15 PM',
      title: 'AIS Reacquired',
      description: 'Signal resumes at 15.58° N, 72.82° E. Speed returns to 13.8 knots. Heading 315°.',
      icon: Ship,
      type: 'info' as const
    },
    {
      time: '12:30 PM',
      title: 'Spill Slick Drift Commences',
      description: 'Heavy crude slick begins drift vectors under WSW winds and SSE ocean current parameters.',
      icon: MapPin,
      type: 'info' as const
    },
    {
      time: 'Later (10:32 AM Capture)',
      title: 'Satellite Image Capture',
      description: 'Sentinel-1 SAR radar imagery captures the oil slick (12.8 km²), logging the spatial profile.',
      icon: Satellite,
      type: 'warning' as const
    },
    {
      time: 'Current',
      title: 'Investigation Concluded',
      description: 'Forensic telemetry and explainable rankings compiled. Target reports generated.',
      icon: CheckCircle2,
      type: 'success' as const
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950/20 p-4 rounded-xl border border-slate-900 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <Satellite className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
          Chronological Reconstruction
        </h3>
      </div>
      
      <div className="flex-grow">
        {events.map((event, idx) => (
          <TimelineItem 
            key={idx}
            time={event.time}
            title={event.title}
            description={event.description}
            icon={event.icon}
            type={event.type}
          />
        ))}
      </div>
    </div>
  );
};
export default Timeline;
