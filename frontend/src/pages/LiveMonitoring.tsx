import React, { useEffect, useState } from 'react';

import {
  MapPin,
  Play,
  RotateCcw,
  Globe,
  Satellite,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Brain,
  RefreshCw,
  Search,
  FlaskConical,
  Radio,
  Crosshair,
  Waves,
  Database,
  ChevronRight,
} from 'lucide-react';

import { useSimulation } from '../context/SimulationContext';

import {
  PREDEFINED_AREAS,
} from '../data/mockCases';

import type {
  MaritimeArea,
} from '../data/mockCases';

import MaritimeMap from '../components/MaritimeMap';


// ==================================================
// BACKEND
// ==================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://sagar-netra-bf0l.onrender.com/api/satellite/detect/${aoi}';

// ==================================================
// COMPONENT
// ==================================================

export const LiveMonitoring: React.FC = () => {

  const {
    selectedArea,
    setSelectedArea,

    isMonitoringActive,
    setIsMonitoringActive,

    resetArea,
    resetSimulation,

    monitoringMode,
    setMonitoringMode,

    satelliteImageUrl,
    setSatelliteImageUrl,

    detection,
    isDetectionLoading,
    detectionError,

    runSatelliteDetection,
    runDemoDetection,

    setSimulationStatus,
    setActiveTab,
  } = useSimulation();


  // ==================================================
  // IMAGE STATE
  // ==================================================

  const [imageLoading, setImageLoading] =
    useState(false);

  const [imageError, setImageError] =
    useState<string | null>(null);


  // ==================================================
  // SELECT MONITORING AREA
  // ==================================================

  const handleSelectArea =
    (area: MaritimeArea) => {

      resetSimulation();

      setSelectedArea(area);

      setSatelliteImageUrl(null);

      setImageError(null);

      setImageLoading(false);
    };


  // ==================================================
  // FETCH MONITORING IMAGE
  // ==================================================

  const fetchMonitoringImage =
    async (area: MaritimeArea) => {

      if (imageLoading) {
        return;
      }

      setImageLoading(true);
      setImageError(null);

      try {

        const endpoint =
          monitoringMode === 'DEMO'
            ? `${API_BASE_URL}/api/demo/spill/image`
            : `${API_BASE_URL}/api/satellite/image/${area.id}`;

        console.log(
          monitoringMode === 'DEMO'
            ? '[DEMO] Requesting fixed CASE-001 test image.'
            : `[Sentinel-1] Requesting latest available image for ${area.name}`
        );

        const response =
          await fetch(endpoint);

        if (!response.ok) {

          let message =
            `Server returned ${response.status}`;

          try {

            const data =
              await response.json();

            if (data?.detail) {
              message = data.detail;
            }

            if (data?.message) {
              message = data.message;
            }

          } catch {
            // Ignore JSON parsing failure.
          }

          throw new Error(message);
        }

        const contentType =
          response.headers.get('content-type') || '';

        if (
          !contentType
            .toLowerCase()
            .includes('image')
        ) {
          throw new Error(
            'Backend did not return an image.'
          );
        }

        const blob =
          await response.blob();

        const imageUrl =
          URL.createObjectURL(blob);

        setSatelliteImageUrl(imageUrl);

      } catch (error) {

        console.error(
          '[Monitoring Image] Request failed:',
          error
        );

        setSatelliteImageUrl(null);

        setImageError(
          error instanceof Error
            ? error.message
            : 'Failed to retrieve monitoring image.'
        );

      } finally {

        setImageLoading(false);
      }
    };


  // ==================================================
  // RUN AI DETECTION
  // ==================================================

  const runDetection =
    async (area: MaritimeArea) => {

      if (isDetectionLoading) {
        return;
      }

      if (monitoringMode === 'DEMO') {

        await runDemoDetection(area.id);

        return;
      }

      if (monitoringMode === 'LIVE') {

        await runSatelliteDetection(area.id);
      }
    };


  // ==================================================
  // LOAD MONITORING DATA
  // ==================================================

  const loadMonitoringData =
    async (area: MaritimeArea) => {

      setImageError(null);

      console.log(
        `[Monitoring] Loading ${monitoringMode} data for ${area.name}`
      );

      await Promise.all([
        fetchMonitoringImage(area),
        runDetection(area),
      ]);
    };


  // ==================================================
  // AUTOMATIC MONITORING
  // ==================================================

  useEffect(() => {

    if (
      isMonitoringActive &&
      selectedArea &&
      (
        monitoringMode === 'LIVE' ||
        monitoringMode === 'DEMO'
      )
    ) {

      console.log(
        `[Monitoring] Started for ${selectedArea.name} (${monitoringMode})`
      );

      void loadMonitoringData(selectedArea);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isMonitoringActive,
    selectedArea?.id,
    monitoringMode,
  ]);


  // ==================================================
  // START MONITORING
  // ==================================================

  const handleStartMonitoring =
    () => {

      if (!selectedArea) {
        return;
      }

      setMonitoringMode('LIVE');

      setSatelliteImageUrl(null);

      setActiveTab('monitoring');

      setIsMonitoringActive(true);
    };


  // ==================================================
  // REFRESH
  // ==================================================

  const handleRefresh =
    () => {

      if (!selectedArea) {
        return;
      }

      if (
        imageLoading ||
        isDetectionLoading
      ) {
        return;
      }

      void loadMonitoringData(selectedArea);
    };


  // ==================================================
  // RESET AREA
  // ==================================================

  const handleResetArea =
    () => {

      console.log(
        '[Monitoring] Reset Area pressed.'
      );

      resetArea();

      setImageError(null);

      setImageLoading(false);
    };


  // ==================================================
  // AI HELPERS
  // ==================================================

  const isOilDetected =
    detection?.label === 'OIL';

  const detectionConfidence =
    detection?.confidence !== undefined
      ? Number(detection.confidence)
      : null;


  const formatProbability =
    (value: number | undefined) => {

      if (
        value === undefined ||
        !Number.isFinite(value)
      ) {
        return 'N/A';
      }

      return `${(value * 100).toFixed(2)}%`;
    };


  const formatConfidence =
    (value: number | null) => {

      if (
        value === null ||
        !Number.isFinite(value)
      ) {
        return 'N/A';
      }

      return `${(value * 100).toFixed(1)}%`;
    };


  // ==================================================
  // GO TO INVESTIGATION
  // ==================================================

  const handleInvestigate =
    () => {

      if (!isOilDetected) {
        return;
      }

      console.log(
        `[Investigation] Opening ${monitoringMode} investigation workspace.`
      );

      setSimulationStatus('INVESTIGATING');

      setActiveTab('investigation');
    };


  // ==================================================
  // RISK BADGE
  // ==================================================

  const getRiskBadge =
    (level: string) => {

      if (level === 'HIGH') {

        return {
          wrapper:
            'border-rose-200 bg-rose-50 text-rose-600',
          dot:
            'bg-rose-500',
        };
      }

      if (level === 'MEDIUM') {

        return {
          wrapper:
            'border-amber-200 bg-amber-50 text-amber-600',
          dot:
            'bg-amber-500',
        };
      }

      return {
        wrapper:
          'border-emerald-200 bg-emerald-50 text-emerald-600',
        dot:
          'bg-emerald-500',
      };
    };


  // ==================================================
  // AREA SELECTION SCREEN
  // ==================================================

  if (!isMonitoringActive) {

    return (

      <div className="min-h-screen bg-[#f4f9fc]">

        {/* Subtle blue atmosphere */}
        <div className="pointer-events-none absolute inset-x-0 top-[76px] h-72 bg-gradient-to-b from-[#e8f6fc] via-[#f4f9fc] to-transparent" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col px-6 pb-16 pt-8">

          {/* ==========================================
              PAGE HEADER
          ========================================== */}

          <div className="mx-auto mb-10 max-w-2xl text-center">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200 bg-white text-[#087fa8] shadow-[0_8px_30px_rgba(8,127,168,0.10)]">

              <Globe className="h-7 w-7" />

            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#087fa8] shadow-sm">

              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />

              Indian Maritime Surveillance

            </div>

            <h1 className="text-3xl font-black tracking-tight text-[#10213d] md:text-4xl">

              Select Monitoring Area

            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">

              Choose a predefined coastal corridor to initialize
              Sentinel-1 monitoring and automated AI-powered
              oil-spill detection.

            </p>

          </div>


          {/* ==========================================
              AOI CARDS
          ========================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {PREDEFINED_AREAS.map(
              (area) => {

                const isSelected =
                  selectedArea?.id === area.id;

                const risk =
                  getRiskBadge(area.riskLevel);

                return (

                  <button
                    key={area.id}
                    onClick={() =>
                      handleSelectArea(area)
                    }
                    className={[
                      'group relative overflow-hidden rounded-2xl border bg-white p-6 text-left transition-all duration-300',
                      isSelected
                        ? 'border-[#0877a4] shadow-[0_15px_45px_rgba(8,119,164,0.16)] ring-4 ring-cyan-500/10'
                        : 'border-slate-200 shadow-[0_8px_30px_rgba(15,50,80,0.05)] hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_15px_40px_rgba(8,127,168,0.10)]',
                    ].join(' ')}
                  >

                    {/* Selected accent */}
                    {isSelected && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 to-[#075985]" />
                    )}

                    <div className="flex items-center justify-between">

                      <div
                        className={[
                          'flex h-11 w-11 items-center justify-center rounded-xl transition-all',
                          isSelected
                            ? 'bg-[#075985] text-white shadow-lg shadow-blue-900/15'
                            : 'bg-[#eef8fc] text-[#087fa8] group-hover:bg-[#e0f4fa]',
                        ].join(' ')}
                      >

                        <MapPin className="h-5 w-5" />

                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider ${risk.wrapper}`}
                      >

                        <span
                          className={`h-1.5 w-1.5 rounded-full ${risk.dot}`}
                        />

                        {area.riskLevel} RISK

                      </span>

                    </div>


                    <div className="mt-5">

                      <h3 className="text-lg font-extrabold tracking-tight text-[#14243d] group-hover:text-[#0877a4]">

                        {area.name}

                      </h3>

                      <p className="mt-1.5 text-[11px] leading-5 text-slate-500">

                        {area.subtitle}

                      </p>

                    </div>


                    <div className="my-5 h-px bg-slate-100" />


                    <div className="space-y-3 text-[10px]">

                      <div>

                        <span className="mb-1 block uppercase tracking-widest text-slate-400">
                          Boundary
                        </span>

                        <span className="font-mono leading-5 text-slate-700">
                          {area.coordinatesLabel}
                        </span>

                      </div>


                      <div className="flex items-center justify-between">

                        <span className="text-slate-400">
                          Coverage
                        </span>

                        <span className="font-mono font-bold text-slate-700">
                          {area.sizeLabel}
                        </span>

                      </div>


                      <div className="flex items-start justify-between gap-5">

                        <span className="text-slate-400">
                          Traffic
                        </span>

                        <span className="max-w-[180px] text-right font-mono font-bold leading-4 text-slate-700">
                          {area.trafficLevel}
                        </span>

                      </div>

                    </div>


                    <div
                      className={[
                        'mt-5 flex items-center justify-between border-t pt-4',
                        isSelected
                          ? 'border-cyan-100'
                          : 'border-slate-100',
                      ].join(' ')}
                    >

                      <span
                        className={[
                          'text-[9px] font-bold uppercase tracking-widest',
                          isSelected
                            ? 'text-[#0877a4]'
                            : 'text-slate-400',
                        ].join(' ')}
                      >
                        {isSelected
                          ? 'Area Selected'
                          : 'Select AOI'}
                      </span>

                      <ChevronRight
                        className={[
                          'h-4 w-4 transition-transform',
                          isSelected
                            ? 'text-[#0877a4]'
                            : 'text-slate-300 group-hover:translate-x-1 group-hover:text-[#0877a4]',
                        ].join(' ')}
                      />

                    </div>


                    {isSelected && (

                      <div className="absolute right-0 top-0 rounded-bl-xl bg-[#075985] px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider text-white">
                        Selected
                      </div>

                    )}

                  </button>

                );
              }
            )}

          </div>


          {/* ==========================================
              START MONITORING
          ========================================== */}

          <div className="mt-9 flex justify-center">

            <button
              onClick={handleStartMonitoring}
              disabled={!selectedArea}
              className={[
                'group inline-flex items-center gap-3 rounded-xl px-8 py-4 text-xs font-bold uppercase tracking-[0.12em] transition-all',
                selectedArea
                  ? 'bg-gradient-to-r from-[#087fa8] to-[#075985] text-white shadow-[0_10px_30px_rgba(8,95,135,0.22)] hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(8,95,135,0.28)]'
                  : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400',
              ].join(' ')}
            >

              <Play className="h-4 w-4 fill-current" />

              Start Monitoring Region

              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />

            </button>

          </div>


          {/* Bottom technical strip */}

          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">

            <span className="flex items-center gap-2">
              <Satellite className="h-3.5 w-3.5 text-cyan-600" />
              Sentinel-1 C-SAR
            </span>

            <span className="h-1 w-1 rounded-full bg-slate-300" />

            <span className="flex items-center gap-2">
              <Brain className="h-3.5 w-3.5 text-cyan-600" />
              ResNet18 AI
            </span>

            <span className="h-1 w-1 rounded-full bg-slate-300" />

            <span className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-cyan-600" />
              Satellite Intelligence
            </span>

          </div>

        </div>

      </div>
    );
  }


  // ==================================================
  // ACTIVE MONITORING
  // ==================================================

  return (

    <div className="min-h-screen bg-[#f3f8fb]">

      {/* ==============================================
          BLUE ATMOSPHERE
      ============================================== */}

      <div className="pointer-events-none absolute inset-x-0 top-[76px] h-48 bg-gradient-to-b from-[#e8f5fa] to-transparent" />


      <div className="relative mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-5 pb-12 pt-6 lg:px-7">


        {/* ==============================================
            DEMO MODE BANNER
        ============================================== */}

        {monitoringMode === 'DEMO' && (

          <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white shadow-sm">

            <div className="flex items-center gap-4 px-5 py-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-100 text-amber-600">

                <FlaskConical className="h-5 w-5" />

              </div>

              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-2">

                  <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-800">

                    Demo / Test Scenario

                  </h3>

                  <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-800">

                    CASE-001

                  </span>

                </div>

                <p className="mt-1 text-[10px] leading-5 text-amber-700/75">

                  Fixed CASE-001 demonstration image processed by
                  the trained ResNet18 oil-spill classification model.
                  This is not a current live Sentinel-1 observation.

                </p>

              </div>

            </div>

          </div>

        )}


        {/* ==============================================
            ACTIVE AOI STATUS BAR
        ============================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,50,80,0.05)]">

          <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">

            <div className="flex items-center gap-4">

              <div className="relative flex h-10 w-10 items-center justify-center">

                <span className="absolute h-4 w-4 animate-ping rounded-full bg-cyan-400/30" />

                <span className="relative h-3 w-3 rounded-full bg-cyan-600 shadow-[0_0_0_5px_rgba(8,127,168,0.08)]" />

              </div>

              <div>

                <div className="flex items-center gap-2">

                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#087fa8]">

                    {monitoringMode === 'DEMO'
                      ? 'Demo Monitoring AOI'
                      : 'Active Monitoring AOI'}

                  </span>

                  <span className="h-1 w-1 rounded-full bg-slate-300" />

                  <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-emerald-600">

                    <Radio className="h-3 w-3" />

                    Online

                  </span>

                </div>

                <h2 className="mt-0.5 text-base font-black tracking-tight text-[#14243d]">

                  {selectedArea?.name}

                </h2>

                <p className="mt-0.5 font-mono text-[9px] text-slate-400">

                  {selectedArea?.coordinatesLabel}

                </p>

              </div>

            </div>


            <div className="flex gap-2">

              <button
                onClick={handleRefresh}
                disabled={
                  imageLoading ||
                  isDetectionLoading
                }
                className="group inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-xs font-bold text-[#0877a4] transition-all hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <RefreshCw
                  className={[
                    'h-3.5 w-3.5',
                    imageLoading ||
                    isDetectionLoading
                      ? 'animate-spin'
                      : 'group-hover:rotate-90 transition-transform',
                  ].join(' ')}
                />

                Refresh

              </button>


              <button
                onClick={handleResetArea}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
              >

                <RotateCcw className="h-3.5 w-3.5" />

                Reset Area

              </button>

            </div>

          </div>

        </div>


        {/* ==============================================
            MAIN WORKSPACE
        ============================================== */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">


          {/* ==========================================
              SENTINEL-1 CARD
          ========================================== */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,50,80,0.06)]">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f7fc] text-[#087fa8]">

                  <Satellite className="h-5 w-5" />

                </div>

                <div>

                  <div className="flex items-center gap-2">

                    <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#14243d]">

                      Sentinel-1 SAR

                    </h3>

                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />

                  </div>

                  <p className="mt-0.5 text-[9px] text-slate-400">

                    {monitoringMode === 'DEMO'
                      ? 'Fixed CASE-001 demonstration test image'
                      : 'Latest available Sentinel-1 observation'}

                  </p>

                </div>

              </div>


              {monitoringMode === 'DEMO' ? (

                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-amber-700">

                  Demo / Test

                </span>

              ) : satelliteImageUrl ? (

                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-emerald-600">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  Real Data

                </span>

              ) : null}

            </div>


            {/* Image viewport */}

            <div className="relative flex h-[460px] items-center justify-center overflow-hidden bg-[#071827]">

              {/* Technical viewport grid */}

              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />


              {/* Top left viewport marker */}

              <div className="absolute left-4 top-4 z-10 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 backdrop-blur-md">

                <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-cyan-300">

                  <Crosshair className="h-3 w-3" />

                  SAR ANALYSIS VIEW

                </div>

              </div>


              {/* Bottom right sensor label */}

              <div className="absolute bottom-4 right-4 z-10 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 font-mono text-[8px] text-slate-300 backdrop-blur-md">

                S1-C / C-SAR

              </div>


              {imageLoading && (

                <div className="relative z-10 flex flex-col items-center gap-4 text-center text-white">

                  <div className="relative">

                    <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/15 border-t-cyan-400" />

                    <Satellite className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-cyan-300" />

                  </div>

                  <div>

                    <p className="text-sm font-bold">

                      {monitoringMode === 'DEMO'
                        ? 'Loading demonstration image'
                        : 'Retrieving satellite observation'}

                    </p>

                    <p className="mt-1 text-[9px] text-slate-400">

                      {monitoringMode === 'DEMO'
                        ? 'Sagar Netra → CASE-001'
                        : 'Sentinel Hub → Process API'}

                    </p>

                  </div>

                </div>

              )}


              {!imageLoading &&
                imageError && (

                  <div className="relative z-10 max-w-md px-6 text-center">

                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">

                      <AlertTriangle className="h-6 w-6" />

                    </div>

                    <p className="text-sm font-bold text-white">

                      Monitoring image unavailable

                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-400">

                      {imageError}

                    </p>

                  </div>

                )}


              {!imageLoading &&
                !imageError &&
                satelliteImageUrl && (

                  <img
                    src={satelliteImageUrl}
                    alt={
                      monitoringMode === 'DEMO'
                        ? 'CASE-001 Sentinel-1 SAR demonstration image'
                        : `Latest available Sentinel-1 SAR observation of ${selectedArea?.name}`
                    }
                    className="relative z-[1] h-full w-full object-contain"
                  />

                )}


              {!imageLoading &&
                !imageError &&
                !satelliteImageUrl && (

                  <div className="relative z-10 text-center text-slate-400">

                    <Satellite className="mx-auto mb-3 h-12 w-12 opacity-40" />

                    <p className="text-sm">
                      Waiting for satellite observation
                    </p>

                  </div>

                )}

            </div>


            {/* Metadata */}

            <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-slate-100 bg-white px-5 py-5">

              <div>

                <span className="mb-1 block text-[8px] font-bold uppercase tracking-widest text-slate-400">
                  Sensor
                </span>

                <strong className="font-mono text-[10px] text-slate-800">
                  Sentinel-1 C-SAR
                </strong>

              </div>


              <div>

                <span className="mb-1 block text-[8px] font-bold uppercase tracking-widest text-slate-400">
                  AOI
                </span>

                <strong className="text-[10px] font-bold text-slate-800">
                  {selectedArea?.name}
                </strong>

              </div>


              <div>

                <span className="mb-1 block text-[8px] font-bold uppercase tracking-widest text-slate-400">
                  Status
                </span>

                <strong
                  className={[
                    'font-mono text-[10px]',
                    satelliteImageUrl
                      ? 'text-emerald-600'
                      : imageLoading
                        ? 'text-cyan-600'
                        : imageError
                          ? 'text-rose-600'
                          : 'text-slate-500',
                  ].join(' ')}
                >
                  {satelliteImageUrl
                    ? 'IMAGE RECEIVED'
                    : imageLoading
                      ? 'FETCHING...'
                      : imageError
                        ? 'ERROR'
                        : 'STANDBY'}
                </strong>

              </div>


              <div>

                <span className="mb-1 block text-[8px] font-bold uppercase tracking-widest text-slate-400">
                  Source
                </span>

                <strong className="font-mono text-[10px] text-slate-800">

                  {monitoringMode === 'DEMO'
                    ? 'Sagar Netra Demo/Test'
                    : 'Copernicus / Sentinel Hub'}

                </strong>

              </div>

            </div>

          </div>


          {/* ==========================================
              MARITIME MAP
          ========================================== */}

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,50,80,0.06)]">

            {/* Map header overlay */}

            <div className="pointer-events-none absolute left-4 top-4 z-20">

              <div className="rounded-xl border border-white/80 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md">

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f7fc] text-[#087fa8]">

                    <MapPin className="h-3.5 w-3.5" />

                  </div>

                  <div>

                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#087fa8]">
                      Investigation Map
                    </p>

                    <p className="mt-0.5 text-[10px] font-bold text-slate-700">
                      {selectedArea?.name}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* Map */}

            <div className="h-[620px] w-full">

              <MaritimeMap />

            </div>

          </div>

        </div>


        {/* ==============================================
            STATUS CARDS
        ============================================== */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">


          {/* ==========================================
              MONITORING STATUS
          ========================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,50,80,0.05)]">

            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf7fc] text-[#087fa8]">

                  <Activity className="h-4 w-4" />

                </div>

                <h3 className="text-xs font-black uppercase tracking-[0.12em] text-[#14243d]">

                  Monitoring Status

                </h3>

              </div>

              <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-emerald-600">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                {monitoringMode === 'DEMO'
                  ? 'Demo'
                  : 'Active'}

              </span>

            </div>


            <div className="space-y-4 font-mono text-[10px]">

              <div className="flex items-center justify-between gap-4">

                <span className="text-slate-400">
                  Target AOI
                </span>

                <strong className="text-right text-slate-800">
                  {selectedArea?.name}
                </strong>

              </div>

              <div className="flex items-center justify-between gap-4">

                <span className="text-slate-400">
                  Coverage
                </span>

                <strong className="text-slate-800">
                  {selectedArea?.sizeLabel}
                </strong>

              </div>

              <div className="flex items-center justify-between gap-4">

                <span className="text-slate-400">
                  Sensor
                </span>

                <strong className="text-right text-slate-800">
                  Sentinel-1 C-SAR
                </strong>

              </div>

              <div className="flex items-center justify-between gap-4">

                <span className="text-slate-400">
                  Source
                </span>

                <span className="font-bold text-[#087fa8]">

                  {monitoringMode === 'DEMO'
                    ? 'Demo / Test'
                    : satelliteImageUrl
                      ? 'Sentinel Hub'
                      : imageLoading
                        ? 'Fetching'
                        : 'Standby'}

                </span>

              </div>

            </div>

          </div>


          {/* ==========================================
              AI ANALYSIS
          ========================================== */}

          <div
            className={[
              'rounded-2xl border bg-white p-5 shadow-[0_8px_30px_rgba(15,50,80,0.05)]',
              isOilDetected
                ? 'border-rose-200'
                : 'border-slate-200',
            ].join(' ')}
          >

            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">

              <div className="flex items-center gap-3">

                <div
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    isOilDetected
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-[#eaf7fc] text-[#087fa8]',
                  ].join(' ')}
                >

                  {isOilDetected ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Brain className="h-4 w-4" />
                  )}

                </div>

                <h3 className="text-xs font-black uppercase tracking-[0.12em] text-[#14243d]">

                  AI Analysis

                </h3>

              </div>

              <span className="font-mono text-[8px] font-bold uppercase text-slate-400">

                {detection?.model || 'ResNet18'}

              </span>

            </div>


            {/* Loading */}

            {isDetectionLoading && (

              <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">

                <div className="flex items-center gap-2 text-xs font-black text-[#0877a4]">

                  <RefreshCw className="h-4 w-4 animate-spin" />

                  AI ANALYZING

                </div>

                <p className="mt-2 text-[9.5px] leading-5 text-cyan-700/75">

                  {monitoringMode === 'DEMO'
                    ? 'The fixed CASE-001 demonstration image is being processed by the trained ResNet18 oil-spill classification model.'
                    : 'The latest available Sentinel-1 SAR observation is being processed by the ResNet18 oil-spill classification model.'}

                </p>

              </div>

            )}


            {/* Error */}

            {!isDetectionLoading &&
              detectionError && (

                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">

                  <div className="flex items-center gap-2 text-xs font-black text-rose-700">

                    <AlertTriangle className="h-4 w-4" />

                    AI ANALYSIS FAILED

                  </div>

                  <p className="mt-2 text-[9.5px] leading-5 text-rose-600/80">

                    {detectionError}

                  </p>

                </div>

              )}


            {/* Waiting */}

            {!isDetectionLoading &&
              !detectionError &&
              !detection && (

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex items-center gap-2 text-xs font-black text-slate-700">

                    <Brain className="h-4 w-4 text-[#087fa8]" />

                    AI READY

                  </div>

                  <p className="mt-2 text-[9.5px] text-slate-500">

                    Waiting for satellite observation.

                  </p>

                </div>

              )}


            {/* Result */}

            {!isDetectionLoading &&
              !detectionError &&
              detection && (

                <div
                  className={[
                    'rounded-xl border p-4',
                    isOilDetected
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700',
                  ].join(' ')}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={[
                        'flex h-9 w-9 items-center justify-center rounded-lg',
                        isOilDetected
                          ? 'bg-rose-100'
                          : 'bg-emerald-100',
                      ].join(' ')}
                    >

                      {isOilDetected ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <ShieldCheck className="h-5 w-5" />
                      )}

                    </div>

                    <div>

                      <div className="text-sm font-black">

                        {isOilDetected
                          ? 'OIL SPILL DETECTED'
                          : 'NO OIL SPILL DETECTED'}

                      </div>

                      <div className="mt-0.5 text-[8px] font-bold uppercase tracking-widest opacity-60">

                        ResNet18 Classification

                      </div>

                    </div>

                  </div>


                  <div className="mt-5 space-y-2.5 font-mono text-[9.5px]">

                    <div className="flex justify-between">

                      <span>
                        Classification
                      </span>

                      <strong>
                        {detection.label}
                      </strong>

                    </div>

                    <div className="flex justify-between">

                      <span>
                        Confidence
                      </span>

                      <strong>
                        {formatConfidence(
                          detectionConfidence
                        )}
                      </strong>

                    </div>


                    {detection.probabilities && (
                      <>

                        <div className="flex justify-between">

                          <span>
                            Oil probability
                          </span>

                          <strong>
                            {formatProbability(
                              detection.probabilities.OIL
                            )}
                          </strong>

                        </div>

                        <div className="flex justify-between">

                          <span>
                            No-oil probability
                          </span>

                          <strong>
                            {formatProbability(
                              detection.probabilities.NO_OIL
                            )}
                          </strong>

                        </div>

                      </>
                    )}

                  </div>


                  <div className="mt-4 border-t border-current/10 pt-3 text-[8px] opacity-60">

                    Model: {detection.model || 'ResNet18'}

                    {' • '}

                    Device: {detection.device || 'CPU'}

                  </div>

                </div>

              )}

          </div>


          {/* ==========================================
              ACTIVE AOI
          ========================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,50,80,0.05)]">

            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf7fc] text-[#087fa8]">

                <MapPin className="h-4 w-4" />

              </div>

              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-[#14243d]">

                Active AOI

              </h3>

            </div>


            <div>

              <strong className="text-base font-black tracking-tight text-[#14243d]">

                {selectedArea?.name}

              </strong>

              <p className="mt-2 text-[10px] leading-5 text-slate-500">

                {selectedArea?.subtitle}

              </p>

              <p className="mt-1 font-mono text-[9px] leading-5 text-slate-400">

                {selectedArea?.coordinatesLabel}

              </p>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">

                  Risk Level

                </span>

                <span
                  className={[
                    'text-xs font-black uppercase',
                    selectedArea?.riskLevel === 'HIGH'
                      ? 'text-rose-600'
                      : selectedArea?.riskLevel === 'MEDIUM'
                        ? 'text-amber-600'
                        : 'text-emerald-600',
                  ].join(' ')}
                >

                  {selectedArea?.riskLevel}

                </span>

              </div>

            </div>

          </div>

        </div>


        {/* ==============================================
            OIL DETECTED -> INVESTIGATION
        ============================================== */}

        {isOilDetected &&
          detection && (

            <div className="overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-white shadow-sm">

              <div className="flex flex-col items-center justify-between gap-5 px-5 py-5 md:flex-row lg:px-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-100 text-rose-600">

                    <AlertTriangle className="h-5 w-5" />

                  </div>

                  <div>

                    <h3 className="text-sm font-black uppercase tracking-wider text-rose-700">

                      Incident Investigation Required

                    </h3>

                    <p className="mt-1 max-w-3xl text-[10px] leading-5 text-rose-600/75">

                      {monitoringMode === 'DEMO'
                        ? 'The CASE-001 demonstration scenario produced an oil-spill classification. Continue to the investigation workspace to demonstrate the complete incident-analysis workflow.'
                        : 'Sentinel-1 and the ResNet18 AI classification indicate a probable oil spill. Continue to the investigation workspace for incident analysis.'}

                    </p>

                  </div>

                </div>


                <button
                  onClick={handleInvestigate}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-rose-600/15 transition-all hover:-translate-y-0.5 hover:bg-rose-700"
                >

                  <Search className="h-4 w-4" />

                  Investigate Incident

                  <ChevronRight className="h-4 w-4" />

                </button>

              </div>

            </div>

          )}


        {/* ==============================================
            NO OIL -> CLEAR STATUS
        ============================================== */}

        {!isDetectionLoading &&
          !detectionError &&
          detection &&
          !isOilDetected && (

            <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white shadow-sm">

              <div className="flex items-center gap-4 px-5 py-5 lg:px-6">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 text-emerald-600">

                  <ShieldCheck className="h-5 w-5" />

                </div>

                <div>

                  <h3 className="text-sm font-black uppercase tracking-wider text-emerald-700">

                    Monitoring Clear

                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-emerald-600/75">

                    {monitoringMode === 'DEMO'
                      ? 'The CASE-001 demonstration test image did not produce an oil-spill classification.'
                      : 'No oil-spill signature detected in the current Sentinel-1 observation.'}

                  </p>

                </div>

              </div>

            </div>

          )}


        {/* ==============================================
            SYSTEM FOOTER
        ============================================== */}

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">

          <span className="flex items-center gap-1.5">
            <Waves className="h-3 w-3 text-cyan-600" />
            Maritime Intelligence
          </span>

          <span className="h-1 w-1 rounded-full bg-slate-300" />

          <span className="flex items-center gap-1.5">
            <Satellite className="h-3 w-3 text-cyan-600" />
            Sentinel-1
          </span>

          <span className="h-1 w-1 rounded-full bg-slate-300" />

          <span className="flex items-center gap-1.5">
            <Brain className="h-3 w-3 text-cyan-600" />
            ResNet18 AI
          </span>

          <span className="h-1 w-1 rounded-full bg-slate-300" />

          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-cyan-600" />
            Sagar Netra
          </span>

        </div>

      </div>

    </div>
  );
};


export default LiveMonitoring;