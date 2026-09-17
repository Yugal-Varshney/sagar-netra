export interface MaritimeArea {
  id: string;
  name: string;
  subtitle: string;
  coordinatesLabel: string;
  sizeLabel: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  trafficLevel: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
  polygon: [number, number][];
}

export interface SatelliteObservation {
  id: string;
  date: string;
  time: string;
  timestamp: string;
  satellite: string;
  status: 'CLEAR' | 'SPILL_DETECTED' | 'SCANNING';
  confidence: number;
  seaState: string;
  windSpeed: string;
  windDirection: string;
  currentSpeed: string;
  currentDirection: string;
  imageType: 'SAR' | 'Optical';
  thumbnailUrl: string;
}

export interface VesselSuspect {
  id: string;
  name: string;
  rank: number;
  score: number;
  riskLevel: 'HIGH' | 'MEDIUM-HIGH' | 'MEDIUM' | 'LOW';
  imo: string;
  flag: string;
  type: string;
  speed: string;
  course: string;
  reasons: { text: string; score: number }[];
  details: {
    passedOrigin: boolean;
    presentInWindow: boolean;
    courseDeviation: boolean;
    aisGap: boolean;
    aisGapDuration?: string;
  };
  breakdown: {
    originProximity: number;
    timeWindowMatch: number;
    trajectoryOverlap: number;
    maneuverAnomaly: number;
    aisGapSeverity: number;
  };
  track: {
    lat: number;
    lng: number;
    time: string;
    aisOn: boolean;
  }[];
}

export interface HistoricalCase {
  id: string;
  title: string;
  locationLabel: string;
  date: string;
  status: string;
  spillArea: string;
  confidence: string;
  availableData: string[];
  areaId: string;
  observationTime: string;
}


// ==================================================
// PREDEFINED MONITORING AREAS
// ==================================================
//
// IMPORTANT:
// These IDs MUST match backend/app/data/areas.py
//
// Backend IDs:
//   gulf_of_kutch
//   mumbai_offshore
//   chennai_offshore
//
// Each AOI is a fixed square.
// ==================================================

export const PREDEFINED_AREAS: MaritimeArea[] = [

  // --------------------------------------------------
  // 1. GULF OF KUTCH
  // --------------------------------------------------

  {
    id: 'gulf_of_kutch',

    name: 'Gulf of Kutch',

    subtitle:
      'Offshore Gujarat petroleum and shipping corridor',

    coordinatesLabel:
      '22.45° N – 22.90° N, 69.85° E – 70.30° E',

    sizeLabel:
      '~2,500 km²',

    riskLevel:
      'HIGH',

    trafficLevel:
      'Petroleum, tanker & port traffic',

    center: [
      22.675,
      70.075
    ],

    bounds: [
      [22.45, 69.85],
      [22.90, 70.30]
    ],

    polygon: [
      [22.45, 69.85],
      [22.90, 69.85],
      [22.90, 70.30],
      [22.45, 70.30]
    ]
  },


  // --------------------------------------------------
  // 2. MUMBAI OFFSHORE
  // --------------------------------------------------

  {
    id: 'mumbai_offshore',

    name: 'Mumbai Offshore',

    subtitle:
      'Mumbai coastal shipping and petroleum region',

    coordinatesLabel:
      '18.55° N – 19.00° N, 72.55° E – 73.00° E',

    sizeLabel:
      '~2,500 km²',

    riskLevel:
      'HIGH',

    trafficLevel:
      'Dense commercial & petroleum traffic',

    center: [
      18.775,
      72.775
    ],

    bounds: [
      [18.55, 72.55],
      [19.00, 73.00]
    ],

    polygon: [
      [18.55, 72.55],
      [19.00, 72.55],
      [19.00, 73.00],
      [18.55, 73.00]
    ]
  },


  // --------------------------------------------------
  // 3. CHENNAI OFFSHORE
  // --------------------------------------------------

  {
    id: 'chennai_offshore',

    name: 'Chennai Offshore',

    subtitle:
      'Bay of Bengal coastal shipping corridor',

    coordinatesLabel:
      '12.75° N – 13.20° N, 80.00° E – 80.45° E',

    sizeLabel:
      '~2,500 km²',

    riskLevel:
      'MEDIUM',

    trafficLevel:
      'Container, cargo & coastal traffic',

    center: [
      12.975,
      80.225
    ],

    bounds: [
      [12.75, 80.00],
      [13.20, 80.45]
    ],

    polygon: [
      [12.75, 80.00],
      [13.20, 80.00],
      [13.20, 80.45],
      [12.75, 80.45]
    ]
  }
];


// ==================================================
// HISTORICAL CASES
// ==================================================

export const HISTORICAL_CASES: HistoricalCase[] = [

  {
    id: 'CASE-001',

    title:
      'CASE 001: Gulf of Kutch Spill',

    locationLabel:
      'Gulf of Kutch',

    date:
      '12 June 2024',

    status:
      'READY FOR ANALYSIS',

    spillArea:
      '12.8 km²',

    confidence:
      '94%',

    availableData: [
      'Satellite Observation',
      'AIS History',
      'Wind Data',
      'Ocean Current Data'
    ],

    areaId:
      'gulf_of_kutch',

    observationTime:
      '10:32 AM'
  },


  {
    id: 'CASE-002',

    title:
      'CASE 002: Mumbai Offshore Leak',

    locationLabel:
      'Mumbai Offshore',

    date:
      '18 July 2025',

    status:
      'COMPLETED & ARCHIVED',

    spillArea:
      '8.4 km²',

    confidence:
      '91%',

    availableData: [
      'Satellite Observation',
      'AIS History',
      'Ocean Current Data'
    ],

    areaId:
      'mumbai_offshore',

    observationTime:
      '02:15 PM'
  },


  {
    id: 'CASE-003',

    title:
      'CASE 003: Chennai Offshore Anomaly',

    locationLabel:
      'Chennai Offshore',

    date:
      '04 October 2025',

    status:
      'COMPLETED & ARCHIVED',

    spillArea:
      '4.2 km²',

    confidence:
      '88%',

    availableData: [
      'Satellite Observation',
      'AIS History',
      'Wind Data'
    ],

    areaId:
      'chennai_offshore',

    observationTime:
      '08:45 AM'
  }
];


// ==================================================
// MOCK SATELLITE OBSERVATIONS
// ==================================================

export const MOCK_OBSERVATIONS: SatelliteObservation[] = [

  {
    id: 'obs-5',
    date: '27 Aug 2026',
    time: '10:30 AM',
    timestamp: '2026-08-27T10:30:00Z',
    satellite: 'Sentinel-1 SAR',
    status: 'CLEAR',
    confidence: 96,
    seaState: 'Calm (Beaufort 2)',
    windSpeed: '12 km/h',
    windDirection: 'WSW',
    currentSpeed: '0.3 m/s',
    currentDirection: 'SSE',
    imageType: 'SAR',
    thumbnailUrl: ''
  },

  {
    id: 'obs-4',
    date: '25 Aug 2026',
    time: '10:28 AM',
    timestamp: '2026-08-25T10:28:00Z',
    satellite: 'Sentinel-1 SAR',
    status: 'CLEAR',
    confidence: 95,
    seaState: 'Slightly Choppy (Beaufort 3)',
    windSpeed: '16 km/h',
    windDirection: 'WSW',
    currentSpeed: '0.35 m/s',
    currentDirection: 'S',
    imageType: 'SAR',
    thumbnailUrl: ''
  },

  {
    id: 'obs-3',
    date: '23 Aug 2026',
    time: '10:26 AM',
    timestamp: '2026-08-23T10:26:00Z',
    satellite: 'Sentinel-1 SAR',
    status: 'CLEAR',
    confidence: 97,
    seaState: 'Calm (Beaufort 1)',
    windSpeed: '9 km/h',
    windDirection: 'SW',
    currentSpeed: '0.28 m/s',
    currentDirection: 'SE',
    imageType: 'SAR',
    thumbnailUrl: ''
  },

  {
    id: 'obs-2',
    date: '21 Aug 2026',
    time: '10:25 AM',
    timestamp: '2026-08-21T10:25:00Z',
    satellite: 'Sentinel-1 SAR',
    status: 'CLEAR',
    confidence: 94,
    seaState: 'Moderate (Beaufort 4)',
    windSpeed: '22 km/h',
    windDirection: 'W',
    currentSpeed: '0.42 m/s',
    currentDirection: 'SSE',
    imageType: 'SAR',
    thumbnailUrl: ''
  },

  {
    id: 'obs-1',
    date: '19 Aug 2026',
    time: '10:23 AM',
    timestamp: '2026-08-19T10:23:00Z',
    satellite: 'Sentinel-1 SAR',
    status: 'CLEAR',
    confidence: 98,
    seaState: 'Calm (Beaufort 2)',
    windSpeed: '11 km/h',
    windDirection: 'WSW',
    currentSpeed: '0.31 m/s',
    currentDirection: 'SSE',
    imageType: 'SAR',
    thumbnailUrl: ''
  }
];


// ==================================================
// MOCK SUSPECT VESSELS
// ==================================================

export const SUSPECT_VESSELS: VesselSuspect[] = [

  {
    id: 'vessel-01',
    name: 'MV OCEAN STAR',
    rank: 1,
    score: 87,
    riskLevel: 'HIGH',
    imo: 'IMO 9412345',
    flag: 'Panama (PAN)',
    type: 'Crude Oil Tanker',
    speed: '14.2 knots (Avg)',
    course: '315° (NW)',

    reasons: [
      {
        text: 'Close to high-probability origin zone',
        score: 30
      },
      {
        text: 'Present during estimated release window',
        score: 20
      },
      {
        text: 'Trajectory crossed origin region',
        score: 20
      },
      {
        text: 'Abnormal speed/course deviation',
        score: 12
      },
      {
        text: 'AIS transmission gap detected',
        score: 5
      }
    ],

    details: {
      passedOrigin: true,
      presentInWindow: true,
      courseDeviation: true,
      aisGap: true,
      aisGapDuration:
        '1 hr 33 min (10:42 AM - 12:15 PM)'
    },

    breakdown: {
      originProximity: 90,
      timeWindowMatch: 95,
      trajectoryOverlap: 90,
      maneuverAnomaly: 75,
      aisGapSeverity: 95
    },

    track: [
      {
        lat: 15.10,
        lng: 73.95,
        time: '09:00 AM',
        aisOn: true
      },
      {
        lat: 15.22,
        lng: 73.75,
        time: '09:30 AM',
        aisOn: true
      },
      {
        lat: 15.31,
        lng: 73.55,
        time: '10:00 AM',
        aisOn: true
      },
      {
        lat: 15.38,
        lng: 73.35,
        time: '10:30 AM',
        aisOn: true
      },
      {
        lat: 15.42,
        lng: 73.20,
        time: '10:42 AM',
        aisOn: false
      },
      {
        lat: 15.46,
        lng: 73.08,
        time: '11:15 AM (EST)',
        aisOn: false
      },
      {
        lat: 15.52,
        lng: 72.95,
        time: '11:45 AM (EST)',
        aisOn: false
      },
      {
        lat: 15.58,
        lng: 72.82,
        time: '12:15 PM',
        aisOn: true
      },
      {
        lat: 15.65,
        lng: 72.65,
        time: '12:45 PM',
        aisOn: true
      },
      {
        lat: 15.75,
        lng: 72.45,
        time: '01:15 PM',
        aisOn: true
      }
    ]
  },


  {
    id: 'vessel-02',
    name: 'MV BLUE HORIZON',
    rank: 2,
    score: 71,
    riskLevel: 'MEDIUM-HIGH',
    imo: 'IMO 9328476',
    flag: 'Liberia (LBR)',
    type: 'Bulk Carrier',
    speed: '12.0 knots (Avg)',
    course: '120° (SE)',

    reasons: [
      {
        text: 'Close to origin zone boundary',
        score: 25
      },
      {
        text: 'Present during estimated release window',
        score: 20
      },
      {
        text: 'Trajectory crossed origin outer zone',
        score: 18
      },
      {
        text: 'Minor course alteration detected',
        score: 8
      }
    ],

    details: {
      passedOrigin: true,
      presentInWindow: true,
      courseDeviation: true,
      aisGap: false
    },

    breakdown: {
      originProximity: 75,
      timeWindowMatch: 85,
      trajectoryOverlap: 70,
      maneuverAnomaly: 45,
      aisGapSeverity: 0
    },

    track: [
      {
        lat: 15.75,
        lng: 72.50,
        time: '09:00 AM',
        aisOn: true
      },
      {
        lat: 15.68,
        lng: 72.70,
        time: '09:30 AM',
        aisOn: true
      },
      {
        lat: 15.61,
        lng: 72.90,
        time: '10:00 AM',
        aisOn: true
      },
      {
        lat: 15.54,
        lng: 73.10,
        time: '10:30 AM',
        aisOn: true
      },
      {
        lat: 15.48,
        lng: 73.30,
        time: '11:00 AM',
        aisOn: true
      },
      {
        lat: 15.42,
        lng: 73.50,
        time: '11:30 AM',
        aisOn: true
      },
      {
        lat: 15.35,
        lng: 73.70,
        time: '12:00 PM',
        aisOn: true
      },
      {
        lat: 15.28,
        lng: 73.90,
        time: '12:30 PM',
        aisOn: true
      }
    ]
  },


  {
    id: 'vessel-03',
    name: 'MV SEA VOYAGER',
    rank: 3,
    score: 54,
    riskLevel: 'MEDIUM',
    imo: 'IMO 9521190',
    flag: 'Singapore (SGP)',
    type: 'Container Ship',
    speed: '18.5 knots (Avg)',
    course: '310° (NW)',

    reasons: [
      {
        text: 'Present in outer maritime corridor',
        score: 18
      },
      {
        text: 'Trajectory near probability zone margins',
        score: 15
      },
      {
        text: 'Time window match near boundary',
        score: 15
      },
      {
        text: 'Consistent speed and heading',
        score: 6
      }
    ],

    details: {
      passedOrigin: false,
      presentInWindow: true,
      courseDeviation: false,
      aisGap: false
    },

    breakdown: {
      originProximity: 45,
      timeWindowMatch: 65,
      trajectoryOverlap: 40,
      maneuverAnomaly: 10,
      aisGapSeverity: 0
    },

    track: [
      {
        lat: 15.00,
        lng: 73.50,
        time: '09:30 AM',
        aisOn: true
      },
      {
        lat: 15.15,
        lng: 73.35,
        time: '10:00 AM',
        aisOn: true
      },
      {
        lat: 15.30,
        lng: 73.20,
        time: '10:30 AM',
        aisOn: true
      },
      {
        lat: 15.45,
        lng: 73.05,
        time: '11:00 AM',
        aisOn: true
      },
      {
        lat: 15.60,
        lng: 72.90,
        time: '11:30 AM',
        aisOn: true
      },
      {
        lat: 15.75,
        lng: 72.75,
        time: '12:00 PM',
        aisOn: true
      }
    ]
  }
];


// ==================================================
// INCIDENT ALERTS
// ==================================================

export interface IncidentAlert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  time: string;
  areaName: string;
  read: boolean;
}


export const INITIAL_ALERTS: IncidentAlert[] = [

  {
    id: 'alert-1',

    type: 'CRITICAL',

    title:
      'Oil Spill Detected',

    description:
      'AI model has flagged a high-confidence spill anomaly (12.8 km²) in Sentinel-1 SAR observation.',

    time:
      '12 June 2024, 10:32 AM',

    areaName:
      'Gulf of Kutch',

    read:
      false
  },


  {
    id: 'alert-2',

    type: 'WARNING',

    title:
      'AIS Anomaly Detected',

    description:
      'MV OCEAN STAR (Crude Oil Tanker) lost AIS transmission near the monitored maritime corridor.',

    time:
      '12 June 2024, 10:42 AM',

    areaName:
      'Gulf of Kutch',

    read:
      false
  },


  {
    id: 'alert-3',

    type: 'INFO',

    title:
      'Satellite Pass Completed',

    description:
      'Sentinel-1 Radar pass completed successfully. Spatial data ingestion complete.',

    time:
      '27 Aug 2026, 10:30 AM',

    areaName:
      'Gulf of Kutch',

    read:
      true
  }
];