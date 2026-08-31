import React from 'react';

export const BasketballCourtBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Deep Rich Hardwood Court Base */}
      <div 
        className="absolute inset-0 bg-[#0d121c]" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(13, 18, 28, 0.88), rgba(9, 13, 20, 0.94)),
            repeating-linear-gradient(
              90deg,
              rgba(180, 110, 50, 0.035) 0px,
              rgba(180, 110, 50, 0.035) 28px,
              rgba(220, 150, 80, 0.05) 28px,
              rgba(220, 150, 80, 0.05) 56px,
              rgba(140, 80, 30, 0.03) 56px,
              rgba(140, 80, 30, 0.03) 84px
            )
          `,
        }}
      />

      {/* SVG Basketball Court Lines (FIBA / NBA Standard Markings) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 560"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="courtCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Center Glow */}
        <circle cx="500" cy="280" r="180" fill="url(#courtCenterGlow)" />

        {/* Court Boundary Lines */}
        <rect
          x="30"
          y="25"
          width="940"
          height="510"
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="2.5"
        />

        {/* Half Court Line */}
        <line
          x1="500"
          y1="25"
          x2="500"
          y2="535"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="2.5"
        />

        {/* Center Circle & Outer Center Circle */}
        <circle
          cx="500"
          cy="280"
          r="65"
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="2.5"
        />
        <circle
          cx="500"
          cy="280"
          r="22"
          fill="none"
          stroke="rgba(245, 158, 11, 0.4)"
          strokeWidth="2"
        />
        
        {/* Basketball Center Graphic Seams */}
        <path
          d="M 480 280 A 20 20 0 0 1 520 280"
          fill="none"
          stroke="rgba(245, 158, 11, 0.35)"
          strokeWidth="1.5"
        />
        <path
          d="M 500 258 L 500 302"
          fill="none"
          stroke="rgba(245, 158, 11, 0.35)"
          strokeWidth="1.5"
        />

        {/* --- LEFT BASKET & PAINT (Home Side) --- */}
        {/* Key / Paint Rectangle */}
        <rect
          x="30"
          y="200"
          width="180"
          height="160"
          fill="rgba(245, 158, 11, 0.03)"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="2"
        />
        {/* Free Throw Circle Left */}
        <path
          d="M 210 200 A 80 80 0 0 1 210 360"
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="2"
        />
        <path
          d="M 210 200 A 80 80 0 0 0 210 360"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        {/* Backboard & Rim Left */}
        <line
          x1="55"
          y1="250"
          x2="55"
          y2="310"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="3.5"
        />
        <circle
          cx="68"
          cy="280"
          r="10"
          fill="none"
          stroke="#f97316"
          strokeWidth="2.5"
        />
        {/* Restricted Area Arc Left */}
        <path
          d="M 55 255 A 25 25 0 0 1 55 305"
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="2"
        />
        {/* Three Point Arc Left */}
        <path
          d="M 30 75 L 120 75 A 250 250 0 0 1 120 485 L 30 485"
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="2.5"
        />

        {/* --- RIGHT BASKET & PAINT (Away Side) --- */}
        {/* Key / Paint Rectangle */}
        <rect
          x="790"
          y="200"
          width="180"
          height="160"
          fill="rgba(6, 182, 212, 0.03)"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="2"
        />
        {/* Free Throw Circle Right */}
        <path
          d="M 790 200 A 80 80 0 0 0 790 360"
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="2"
        />
        <path
          d="M 790 200 A 80 80 0 0 1 790 360"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        {/* Backboard & Rim Right */}
        <line
          x1="945"
          y1="250"
          x2="945"
          y2="310"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="3.5"
        />
        <circle
          cx="932"
          cy="280"
          r="10"
          fill="none"
          stroke="#f97316"
          strokeWidth="2.5"
        />
        {/* Restricted Area Arc Right */}
        <path
          d="M 945 255 A 25 25 0 0 0 945 305"
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="2"
        />
        {/* Three Point Arc Right */}
        <path
          d="M 970 75 L 880 75 A 250 250 0 0 0 880 485 L 970 485"
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="2.5"
        />
      </svg>

      {/* Atmospheric Vignette & Contrast Gradients */}
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/85" />
    </div>
  );
};
