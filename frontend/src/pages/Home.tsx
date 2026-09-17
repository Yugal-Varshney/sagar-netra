import React from 'react';
import {
  Satellite,
  Cpu,
  Compass,
  Ship,
  ArrowRight,
  ShieldCheck,
  Play,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import './Home.css';

export const Home: React.FC = () => {
  const { setActiveTab, runSpillScenario } = useSimulation();

  return (
    <div className="home-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <main className="home-hero">

        {/* ===================================================
            LEFT CONTENT
        =================================================== */}

        <section className="hero-content">

          {/* Eyebrow */}
          <div className="hero-badge">
            <Satellite size={15} strokeWidth={2} />
            <span>INDIAN MARITIME INTELLIGENCE</span>
          </div>


          {/* Main heading */}
          <h1 className="hero-title">
            Smarter
            <br />
            Intelligence
            <br />
            for <span>Cleaner</span>
            <br />
            <span>Oceans</span>
          </h1>


          {/* Description */}
          <p className="hero-description">
            Detect oil spills. Trace their origins. Attribute maritime
            activity. Protect India's seas with AI-powered satellite
            intelligence.
          </p>


          {/* Actions */}
          <div className="hero-actions">

            <button
              className="primary-button"
              onClick={() => setActiveTab('monitoring')}
            >
              <span>OPEN MONITORING</span>
              <ArrowRight size={19} strokeWidth={2.2} />
            </button>

            <button
              className="secondary-button"
              onClick={runSpillScenario}
            >
              <Play
                size={17}
                strokeWidth={2}
                fill="currentColor"
              />
              <span>RUN SPILL DEMO</span>
            </button>

          </div>


          {/* =================================================
              CAPABILITY STRIP
          ================================================= */}

          <div className="capability-strip">

            <div className="capability-item">
              <Satellite size={17} />
              <div>
                <strong>Satellite</strong>
                <span>Imagery</span>
              </div>
            </div>

            <div className="capability-item">
              <Cpu size={17} />
              <div>
                <strong>AI Spill</strong>
                <span>Detection</span>
              </div>
            </div>

            <div className="capability-item">
              <Compass size={17} />
              <div>
                <strong>Origin</strong>
                <span>Analysis</span>
              </div>
            </div>

            <div className="capability-item">
              <Ship size={17} />
              <div>
                <strong>Vessel</strong>
                <span>Attribution</span>
              </div>
            </div>

          </div>

        </section>


        {/* ===================================================
            RIGHT VISUAL
        =================================================== */}

        <section className="hero-visual">

          {/* subtle technical glow */}
          <div className="visual-glow" />

          <div className="map-frame">

            {/* top information */}
            <div className="map-label map-label-top">
              <span className="map-label-dot" />
              <span>REGIONAL OVERVIEW</span>
            </div>

            <img
              src="/maritime-home.png"
              alt="Indian maritime surveillance map"
              className="hero-map-image"
            />

            {/* map information */}
            <div className="map-info map-info-bottom">

              <div className="map-info-item">
                <span className="map-info-label">REGION</span>
                <strong>INDIAN SEAS</strong>
              </div>

              <div className="map-info-divider" />

              <div className="map-info-item">
                <span className="map-info-label">ANALYSIS</span>
                <strong>AI ASSISTED</strong>
              </div>

            </div>

          </div>

        </section>

      </main>


      {/* =====================================================
          BOTTOM SYSTEM BAR
      ===================================================== */}

      <section className="home-bottom">

        <div className="bottom-line" />

        <div className="bottom-content">

          <div className="bottom-item">
            <Satellite size={16} />
            <span>Satellite Intelligence</span>
          </div>

          <div className="bottom-item">
            <Cpu size={16} />
            <span>AI Spill Detection</span>
          </div>

          <div className="bottom-item">
            <Compass size={16} />
            <span>Origin Analysis</span>
          </div>

          <div className="bottom-item">
            <Ship size={16} />
            <span>Vessel Attribution</span>
          </div>

          <div className="bottom-protection">
            <ShieldCheck size={16} />
            <span>Detect · Trace · Attribute · Protect</span>
          </div>

        </div>

      </section>

    </div>
  );
};

export default Home;