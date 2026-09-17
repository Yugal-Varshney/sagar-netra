import React, { useEffect } from 'react';

import {
  MapContainer,
  TileLayer,
  Polygon,
  Rectangle,
  useMap,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import { useSimulation } from '../context/SimulationContext';

// ================================================================
// TYPES
// ================================================================

interface MaritimeMapProps {
  className?: string;
}

interface MapControllerProps {
  bounds?: [
    [number, number],
    [number, number]
  ];
}

// ================================================================
// LEAFLET SIZE FIX
// ================================================================

const MapSizeFixer: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const fixMapSize = () => {
      map.invalidateSize(false);
    };

    // Initial fix
    fixMapSize();

    // Fix after parent layout settles
    const timers = [
      window.setTimeout(fixMapSize, 50),
      window.setTimeout(fixMapSize, 150),
      window.setTimeout(fixMapSize, 300),
      window.setTimeout(fixMapSize, 600),
      window.setTimeout(fixMapSize, 1000),
    ];

    // Watch container size changes
    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(fixMapSize);
      });

      resizeObserver.observe(map.getContainer());
    }

    window.addEventListener('resize', fixMapSize);

    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });

      window.removeEventListener('resize', fixMapSize);

      resizeObserver?.disconnect();
    };
  }, [map]);

  return null;
};

// ================================================================
// MAP CONTROLLER
// ================================================================

const MapController: React.FC<MapControllerProps> = ({
  bounds,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!bounds) return;

    const timer = window.setTimeout(() => {
      map.invalidateSize(false);

      map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 11,
        animate: false,
      });
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [map, bounds]);

  return null;
};

// ================================================================
// MAIN MARITIME MAP
// ================================================================

const MaritimeMap: React.FC<MaritimeMapProps> = ({
  className = '',
}) => {
  const {
    selectedArea,
  } = useSimulation();

  // ==============================================================
  // MONITORING AREA
  // ==============================================================

  const areaBounds = selectedArea?.bounds;

  // ==============================================================
  // MAP CENTER
  // ==============================================================

  const mapCenter: [number, number] =
    selectedArea?.center || [20, 75];

  // ==============================================================
  // RENDER
  // ==============================================================

  return (
    <div
      className={[
        'marine-map-root',
        'relative z-0 w-full overflow-hidden rounded-xl',
        className,
      ].join(' ')}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '520px',
        position: 'relative',
        isolation: 'isolate',
      }}
    >

      {/* ==========================================================
          LEAFLET MAP CSS

          Keeps Leaflet tiles at their correct 256x256 size
          and keeps the map below the page navbar.
      ========================================================== */}

      <style>
        {`
          .marine-map-root {
            position: relative;
            z-index: 0;
            width: 100%;
            height: 100%;
            min-height: 520px;
            overflow: hidden;
            isolation: isolate;
          }

          .marine-map-root .leaflet-container {
            position: absolute !important;
            inset: 0 !important;
            z-index: 0 !important;

            width: 100% !important;
            height: 100% !important;
            min-height: 520px !important;

            overflow: hidden !important;

            background: #dbeafe !important;

            font-family: inherit;
          }

          .marine-map-root .leaflet-map-pane {
            position: absolute;
            left: 0;
            top: 0;
          }

          .marine-map-root .leaflet-tile-pane {
            position: absolute;
            left: 0;
            top: 0;
          }

          .marine-map-root .leaflet-tile-container {
            position: absolute;
            left: 0;
            top: 0;
          }

          .marine-map-root .leaflet-tile {
            position: absolute !important;

            display: block !important;

            width: 256px !important;
            height: 256px !important;

            max-width: none !important;
            max-height: none !important;

            min-width: 256px !important;
            min-height: 256px !important;

            margin: 0 !important;
            padding: 0 !important;

            border: 0 !important;

            box-sizing: border-box !important;
          }

          .marine-map-root .leaflet-tile-container img {
            width: 256px !important;
            height: 256px !important;

            max-width: none !important;
            max-height: none !important;

            min-width: 256px !important;
            min-height: 256px !important;

            display: block !important;
          }

          .marine-map-root .leaflet-pane img {
            max-width: none !important;
          }

          /*
           * Keep Leaflet controls inside the map's own stacking
           * context. They cannot rise above the navbar.
           */

          .marine-map-root .leaflet-control-container {
            z-index: 100 !important;
          }

          .marine-map-root .leaflet-control {
            z-index: 100 !important;
          }

          .marine-map-root .leaflet-top,
          .marine-map-root .leaflet-bottom {
            z-index: 100 !important;
          }

          .marine-map-root .leaflet-popup {
            z-index: 200 !important;
          }
        `}
      </style>

      {/* ==========================================================
          OPENSTREETMAP MAP
      ========================================================== */}

      <MapContainer
        key={
          selectedArea?.name ||
          'default-maritime-map'
        }

        center={mapCenter}

        zoom={8}

        scrollWheelZoom={true}

        zoomControl={true}

        attributionControl={true}

        className="marine-leaflet-container"

        style={{
          width: '100%',
          height: '100%',
          minHeight: '520px',
        }}
      >

        {/* ========================================================
            OPENSTREETMAP BASE MAP
        ======================================================== */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

          minZoom={2}
          maxZoom={19}

          tileSize={256}

          updateWhenIdle={false}
          updateWhenZooming={false}

          keepBuffer={3}
        />

        {/* ========================================================
            MAP SIZE FIX
        ======================================================== */}

        <MapSizeFixer />

        {/* ========================================================
            AUTOMATIC MONITORING AREA VIEW
        ======================================================== */}

        <MapController
          bounds={areaBounds}
        />

        {/* ========================================================
            MONITORING / AOI BOUNDARY
        ======================================================== */}

        {selectedArea && (
          <>
            {/* Monitoring polygon */}

            <Polygon
              positions={selectedArea.polygon}

              pathOptions={{
                color: '#11577d',
                weight: 2,

                fillColor: '#11577d',
                fillOpacity: 0.06,
              }}
            />

            {/* Monitoring rectangle */}

            <Rectangle
              bounds={selectedArea.bounds}

              pathOptions={{
                color: '#11577d',
                weight: 2,

                dashArray: '6 6',

                fillOpacity: 0,
              }}
            />
          </>
        )}

      </MapContainer>
    </div>
  );
};

export default MaritimeMap;