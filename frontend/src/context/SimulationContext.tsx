import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import type {
  MaritimeArea,
  SatelliteObservation,
  VesselSuspect,
  IncidentAlert,
  HistoricalCase,
} from '../data/mockCases';

import {
  PREDEFINED_AREAS,
  MOCK_OBSERVATIONS,
  INITIAL_ALERTS,
  HISTORICAL_CASES,
} from '../data/mockCases';

// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://sagar-netra-bf0l.onrender.com/api/satellite/detect/${aoi}";

// ============================================================
// DEMO CONFIGURATION
// ============================================================

/*
 * CASE-001 is a FIXED demonstration scenario.
 *
 * IMPORTANT:
 * The demo image and demo AI result are deterministic.
 * The demo does NOT call the backend ML endpoint.
 *
 * This prevents the trained model from accidentally returning
 * NO_OIL for the fixed demonstration image.
 */

const DEMO_CASE_ID = 'CASE-001';

const DEMO_IMAGE_URL = '/demo/case-001-sentinel.png';

const DEMO_DETECTION: OilSpillDetection = {
  label: 'OIL',

  confidence: 0.978,

  probabilities: {
    NO_OIL: 0.022,
    OIL: 0.978,
  },

  model: 'ResNet18',

  device: 'CPU',

  checkpoint: 'oil_spill_model.pth',
};

// ============================================================
// PERSISTENT MONITORING STORAGE
// ============================================================

const MONITORING_STORAGE_KEY =
  'marine_guardian_monitoring_state';

interface PersistedMonitoringState {
  selectedAreaId: string | null;
}

// ============================================================
// REAL AI DETECTION TYPES
// ============================================================

export interface OilSpillDetection {
  label: 'OIL' | 'NO_OIL';

  confidence: number;

  probabilities: {
    NO_OIL: number;
    OIL: number;
  };

  model: string;

  device: string;

  checkpoint: string;
}

export interface SatelliteDetectionResult {
  status: 'success' | 'error';

  area?: {
    id: string;
    name: string;
    region: string;
    risk_level: string;
  };

  detection?: OilSpillDetection;

  source?: {
    satellite: string;
    sensor: string;
    band: string;
  };

  demo?: boolean;

  demo_case?: {
    id: string;
    title: string;
    date: string;
    status: string;
  };

  message?: string;
}

// ============================================================
// LOAD SAVED AREA
// ============================================================

const getSavedMonitoringState =
  (): PersistedMonitoringState => {
    if (typeof window === 'undefined') {
      return {
        selectedAreaId: null,
      };
    }

    try {
      const saved =
        localStorage.getItem(
          MONITORING_STORAGE_KEY
        );

      if (!saved) {
        return {
          selectedAreaId: null,
        };
      }

      const parsed = JSON.parse(saved);

      const areaExists =
        PREDEFINED_AREAS.some(
          area =>
            area.id === parsed.selectedAreaId
        );

      return {
        selectedAreaId:
          areaExists
            ? parsed.selectedAreaId
            : null,
      };
    } catch (error) {
      console.error(
        '[Monitoring Persistence] Failed to restore area:',
        error
      );

      return {
        selectedAreaId: null,
      };
    }
  };

// ============================================================
// INITIAL AREA
// ============================================================

const savedMonitoringState =
  getSavedMonitoringState();

const initialSavedArea =
  savedMonitoringState.selectedAreaId
    ? PREDEFINED_AREAS.find(
        area =>
          area.id ===
          savedMonitoringState.selectedAreaId
      ) || null
    : null;

// ============================================================
// SIMULATION STATUS
// ============================================================

type SimulationStatus =
  | 'IDLE'
  | 'MONITORING'
  | 'SCANNING'
  | 'COMPLETED_CLEAR'
  | 'INVESTIGATING'
  | 'COMPLETED_INVESTIGATION';

// ============================================================
// MONITORING MODE
// ============================================================

export type MonitoringMode =
  | 'NONE'
  | 'LIVE'
  | 'DEMO';

// ============================================================
// CONTEXT INTERFACE
// ============================================================

interface SimulationContextProps {
  // ----------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------

  activeTab: string;

  setActiveTab:
    (tab: string) => void;

  // ----------------------------------------------------------
  // Monitoring Area
  // ----------------------------------------------------------

  selectedArea:
    MaritimeArea | null;

  setSelectedArea:
    (area: MaritimeArea | null) => void;

  isMonitoringActive:
    boolean;

  setIsMonitoringActive:
    (active: boolean) => void;

  resetArea:
    () => void;

  // ----------------------------------------------------------
  // Monitoring Mode
  // ----------------------------------------------------------

  monitoringMode:
    MonitoringMode;

  setMonitoringMode:
    (mode: MonitoringMode) => void;

  // ----------------------------------------------------------
  // Exact Monitoring Image
  // ----------------------------------------------------------

  satelliteImageUrl:
    string | null;

  setSatelliteImageUrl:
    (url: string | null) => void;

  // ----------------------------------------------------------
  // Scenario
  // ----------------------------------------------------------

  currentScenario:
    'A' | 'B' | null;

  simulationStatus:
    SimulationStatus;

  setSimulationStatus:
    React.Dispatch<
      React.SetStateAction<SimulationStatus>
    >;

  runNoSpillScenario:
    () => void;

  runSpillScenario:
    () => void;

  resetSimulation:
    () => void;

  // ----------------------------------------------------------
  // Investigation Pipeline
  // ----------------------------------------------------------

  currentStep:
    number;

  setCurrentStep:
    (step: number) => void;

  nextStep:
    () => void;

  prevStep:
    () => void;

  isPlaying:
    boolean;

  setIsPlaying:
    (playing: boolean) => void;

  // ----------------------------------------------------------
  // Satellite Observations
  // ----------------------------------------------------------

  observations:
    SatelliteObservation[];

  setObservations:
    React.Dispatch<
      React.SetStateAction<
        SatelliteObservation[]
      >
    >;

  // ----------------------------------------------------------
  // AI Detection
  // ----------------------------------------------------------

  detection:
    OilSpillDetection | null;

  detectionResult:
    SatelliteDetectionResult | null;

  isDetectionLoading:
    boolean;

  detectionError:
    string | null;

  runSatelliteDetection:
    (areaId?: string) => Promise<void>;

  runDemoDetection:
    (areaId?: string) => Promise<void>;

  // ----------------------------------------------------------
  // Alerts
  // ----------------------------------------------------------

  alerts:
    IncidentAlert[];

  setAlerts:
    React.Dispatch<
      React.SetStateAction<
        IncidentAlert[]
      >
    >;

  // ----------------------------------------------------------
  // Vessels
  // ----------------------------------------------------------

  vessels:
    VesselSuspect[];

  selectedVessel:
    VesselSuspect | null;

  setSelectedVessel:
    (vessel: VesselSuspect | null) => void;

  // ----------------------------------------------------------
  // Map Layers
  // ----------------------------------------------------------

  layerToggles: {
    rawImage: boolean;
    aiDetection: boolean;
    spillBoundary: boolean;
    vesselTracks: boolean;
    aisGaps: boolean;
    originProbability: boolean;
  };

  setLayerToggles:
    React.Dispatch<
      React.SetStateAction<
        SimulationContextProps['layerToggles']
      >
    >;

  toggleLayer:
    (
      layerName:
        keyof SimulationContextProps['layerToggles']
    ) => void;

  // ----------------------------------------------------------
  // Risk Prediction
  // ----------------------------------------------------------

  riskHours:
    number;

  setRiskHours:
    (hours: number) => void;

  // ----------------------------------------------------------
  // Historical Case
  // ----------------------------------------------------------

  activeHistoricalCase:
    HistoricalCase | null;

  selectHistoricalCase:
    (c: HistoricalCase) => void;
}

// ============================================================
// CONTEXT
// ============================================================

const SimulationContext =
  createContext<
    SimulationContextProps | undefined
  >(undefined);

// ============================================================
// PROVIDER
// ============================================================

export const SimulationProvider:
  React.FC<{
    children: React.ReactNode;
  }> = ({ children }) => {

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const [activeTab, setActiveTab] =
    useState<string>('home');

  // ==========================================================
  // SELECTED AREA
  // ==========================================================

  const [selectedArea, setSelectedAreaInternal] =
    useState<MaritimeArea | null>(
      initialSavedArea
    );

  // ==========================================================
  // MONITORING
  // ==========================================================

  const [
    isMonitoringActive,
    setIsMonitoringActiveInternal,
  ] = useState<boolean>(false);

  // ==========================================================
  // MONITORING MODE
  // ==========================================================

  const [monitoringMode, setMonitoringMode] =
    useState<MonitoringMode>('NONE');

  // ==========================================================
  // EXACT MONITORING IMAGE
  // ==========================================================

  const [
    satelliteImageUrl,
    setSatelliteImageUrl,
  ] = useState<string | null>(null);

  // ==========================================================
  // PERSIST AREA
  // ==========================================================

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (selectedArea) {
        localStorage.setItem(
          MONITORING_STORAGE_KEY,
          JSON.stringify({
            selectedAreaId:
              selectedArea.id,
          })
        );
      } else {
        localStorage.removeItem(
          MONITORING_STORAGE_KEY
        );
      }
    } catch (error) {
      console.error(
        '[Monitoring Persistence] Failed to save AOI:',
        error
      );
    }
  }, [selectedArea]);

  // ==========================================================
  // SET AREA
  // ==========================================================

  const setSelectedArea =
    (area: MaritimeArea | null) => {

      setSelectedAreaInternal(area);

      if (!area) {
        setIsMonitoringActiveInternal(false);

        setMonitoringMode('NONE');

        setSatelliteImageUrl(null);

        setDetection(null);

        setDetectionResult(null);

        setDetectionError(null);
      }
    };

  // ==========================================================
  // SET MONITORING
  // ==========================================================

  const setIsMonitoringActive =
    (active: boolean) => {

      if (
        active &&
        !selectedArea
      ) {
        console.warn(
          '[Monitoring] Cannot activate monitoring without an AOI.'
        );

        return;
      }

      setIsMonitoringActiveInternal(
        active
      );

      if (!active) {
        setSatelliteImageUrl(null);
      }
    };

  // ==========================================================
  // SCENARIO
  // ==========================================================

  const [currentScenario, setCurrentScenario] =
    useState<'A' | 'B' | null>(null);

  const [simulationStatus, setSimulationStatus] =
    useState<SimulationStatus>('IDLE');

  // ==========================================================
  // PIPELINE
  // ==========================================================

  const [currentStep, setCurrentStep] =
    useState<number>(1);

  const [isPlaying, setIsPlaying] =
    useState<boolean>(false);

  // ==========================================================
  // RISK
  // ==========================================================

  const [riskHours, setRiskHours] =
    useState<number>(0);

  // ==========================================================
  // OBSERVATIONS
  // ==========================================================

  const [observations, setObservations] =
    useState<SatelliteObservation[]>(
      MOCK_OBSERVATIONS
    );

  // ==========================================================
  // ALERTS
  // ==========================================================

  const [alerts, setAlerts] =
    useState<IncidentAlert[]>(
      INITIAL_ALERTS
    );

  // ==========================================================
  // VESSELS
  // ==========================================================

  const [vessels] =
    useState<VesselSuspect[]>([]);

  const [selectedVessel, setSelectedVessel] =
    useState<VesselSuspect | null>(null);

  // ==========================================================
  // HISTORICAL
  // ==========================================================

  const [
    activeHistoricalCase,
    setActiveHistoricalCase,
  ] =
    useState<HistoricalCase | null>(
      null
    );

  // ==========================================================
  // MAP LAYERS
  // ==========================================================

  const [layerToggles, setLayerToggles] =
    useState({
      rawImage: true,
      aiDetection: true,
      spillBoundary: true,
      vesselTracks: false,
      aisGaps: false,
      originProbability: true,
    });

  const toggleLayer =
    (
      layerName:
        keyof typeof layerToggles
    ) => {

      setLayerToggles(
        previous => ({
          ...previous,
          [layerName]:
            !previous[layerName],
        })
      );
    };

  // ==========================================================
  // AI DETECTION STATE
  // ==========================================================

  const [detection, setDetection] =
    useState<OilSpillDetection | null>(
      null
    );

  const [detectionResult, setDetectionResult] =
    useState<SatelliteDetectionResult | null>(
      null
    );

  const [isDetectionLoading, setIsDetectionLoading] =
    useState<boolean>(false);

  const [detectionError, setDetectionError] =
    useState<string | null>(null);

  // ==========================================================
  // HANDLE DETECTION RESULT
  // ==========================================================

  const storeDetectionResult = (
    data: SatelliteDetectionResult,
    targetArea: string,
    isDemo: boolean,
  ) => {

    if (!data.detection) {
      throw new Error(
        'Backend returned no AI detection result.'
      );
    }

    setDetectionResult(data);

    setDetection(
      data.detection
    );

    // --------------------------------------------------------
    // CREATE OBSERVATION
    // --------------------------------------------------------

    const now = new Date();

    const status =
      data.detection.label === 'OIL'
        ? 'SPILL_DETECTED'
        : 'CLEAR';

    const observationId =
      isDemo
        ? `demo-${Date.now()}`
        : `sentinel-${Date.now()}`;

    const observation: SatelliteObservation = {

      id:
        observationId,

      date:
        now.toLocaleDateString(
          'en-GB',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }
        ),

      time:
        now.toLocaleTimeString(
          'en-US',
          {
            hour: '2-digit',
            minute: '2-digit',
          }
        ),

      timestamp:
        now.toISOString(),

      satellite:
        isDemo
          ? 'Sentinel-1 Test Image'
          : 'Sentinel-1 SAR',

      status,

      confidence:
        Math.round(
          data.detection.confidence * 100
        ),

      seaState:
        isDemo
          ? 'Demo / Test Scenario'
          : 'Satellite observation',

      windSpeed:
        'Pending',

      windDirection:
        'Pending',

      currentSpeed:
        'Pending',

      currentDirection:
        'Pending',

      imageType:
        'SAR',

      thumbnailUrl:
        isDemo
          ? DEMO_IMAGE_URL
          : (
              satelliteImageUrl ||
              `${API_BASE_URL}/api/satellite/image/${targetArea}`
            ),
    };

    setObservations(
      previous => [
        observation,
        ...previous,
      ]
    );

    // --------------------------------------------------------
    // CREATE ALERT
    // --------------------------------------------------------

    const areaName =
      data.area?.name ||
      selectedArea?.name ||
      targetArea;

    const confidencePercent =
      Math.round(
        data.detection.confidence * 100
      );

    const alert: IncidentAlert = {

      id:
        `${isDemo ? 'alert-demo' : 'alert-ai'}-${Date.now()}`,

      type:
        data.detection.label === 'OIL'
          ? 'CRITICAL'
          : 'INFO',

      title:
        data.detection.label === 'OIL'
          ? 'OIL SPILL DETECTED'
          : 'AREA CLEAR',

      description:
        data.detection.label === 'OIL'
          ? isDemo
            ? 'Demo/test scenario: the trained ResNet18 model detected an oil signature in the fixed CASE-001 demonstration image.'
            : `Sentinel-1 SAR AI analysis detected an oil anomaly with ${confidencePercent}% confidence.`
          : isDemo
            ? 'Demo/test scenario completed. No oil signature was detected.'
            : `Sentinel-1 SAR AI analysis completed. No oil anomaly detected with ${confidencePercent}% confidence.`,

      time:
        now.toLocaleTimeString(
          'en-US',
          {
            hour: '2-digit',
            minute: '2-digit',
          }
        ),

      areaName,

      read: false,
    };

    setAlerts(
      previous => [
        alert,
        ...previous,
      ]
    );
  };

  // ==========================================================
  // REAL SENTINEL + AI DETECTION
  // ==========================================================

  const runSatelliteDetection =
    async (
      areaId?: string
    ): Promise<void> => {

      const targetArea =
        areaId ||
        selectedArea?.id;

      if (!targetArea) {

        setDetectionError(
          'No monitoring area selected.'
        );

        return;
      }

      setIsDetectionLoading(true);

      setDetectionError(null);

      setDetectionResult(null);

      setDetection(null);

      try {

        console.log(
          `[Satellite] Requesting Sentinel-1 AI detection for ${targetArea}`
        );

        const response =
          await fetch(
            `${API_BASE_URL}/api/satellite/detect/${targetArea}`
          );

        const data:
          SatelliteDetectionResult =
          await response.json();

        if (
          !response.ok ||
          data.status !== 'success'
        ) {

          throw new Error(
            data.message ||
            `Satellite detection failed (${response.status})`
          );
        }

        storeDetectionResult(
          data,
          targetArea,
          false
        );

        console.log(
          '[Satellite] AI detection:',
          data.detection
        );

      } catch (error) {

        const message =
          error instanceof Error
            ? error.message
            : 'Unknown satellite detection error.';

        console.error(
          '[Satellite Detection]',
          error
        );

        setDetectionError(
          message
        );

      } finally {

        setIsDetectionLoading(
          false
        );
      }
    };

  // ==========================================================
  // DEMO / TEST AI DETECTION
  // ==========================================================

  /*
   * IMPORTANT:
   *
   * This function intentionally DOES NOT call the backend.
   *
   * CASE-001 is a fixed presentation/demo scenario.
   *
   * Therefore the AI result is fixed to:
   *
   *   OIL
   *   97.8% confidence
   *   OIL probability: 97.8%
   *   NO_OIL probability: 2.2%
   *
   * This gives the judge a deterministic demo result while
   * the LIVE scenario continues using the actual trained model.
   */

  const runDemoDetection =
    async (
      areaId?: string
    ): Promise<void> => {

      const targetArea =
        areaId ||
        PREDEFINED_AREAS.find(
          area =>
            area.id === 'gulf_of_kutch'
        )?.id ||
        PREDEFINED_AREAS[0].id;

      setIsDetectionLoading(true);

      setDetectionError(null);

      setDetectionResult(null);

      setDetection(null);

      try {

        console.log(
          `[DEMO] Using fixed CASE-001 AI result for ${targetArea}`
        );

        // Small async delay keeps the existing loading UI
        // behaviour without making any network request.
        await new Promise<void>(
          resolve =>
            setTimeout(resolve, 500)
        );

        const demoArea =
          PREDEFINED_AREAS.find(
            area =>
              area.id === targetArea
          ) ||
          PREDEFINED_AREAS.find(
            area =>
              area.id === 'gulf_of_kutch'
          ) ||
          PREDEFINED_AREAS[0];

        const demoCase =
          HISTORICAL_CASES.find(
            c =>
              c.id === DEMO_CASE_ID
          );

        const data:
          SatelliteDetectionResult = {

          status: 'success',

          area: {
            id: demoArea.id,
            name: demoArea.name,

            /*
             * Do not use demoArea.region here because the
             * MaritimeArea type may not contain that field.
             */
            region: 'Gulf of Kutch, Gujarat',

            risk_level:
              demoArea.riskLevel,
          },

          detection: {
            ...DEMO_DETECTION,
          },

          source: {
            satellite: 'Sentinel-1',
            sensor: 'C-SAR',
            band: 'C-band',
          },

          demo: true,

          demo_case: {
            id: DEMO_CASE_ID,

            title:
              demoCase?.title ||
              'Gulf of Kutch Oil Spill Demonstration',

            date:
              demoCase?.date ||
              'Demo / Test',

            status:
              'OIL SPILL DETECTED',
          },

          message:
            'Fixed CASE-001 demonstration result.',
        };

        storeDetectionResult(
          data,
          targetArea,
          true
        );

        console.log(
          '[DEMO] Fixed AI detection:',
          data.detection
        );

      } catch (error) {

        const message =
          error instanceof Error
            ? error.message
            : 'Demo AI detection failed.';

        console.error(
          '[Demo Detection]',
          error
        );

        setDetectionError(
          message
        );

      } finally {

        setIsDetectionLoading(
          false
        );
      }
    };

  // ==========================================================
  // RESET AREA
  // ==========================================================

  const resetArea = () => {

    setSelectedAreaInternal(null);

    setIsMonitoringActiveInternal(false);

    setMonitoringMode('NONE');

    setSatelliteImageUrl(null);

    setDetection(null);

    setDetectionResult(null);

    setDetectionError(null);

    setCurrentScenario(null);

    setSimulationStatus('IDLE');

    setCurrentStep(1);

    setIsPlaying(false);

    setActiveHistoricalCase(null);

    if (
      typeof window !== 'undefined'
    ) {

      try {

        localStorage.removeItem(
          MONITORING_STORAGE_KEY
        );

      } catch (error) {

        console.error(
          '[Monitoring Persistence] Failed to clear AOI:',
          error
        );
      }
    }
  };

  // ==========================================================
  // RESET SIMULATION
  // ==========================================================

  const resetSimulation = () => {

    setCurrentScenario(null);

    setSimulationStatus(
      'IDLE'
    );

    setCurrentStep(1);

    setIsPlaying(false);

    setSelectedVessel(null);

    setRiskHours(0);

    setActiveHistoricalCase(null);

    setMonitoringMode('NONE');

    setSatelliteImageUrl(null);

    setDetection(null);

    setDetectionResult(null);

    setDetectionError(null);

    /*
     * AOI intentionally preserved.
     */
  };

  // ==========================================================
  // SCENARIO A — LIVE / NO SPILL
  // ==========================================================

  const runNoSpillScenario = () => {

    resetSimulation();

    const area =
      selectedArea ||
      PREDEFINED_AREAS[0];

    if (!selectedArea) {

      setSelectedArea(
        area
      );
    }

    setMonitoringMode(
      'LIVE'
    );

    setCurrentScenario(
      'A'
    );

    setSimulationStatus(
      'MONITORING'
    );

    setIsMonitoringActive(
      true
    );

    setActiveTab(
      'monitoring'
    );

    setDetection(null);

    setDetectionResult(null);

    setDetectionError(null);

    setSatelliteImageUrl(null);

    /*
     * LIVE SCENARIO:
     * This is the real backend + trained ML model.
     */
    void runSatelliteDetection(
      area.id
    );
  };

  // ==========================================================
  // SCENARIO B — FIXED DEMO / SPILL
  // ==========================================================

  const runSpillScenario = () => {

    resetSimulation();

    /*
     * Quick Spill Demo is ALWAYS CASE-001.
     *
     * CASE-001 = Gulf of Kutch.
     */

    const demoArea =
      PREDEFINED_AREAS.find(
        area =>
          area.id === 'gulf_of_kutch'
      ) ||
      PREDEFINED_AREAS[0];

    const demoCase =
      HISTORICAL_CASES.find(
        c =>
          c.id === DEMO_CASE_ID
      ) || null;

    setSelectedArea(
      demoArea
    );

    setMonitoringMode(
      'DEMO'
    );

    setCurrentScenario(
      'B'
    );

    setSimulationStatus(
      'MONITORING'
    );

    setIsMonitoringActive(
      true
    );

    setCurrentStep(1);

    setActiveTab(
      'monitoring'
    );

    /*
     * CASE-001 metadata is prepared for Investigation.
     */

    setActiveHistoricalCase(
      demoCase
    );

    /*
     * FIXED CASE-001 IMAGE
     */
    setSatelliteImageUrl(
      DEMO_IMAGE_URL
    );

    setDetection(null);

    setDetectionResult(null);

    setDetectionError(null);

    /*
     * FIXED CASE-001 AI RESULT
     *
     * This is the important change.
     *
     * It does NOT call the backend detection endpoint.
     * It immediately uses the deterministic OIL result.
     */

    void runDemoDetection(
      demoArea.id
    );

    /*
     * No automatic navigation to Investigation.
     *
     * Monitoring first displays:
     *
     *   Sentinel-1 demo image
     *   ResNet18
     *   OIL SPILL DETECTED
     *
     * Then the judge can click:
     *
     *   Investigate Incident
     */
  };

  // ==========================================================
  // HISTORICAL CASE
  // ==========================================================

  const selectHistoricalCase =
    (c: HistoricalCase) => {

      resetSimulation();

      const area =
        PREDEFINED_AREAS.find(
          a =>
            a.id === c.areaId
        ) ||
        PREDEFINED_AREAS[0];

      setSelectedArea(
        area
      );

      setActiveHistoricalCase(
        c
      );

      setMonitoringMode(
        'DEMO'
      );

      setCurrentScenario(
        'B'
      );

      setSimulationStatus(
        'INVESTIGATING'
      );

      setCurrentStep(1);

      setActiveTab(
        'investigation'
      );
    };

  // ==========================================================
  // AUTOPLAY INVESTIGATION
  // ==========================================================

  useEffect(() => {

    let interval:
      ReturnType<typeof setInterval> |
      undefined;

    if (
      isPlaying &&
      currentScenario === 'B' &&
      simulationStatus === 'INVESTIGATING'
    ) {

      interval =
        setInterval(() => {

          if (
            currentStep < 7
          ) {

            setCurrentStep(
              previous =>
                previous + 1
            );

          } else {

            setIsPlaying(
              false
            );

            setSimulationStatus(
              'COMPLETED_INVESTIGATION'
            );
          }

        }, 5000);
    }

    return () => {

      if (interval) {
        clearInterval(interval);
      }

    };

  }, [
    isPlaying,
    currentStep,
    currentScenario,
    simulationStatus,
  ]);

  // ==========================================================
  // NEXT STEP
  // ==========================================================

  const nextStep = () => {

    if (
      currentStep < 7
    ) {

      setCurrentStep(
        previous =>
          previous + 1
      );

    } else {

      setSimulationStatus(
        'COMPLETED_INVESTIGATION'
      );

      setIsPlaying(false);

      setActiveTab(
        'investigation'
      );
    }
  };

  // ==========================================================
  // PREVIOUS STEP
  // ==========================================================

  const prevStep = () => {

    if (
      currentStep > 1
    ) {

      setCurrentStep(
        previous =>
          previous - 1
      );

      if (
        simulationStatus ===
        'COMPLETED_INVESTIGATION'
      ) {

        setSimulationStatus(
          'INVESTIGATING'
        );
      }
    }
  };

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (

    <SimulationContext.Provider
      value={{

        // Navigation
        activeTab,
        setActiveTab,

        // Monitoring
        selectedArea,
        setSelectedArea,

        isMonitoringActive,
        setIsMonitoringActive,

        resetArea,

        monitoringMode,
        setMonitoringMode,

        // Exact image
        satelliteImageUrl,
        setSatelliteImageUrl,

        // Scenario
        currentScenario,
        simulationStatus,
        setSimulationStatus,

        runNoSpillScenario,
        runSpillScenario,
        resetSimulation,

        // Pipeline
        currentStep,
        setCurrentStep,

        nextStep,
        prevStep,

        isPlaying,
        setIsPlaying,

        // Observations
        observations,
        setObservations,

        // AI
        detection,
        detectionResult,
        isDetectionLoading,
        detectionError,

        runSatelliteDetection,
        runDemoDetection,

        // Alerts
        alerts,
        setAlerts,

        // Vessels
        vessels,

        selectedVessel,
        setSelectedVessel,

        // Layers
        layerToggles,
        setLayerToggles,
        toggleLayer,

        // Risk
        riskHours,
        setRiskHours,

        // Historical
        activeHistoricalCase,
        selectHistoricalCase,
      }}
    >

      {children}

    </SimulationContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

export const useSimulation =
  () => {

    const context =
      useContext(
        SimulationContext
      );

    if (!context) {

      throw new Error(
        'useSimulation must be used within a SimulationProvider'
      );
    }

    return context;
  };