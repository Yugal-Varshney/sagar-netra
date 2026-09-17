import React from 'react';
import {
  SimulationProvider,
  useSimulation,
} from './context/SimulationContext';

import Header from './components/Header';
import Home from './pages/Home';
import LiveMonitoring from './pages/LiveMonitoring';
import Investigation from './pages/Investigation';


const MainAppContent: React.FC = () => {
  const { activeTab } = useSimulation();

  return (
    <div className="min-h-screen w-screen bg-slate-50/50 flex flex-col font-sans">

      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <Header />


      {/* =====================================================
          MAIN PAGE CONTENT
          
          IMPORTANT:
          No pt-16 here.
          Header already occupies its own 76px height.
      ===================================================== */}

      <main className="flex-1 overflow-y-auto">

        {activeTab === 'home' && (
          <Home />
        )}

        {activeTab === 'monitoring' && (
          <LiveMonitoring />
        )}

        {activeTab === 'investigation' && (
          <Investigation />
        )}

      </main>

    </div>
  );
};


export default function App() {
  return (
    <SimulationProvider>
      <MainAppContent />
    </SimulationProvider>
  );
}