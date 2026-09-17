import React from 'react';
import { useSimulation } from '../context/SimulationContext';

const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
  } = useSimulation();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
    },
    {
      id: 'investigation',
      label: 'Investigation',
    },
  ];

  return (
    <header
      className="
        sticky
        top-0
        z-50
        w-full
        border-b
        border-slate-200
        bg-white/95
        backdrop-blur-md
        m-0
        p-0
      "
    >
      <div
        className="
          mx-auto
          flex
          h-[76px]
          w-full
          items-center
          justify-between
          px-6
          lg:px-7
          m-0
        "
      >

        {/* =====================================================
            BRAND
        ===================================================== */}

        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="
            flex
            items-center
            gap-3
            m-0
            p-0
            bg-transparent
            border-0
            cursor-pointer
          "
        >

          {/* S MONOGRAM */}

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-cyan-500
              to-teal-600
              text-white
              shadow-sm
            "
          >
            <span className="text-[22px] font-black tracking-tight">
              S
            </span>
          </div>


          {/* BRAND TEXT */}

          <div className="flex flex-col items-start">

            <div className="flex items-center gap-1.5">

              <span
                className="
                  text-[17px]
                  font-extrabold
                  tracking-wide
                  text-slate-800
                  whitespace-nowrap
                "
              >
                SAGAR NETRA
              </span>

              <span
                className="
                  rounded
                  bg-cyan-50
                  px-1.5
                  py-0.5
                  text-[9px]
                  font-extrabold
                  tracking-wider
                  text-cyan-600
                "
              >
                AI
              </span>

            </div>

            <span
              className="
                mt-0.5
                text-[9px]
                font-medium
                tracking-wider
                text-slate-400
                whitespace-nowrap
              "
            >
              Indian Maritime Intelligence Platform
            </span>

          </div>

        </button>


        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <nav className="flex items-center gap-1">

          {navItems.map((item) => {

            const isActive =
              activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={[
                  'relative rounded-xl px-5 py-3 text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-slate-50 text-[#11577d]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                ].join(' ')}
              >

                {item.label}

                {isActive && (
                  <span
                    className="
                      absolute
                      bottom-0
                      left-1/2
                      h-[3px]
                      w-12
                      -translate-x-1/2
                      rounded-full
                      bg-[#11577d]
                    "
                  />
                )}

              </button>
            );

          })}

        </nav>


        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <div className="w-[220px]" />

      </div>
    </header>
  );
};

export default Header;