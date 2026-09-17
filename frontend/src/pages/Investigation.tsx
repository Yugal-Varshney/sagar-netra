import React from 'react';

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPin,
  Satellite,
  Ship,
  Target,
  Waves,
  Wind,
  Activity,
  ShieldAlert,
  Image as ImageIcon,
  Navigation,
  Crosshair,
  Radio,
  ChevronRight,
} from 'lucide-react';

import { useSimulation } from '../context/SimulationContext';
import { HISTORICAL_CASES } from '../data/mockCases';
import MaritimeMap from '../components/MaritimeMap';


// ================================================================
// INVESTIGATION PAGE
// ================================================================

const Investigation: React.FC = () => {

  const {
    selectedArea,
    selectedVessel,
    vessels,

    activeHistoricalCase,

    monitoringMode,
    satelliteImageUrl,
    detection,
    detectionResult,
  } = useSimulation();


  // ==============================================================
  // INVESTIGATION STATE
  // ==============================================================

  const isDemoInvestigation =
    monitoringMode === 'DEMO' &&
    activeHistoricalCase?.id === 'CASE-001';


  const isLiveInvestigation =
    monitoringMode === 'LIVE' &&
    detection?.label === 'OIL';


  const hasActiveInvestigation =
    isDemoInvestigation ||
    isLiveInvestigation;


  // ==============================================================
  // HISTORICAL CASE
  // ==============================================================

  const historicalCase =
    isDemoInvestigation
      ? HISTORICAL_CASES.find(
          (item) =>
            item.id === activeHistoricalCase?.id
        )
      : undefined;


  // ==============================================================
  // NO ACTIVE INVESTIGATION
  // ==============================================================

  if (!hasActiveInvestigation) {

    return (

      <div className="min-h-full bg-[#f4f9fc]">

        <div className="pointer-events-none absolute left-0 right-0 top-0 h-[260px] overflow-hidden">

          <div className="absolute left-1/2 top-[-180px] h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-100/40 blur-3xl" />

          <div className="absolute right-[-100px] top-[-120px] h-[300px] w-[300px] rounded-full bg-blue-100/40 blur-3xl" />

        </div>


        <div className="relative mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[1180px] items-center justify-center px-6 py-16">

          <div className="w-full max-w-[680px]">

            <div className="mb-5 flex justify-center">

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 shadow-sm">

                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b668f]">

                  <ShieldAlert
                    size={11}
                    className="text-white"
                  />

                </span>

                <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#0b668f]">
                  Maritime Investigation Workspace
                </span>

              </div>

            </div>


            <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,78,105,0.10)]">

              <div className="h-1.5 w-full bg-gradient-to-r from-[#075985] via-[#0891b2] to-[#22d3ee]" />

              <div className="p-10 text-center md:p-12">

                <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-50 to-cyan-100 shadow-inner">

                  <ShieldAlert
                    size={31}
                    strokeWidth={1.8}
                    className="text-[#0b668f]"
                  />

                </div>


                <h1 className="mt-6 text-[25px] font-extrabold tracking-[-0.035em] text-[#102a43]">
                  No Active Investigation
                </h1>


                <p className="mx-auto mt-3 max-w-[500px] text-[12px] leading-6 text-slate-500">
                  Start a monitoring scenario and detect
                  an oil spill before opening the
                  investigation workspace.
                </p>


                <div className="mt-8 rounded-2xl border border-slate-100 bg-[#f7fafc] p-5 text-left">

                  <div className="flex items-center gap-2">

                    <Activity
                      size={14}
                      className="text-[#0b668f]"
                    />

                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#0b668f]">
                      Investigation Workflow
                    </p>

                  </div>


                  <div className="mt-5 grid gap-2 md:grid-cols-4">

                    <WorkflowStep
                      number="01"
                      text="Select AOI"
                    />

                    <WorkflowStep
                      number="02"
                      text="Acquire SAR"
                    />

                    <WorkflowStep
                      number="03"
                      text="Detect Spill"
                    />

                    <WorkflowStep
                      number="04"
                      text="Investigate"
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    );
  }


  // ==============================================================
  // PAGE INFORMATION
  // ==============================================================

  const investigationTitle =
    isDemoInvestigation && historicalCase
      ? historicalCase.title
      : 'Live Oil Spill Investigation';


  const location =
    isDemoInvestigation && historicalCase
      ? historicalCase.locationLabel
      : selectedArea?.name ?? 'Active Monitoring Area';


  const incidentDate =
    isDemoInvestigation && historicalCase
      ? historicalCase.date
      : 'Current monitoring event';


  // ==============================================================
  // STATUS
  // ==============================================================

  const investigationStatus =
    isDemoInvestigation
      ? 'HISTORICAL CASE'
      : 'LIVE INCIDENT';


  // ==============================================================
  // AI CONFIDENCE
  // ==============================================================

  const aiConfidence =
    detection?.confidence !== undefined
      ? `${(
          Number(detection.confidence) * 100
        ).toFixed(1)}%`
      : historicalCase?.confidence ?? 'N/A';


  // ==============================================================
  // SATELLITE IMAGE
  // ==============================================================

  const investigationImage =
    isDemoInvestigation
      ? '/demo/case-001-sentinel.jpg'
      : satelliteImageUrl;


  // ==============================================================
  // SPILL DATA
  // ==============================================================

  const spillFootprint =
    isDemoInvestigation
      ? historicalCase?.spillArea ?? '12.8 km²'
      : 'AI detection confirmed';


  const maxLength =
    isDemoInvestigation
      ? '7.2 km'
      : 'Pending analysis';


  const averageWidth =
    isDemoInvestigation
      ? '2.1 km'
      : 'Pending analysis';


  // ==============================================================
  // RISK
  // ==============================================================

  const riskLevel =
    selectedArea?.riskLevel ?? 'UNKNOWN';


  // ==============================================================
  // DRIFT DATA
  // ==============================================================

  const driftData = {

    direction: 'ENE',

    speed: '0.42 km/h',

    distance: '18.6 km',

    time: '44 hours',

  };


  // ==============================================================
  // ORIGIN DATA
  // ==============================================================

  const originLatitude =
    selectedArea
      ? selectedArea.center[0] + 0.015
      : 0;


  const originLongitude =
    selectedArea
      ? selectedArea.center[1] - 0.015
      : 0;


  const originData = {

    confidence:
      isDemoInvestigation
        ? '87%'
        : 'Pending',

    latitude:
      originLatitude,

    longitude:
      originLongitude,

    radius:
      isDemoInvestigation
        ? '2.5 km'
        : 'Pending',

  };


  // ==============================================================
  // VESSEL CORRELATION
  //
  // IMPORTANT:
  // We do NOT create a fake vessel object.
  // We first use the actual selected vessel, then the first
  // vessel from the existing vessel dataset.
  // If neither exists in the demo, presentation-safe fallback
  // values are displayed directly.
  // ==============================================================

  const topSuspect =
    selectedVessel ??
    vessels?.[0] ??
    null;


  const vesselName =
    topSuspect?.name ??
    (isDemoInvestigation
      ? 'MV Ocean Crest'
      : 'No vessel identified');


  const vesselScore =
    topSuspect?.score !== undefined
      ? `${topSuspect.score}%`
      : isDemoInvestigation
        ? '91%'
        : '—';


  const vesselRisk =
    topSuspect?.riskLevel ??
    (isDemoInvestigation
      ? 'HIGH'
      : '—');


  const vesselSpeed =
    topSuspect?.speed ??
    (isDemoInvestigation
      ? '11.8 kn'
      : '—');


  // ==============================================================
  // RENDER
  // ==============================================================

  return (

    <div className="min-h-full bg-[#f4f9fc]">


      {/* ========================================================
          BACKGROUND
      ======================================================== */}

      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[330px] overflow-hidden">

        <div className="absolute left-[15%] top-[-250px] h-[520px] w-[520px] rounded-full bg-cyan-100/35 blur-3xl" />

        <div className="absolute right-[8%] top-[-280px] h-[520px] w-[520px] rounded-full bg-blue-100/35 blur-3xl" />

      </div>


      <div className="relative mx-auto w-full max-w-[1480px] px-5 pb-16 pt-7 sm:px-7 lg:px-10">


        {/* ======================================================
            PART 1 — HEADER
        ====================================================== */}

        <section className="border-b border-slate-200/80 pb-6">

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

            <div className="min-w-0">

              <div className="mb-3 flex flex-wrap items-center gap-2">

                <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-red-600 shadow-sm">

                  <span className="relative flex h-2 w-2">

                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50" />

                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />

                  </span>

                  Investigation Active

                </span>


                {isDemoInvestigation && (

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-sky-700 shadow-sm">

                    <Clock3 size={10} />

                    Historical Case

                  </span>

                )}


                {isLiveInvestigation && (

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-orange-600 shadow-sm">

                    <Radio size={10} />

                    AI Spill Alert

                  </span>

                )}

              </div>


              <h1 className="text-[27px] font-extrabold tracking-[-0.04em] text-[#102a43]">

                {investigationTitle}

              </h1>


              <p className="mt-2 max-w-[760px] text-[13px] font-medium leading-6 text-slate-500">

                Analyze spill movement, probable origin,
                environmental conditions and vessel correlation.

              </p>

            </div>


            {/* ACTIVE AOI */}

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-cyan-100 bg-white px-4 py-3 shadow-[0_4px_18px_rgba(8,145,178,0.07)]">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-cyan-100">

                <MapPin
                  size={17}
                  className="text-[#0b668f]"
                />

              </div>


              <div>

                <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  Active AOI
                </p>

                <p className="mt-0.5 text-[11px] font-extrabold text-slate-700">
                  {location}
                </p>

                <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                  {selectedArea?.coordinatesLabel ?? 'Monitoring region'}
                </p>

              </div>


              <ChevronRight
                size={14}
                className="ml-2 text-slate-300"
              />

            </div>

          </div>

        </section>


        {/* ======================================================
            PART 2 — COMBINED INCIDENT BLOCK
        ====================================================== */}

        <section className="mt-5">

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_5px_24px_rgba(15,78,105,0.06)]">


            {/* HEADER */}

            <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-white to-[#f5fbfd] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50">

                  <Activity
                    size={15}
                    className="text-[#0b668f]"
                  />

                </div>

                <div>

                  <h2 className="text-[13px] font-extrabold text-[#17324d]">
                    Incident Overview
                  </h2>

                  <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                    AI detection and primary spill information
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-2 shadow-sm">

                <span
                  className={[
                    'h-2 w-2 rounded-full',
                    isDemoInvestigation
                      ? 'bg-sky-500'
                      : 'bg-red-500',
                  ].join(' ')}
                />

                <span className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-600">

                  {investigationStatus}

                </span>

              </div>

            </div>


            {/* PRIMARY METRICS */}

            <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 md:grid-cols-4 md:divide-y-0">

              <OverviewMetric
                icon={<Clock3 size={15} />}
                label="Incident Date"
                value={incidentDate}
              />

              <OverviewMetric
                icon={<MapPin size={15} />}
                label="Location"
                value={location}
              />

              <OverviewMetric
                icon={<Satellite size={15} />}
                label="AI Confidence"
                value={aiConfidence}
                valueClassName="text-[#087ea4]"
              />

              <OverviewMetric
                icon={<ShieldAlert size={15} />}
                label="Risk Level"
                value={riskLevel}
                valueClassName={
                  riskLevel === 'HIGH'
                    ? 'text-red-600'
                    : riskLevel === 'MEDIUM'
                      ? 'text-amber-600'
                      : 'text-slate-700'
                }
              />

            </div>


            {/* SPILL INFORMATION */}

            <div className="grid grid-cols-1 border-t border-slate-100 md:grid-cols-3">


              <div className="border-b border-slate-100 px-5 py-5 md:border-b-0 md:border-r">

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">

                    <AlertTriangle
                      size={13}
                      className="text-red-500"
                    />

                  </div>

                  <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    Detected Spill Area
                  </p>

                </div>


                <p className="mt-3 text-[19px] font-extrabold tracking-tight text-[#17324d]">
                  {spillFootprint}
                </p>


                <p className="mt-1 text-[9px] font-medium text-slate-400">
                  Estimated affected surface area
                </p>

              </div>


              <div className="border-b border-slate-100 px-5 py-5 md:border-b-0 md:border-r">

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">

                    <Waves
                      size={13}
                      className="text-red-500"
                    />

                  </div>

                  <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    Spill Dimensions
                  </p>

                </div>


                <div className="mt-3 flex items-end gap-4">

                  <div>

                    <p className="text-[16px] font-extrabold text-[#17324d]">
                      {maxLength}
                    </p>

                    <p className="mt-0.5 text-[8px] text-slate-400">
                      Max length
                    </p>

                  </div>


                  <div className="h-7 w-px bg-slate-200" />


                  <div>

                    <p className="text-[16px] font-extrabold text-[#17324d]">
                      {averageWidth}
                    </p>

                    <p className="mt-0.5 text-[8px] text-slate-400">
                      Avg width
                    </p>

                  </div>

                </div>

              </div>


              <div className="px-5 py-5">

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">

                    <CheckCircle2
                      size={13}
                      className="text-emerald-500"
                    />

                  </div>

                  <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    Detection Status
                  </p>

                </div>


                <p className="mt-3 text-[11px] font-extrabold text-slate-700">

                  {isDemoInvestigation
                    ? 'Oil anomaly confirmed by AI'
                    : 'Oil anomaly detected by AI'}

                </p>


                <p className="mt-1 text-[9px] font-medium text-slate-400">

                  {detectionResult?.source
                    ? `${detectionResult.source.satellite} • ${detectionResult.source.sensor}`
                    : 'Sentinel-1 SAR'}

                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ======================================================
            PART 3 — SATELLITE + INVESTIGATION MAP
        ====================================================== */}

        <section className="mt-5">

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">


            {/* SENTINEL IMAGE */}

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_5px_24px_rgba(15,78,105,0.06)]">

              <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-[#f5fbfd] px-5 py-4">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50">

                    <Satellite
                      size={15}
                      className="text-[#0b668f]"
                    />

                  </div>

                  <div>

                    <h2 className="text-[13px] font-extrabold uppercase tracking-wide text-[#17324d]">
                      Sentinel-1 SAR
                    </h2>

                    <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                      {isDemoInvestigation
                        ? 'CASE-001 demonstration observation'
                        : 'Satellite observation used for AI detection'}
                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-2">

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[8px] font-extrabold uppercase tracking-wide text-emerald-600">

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                    SAR

                  </span>

                  {isDemoInvestigation && (

                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[8px] font-extrabold uppercase tracking-wide text-amber-700">
                      DEMO
                    </span>

                  )}

                </div>

              </div>


              <div className="relative h-[500px] overflow-hidden bg-[#071b2b]">

                {investigationImage ? (

                  <img
                    src={investigationImage}
                    alt="Sentinel-1 SAR oil spill observation"
                    className="h-full w-full object-contain"
                  />

                ) : (

                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">

                      <ImageIcon
                        size={24}
                        className="text-white/50"
                      />

                    </div>

                    <p className="mt-4 text-[12px] font-extrabold text-white">
                      Sentinel-1 Image Unavailable
                    </p>

                    <p className="mt-1 max-w-[320px] text-[10px] leading-4 text-white/45">
                      The satellite observation is not available
                      in the current investigation state.
                    </p>

                  </div>

                )}


                {investigationImage && (

                  <div className="pointer-events-none absolute inset-0 opacity-[0.06]">

                    <div
                      className="h-full w-full"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)',
                        backgroundSize: '80px 80px',
                      }}
                    />

                  </div>

                )}


                {isDemoInvestigation && (

                  <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-amber-500/90 px-3 py-2 shadow-lg backdrop-blur-sm">

                    <span className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-white">
                      CASE-001 DEMO
                    </span>

                  </div>

                )}


                {investigationImage && (

                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-white/10 bg-[#061522]/75 px-3 py-2 backdrop-blur-md">

                    <span className="relative flex h-2 w-2">

                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50" />

                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />

                    </span>

                    <span className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-white">
                      Oil Spill Detection
                    </span>

                  </div>

                )}


                {investigationImage && (

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border border-white/10 bg-[#061522]/75 px-3 py-2 backdrop-blur-md">

                    <Crosshair
                      size={12}
                      className="text-cyan-300"
                    />

                    <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/80">
                      AI Analysis
                    </span>

                  </div>

                )}


                {investigationImage && (

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#020a11]/95 via-[#020a11]/55 to-transparent px-4 pb-4 pt-16">

                    <div className="flex items-end justify-between gap-4">

                      <div>

                        <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-cyan-300/70">
                          Sentinel-1 SAR
                        </p>

                        <p className="mt-1 text-[11px] font-bold text-white">
                          {location}
                        </p>

                      </div>


                      <span className="rounded-full border border-red-400/20 bg-red-500/90 px-3 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.08em] text-white">
                        OIL DETECTED
                      </span>

                    </div>

                  </div>

                )}

              </div>


              <div className="grid grid-cols-2 divide-x divide-y border-t border-slate-100 bg-white">

                <SatelliteInfo
                  label="Sensor"
                  value="Sentinel-1"
                />

                <SatelliteInfo
                  label="Mode"
                  value="SAR"
                />

                <SatelliteInfo
                  label="Polarization"
                  value="VV"
                />

                <SatelliteInfo
                  label="AI Result"
                  value="OIL SPILL"
                  valueClassName="text-red-600"
                />

              </div>

            </div>


            {/* INVESTIGATION MAP */}

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_5px_24px_rgba(15,78,105,0.06)]">

              <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-[#f5fbfd] px-5 py-4">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50">

                    <MapPin
                      size={15}
                      className="text-[#0b668f]"
                    />

                  </div>

                  <div>

                    <h2 className="text-[13px] font-extrabold text-[#17324d]">
                      Investigation Map
                    </h2>

                    <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                      Spill area, origin and vessel correlation
                    </p>

                  </div>

                </div>


                <div className="hidden items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 sm:flex">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <span className="text-[8px] font-extrabold uppercase tracking-wide text-[#0b668f]">
                    {location}
                  </span>

                </div>

              </div>


              <div className="relative h-[500px]">

                <MaritimeMap
                  className="h-full"
                />


                <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-white/70 bg-white/90 px-3 py-2 shadow-md backdrop-blur-md">

                  <div className="flex items-center gap-2">

                    <Navigation
                      size={12}
                      className="text-[#0b668f]"
                    />

                    <div>

                      <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-[#0b668f]">
                        Investigation Layer
                      </p>

                      <p className="mt-0.5 text-[8px] font-medium text-slate-500">
                        AOI • Spill • Vessel correlation
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ======================================================
            PART 4 — ORIGIN + DRIFT
            SAME LEVEL
        ====================================================== */}

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">


          {/* ====================================================
              PROBABLE ORIGIN
          ==================================================== */}

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_24px_rgba(15,78,105,0.05)]">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">

                  <Target
                    size={15}
                    className="text-amber-500"
                  />

                </div>

                <div>

                  <h2 className="text-[13px] font-extrabold text-[#17324d]">
                    Probable Origin Zone
                  </h2>

                  <p className="mt-0.5 text-[9px] text-slate-400">
                    Hindcast origin estimation
                  </p>

                </div>

              </div>


              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-wide text-amber-600">
                {originData.confidence}
              </span>

            </div>


            <div className="mt-4 grid grid-cols-2 gap-3">

              <Metric
                label="Confidence"
                value={originData.confidence}
                accent="amber"
              />

              <Metric
                label="Search Radius"
                value={originData.radius}
                accent="amber"
              />

            </div>


            <div className="mt-4 rounded-xl border border-slate-100 bg-gradient-to-r from-slate-50 to-white px-3 py-3">

              <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                Estimated Origin
              </p>


              {isDemoInvestigation ? (

                <div className="mt-2 flex items-center gap-2">

                  <MapPin
                    size={13}
                    className="text-[#0b668f]"
                  />

                  <p className="text-[10px] font-extrabold text-slate-600">

                    {originData.latitude.toFixed(4)}
                    ° N

                    <span className="mx-2 text-slate-300">
                      •
                    </span>

                    {originData.longitude.toFixed(4)}
                    ° E

                  </p>

                </div>

              ) : (

                <p className="mt-2 text-[10px] font-bold text-slate-500">
                  Requires further live analysis
                </p>

              )}

            </div>

          </div>


          {/* ====================================================
              DRIFT
          ==================================================== */}

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_24px_rgba(15,78,105,0.05)]">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">

                <Waves
                  size={15}
                  className="text-blue-500"
                />

              </div>

              <div>

                <h2 className="text-[13px] font-extrabold text-[#17324d]">
                  Drift & Transport Analysis
                </h2>

                <p className="mt-0.5 text-[8px] font-medium text-slate-400">
                  Oceanographic movement model
                </p>

              </div>

            </div>


            {isDemoInvestigation ? (

              <>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <Metric
                    label="Direction"
                    value={driftData.direction}
                    accent="blue"
                  />

                  <Metric
                    label="Current Speed"
                    value={driftData.speed}
                    accent="blue"
                  />

                  <Metric
                    label="Projected Distance"
                    value={driftData.distance}
                    accent="blue"
                  />

                  <Metric
                    label="Transport Time"
                    value={driftData.time}
                    accent="blue"
                  />

                </div>


                <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-3">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">

                    <Wind
                      size={13}
                      className="text-blue-500"
                    />

                  </div>

                  <p className="text-[9px] font-semibold leading-4 text-blue-700">
                    Ocean current and wind transport model active
                  </p>

                </div>

              </>

            ) : (

              <div className="mt-4 rounded-xl bg-slate-50 p-4">

                <p className="text-[10px] font-semibold leading-5 text-slate-500">
                  Live transport analysis requires environmental
                  data processing.
                </p>

              </div>

            )}

          </div>

        </section>


        {/* ======================================================
            PART 5 — CULPRIT VESSEL
            SEPARATE FULL-WIDTH BLOCK
        ====================================================== */}

        <section className="mt-5">

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_5px_24px_rgba(15,78,105,0.05)]">


            {/* HEADER */}

            <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-white to-[#f5fbfd] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50">

                  <Ship
                    size={17}
                    className="text-[#0b668f]"
                  />

                </div>

                <div>

                  <h2 className="text-[14px] font-extrabold text-[#17324d]">
                    Culprit Vessel Analysis
                  </h2>

                  <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                    AIS trajectory correlation with spill origin and movement
                  </p>

                </div>

              </div>


              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-[8px] font-extrabold uppercase tracking-wide text-[#0b668f]">

                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />

                Vessel Correlation

              </span>

            </div>


            {/* VESSEL CONTENT */}

            <div className="p-5">


              {/* MAIN CANDIDATE */}

              <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/80 via-white to-white p-4">

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">


                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-cyan-100">

                      <Ship
                        size={23}
                        className="text-[#0b668f]"
                      />

                    </div>


                    <div>

                      <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                        Most Correlated Vessel
                      </p>

                      <h3 className="mt-1 text-[19px] font-extrabold tracking-tight text-[#17324d]">
                        {vesselName}
                      </h3>

                      <p className="mt-1 text-[9px] font-medium text-slate-500">
                        AIS trajectory overlaps with the estimated spill source region
                      </p>

                    </div>

                  </div>


                  <div className="rounded-xl border border-red-100 bg-white px-5 py-3 text-center shadow-sm">

                    <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                      Correlation Confidence
                    </p>

                    <p className="mt-1 text-[24px] font-extrabold tracking-tight text-red-600">
                      {vesselScore}
                    </p>

                    <p className="text-[8px] font-bold uppercase tracking-wide text-red-400">
                      Match Score
                    </p>

                  </div>

                </div>

              </div>


              {/* VESSEL DATA */}

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">

                <Metric
                  label="Risk Level"
                  value={vesselRisk}
                  accent="red"
                />

                <Metric
                  label="Speed"
                  value={vesselSpeed}
                  accent="blue"
                />

                <Metric
                  label="AIS Status"
                  value={
                    isDemoInvestigation
                      ? 'TRACK CORRELATED'
                      : 'LIVE'
                  }
                  accent="blue"
                />

                <Metric
                  label="Correlation"
                  value={
                    isDemoInvestigation
                      ? 'HIGH'
                      : 'ANALYZING'
                  }
                  accent="amber"
                />

              </div>


              {/* CORRELATION EVIDENCE */}

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">


                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">

                  <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    Origin Proximity
                  </p>

                  <p className="mt-2 text-[11px] font-extrabold text-slate-700">

                    {isDemoInvestigation
                      ? 'Within estimated origin zone'
                      : 'Pending analysis'}

                  </p>

                </div>


                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">

                  <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    Route Correlation
                  </p>

                  <p className="mt-2 text-[11px] font-extrabold text-slate-700">

                    {isDemoInvestigation
                      ? 'Trajectory intersects spill path'
                      : 'Pending analysis'}

                  </p>

                </div>


                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">

                  <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    Investigation Result
                  </p>

                  <p className="mt-2 text-[11px] font-extrabold text-slate-700">

                    {isDemoInvestigation
                      ? 'Priority vessel for investigation'
                      : 'Awaiting correlation'}

                  </p>

                </div>

              </div>


              {/* IMPORTANT DISCLAIMER */}

              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">

                <ShieldAlert
                  size={14}
                  className="mt-0.5 shrink-0 text-amber-500"
                />

                <p className="text-[9px] font-medium leading-4 text-amber-700">

                  Vessel correlation identifies a high-probability
                  candidate from AIS movement patterns. It does not
                  by itself establish legal responsibility for the spill.

                </p>

              </div>

            </div>

          </div>

        </section>


      </div>

    </div>

  );
};


// ================================================================
// WORKFLOW STEP
// ================================================================

interface WorkflowStepProps {
  number: string;
  text: string;
}


const WorkflowStep: React.FC<WorkflowStepProps> = ({
  number,
  text,
}) => {

  return (

    <div className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-sm transition hover:border-cyan-100 hover:shadow-md">

      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-[8px] font-extrabold text-[#0b668f]">

        {number}

      </span>


      <span className="text-[9px] font-bold text-slate-600">
        {text}
      </span>


      <ChevronRight
        size={12}
        className="ml-auto text-slate-300 transition group-hover:text-[#0b668f]"
      />

    </div>

  );
};


// ================================================================
// SATELLITE INFO
// ================================================================

interface SatelliteInfoProps {

  label: string;

  value: string;

  valueClassName?: string;

}


const SatelliteInfo: React.FC<SatelliteInfoProps> = ({
  label,
  value,
  valueClassName = 'text-slate-700',
}) => {

  return (

    <div className="px-5 py-3.5">

      <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>


      <p
        className={[
          'mt-1 text-[10px] font-extrabold',
          valueClassName,
        ].join(' ')}
      >
        {value}
      </p>

    </div>

  );
};


// ================================================================
// OVERVIEW METRIC
// ================================================================

interface OverviewMetricProps {

  icon: React.ReactNode;

  label: string;

  value: string;

  valueClassName?: string;

}


const OverviewMetric: React.FC<OverviewMetricProps> = ({
  icon,
  label,
  value,
  valueClassName = 'text-slate-800',
}) => {

  return (

    <div className="px-5 py-4">

      <div className="flex items-center gap-2">

        <span className="text-[#6b879b]">
          {icon}
        </span>


        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
          {label}
        </p>

      </div>


      <p
        className={[
          'mt-2 truncate text-[13px] font-extrabold',
          valueClassName,
        ].join(' ')}
      >
        {value}
      </p>

    </div>

  );
};


// ================================================================
// METRIC
// ================================================================

interface MetricProps {

  label: string;

  value: string;

  accent?: 'blue' | 'red' | 'amber' | 'slate';

}


const Metric: React.FC<MetricProps> = ({
  label,
  value,
  accent = 'slate',
}) => {

  const accentStyles = {

    blue: 'border-blue-100 bg-blue-50/60',

    red: 'border-red-100 bg-red-50/60',

    amber: 'border-amber-100 bg-amber-50/60',

    slate: 'border-slate-100 bg-slate-50',

  };


  return (

    <div
      className={[
        'rounded-xl border px-3 py-2.5',
        accentStyles[accent],
      ].join(' ')}
    >

      <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>


      <p className="mt-1 truncate text-[11px] font-extrabold text-slate-700">
        {value}
      </p>

    </div>

  );
};


// ================================================================

export default Investigation;