import React from 'react';

interface BasketballCourtBackgroundProps {
  homeColor?: string;
  awayColor?: string;
}

export const BasketballCourtBackground: React.FC<BasketballCourtBackgroundProps> = ({
  homeColor = '#ef4444',
  awayColor = '#3b82f6',
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Authentic Hardwood Basketball Court Base Floor */}
      <div 
        className="absolute inset-0 bg-[#16120e]" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(18, 14, 10, 0.45), rgba(12, 10, 8, 0.70)),
            repeating-linear-gradient(
              90deg,
              rgba(217, 148, 77, 0.18) 0px,
              rgba(217, 148, 77, 0.18) 28px,
              rgba(180, 115, 50, 0.12) 28px,
              rgba(180, 115, 50, 0.12) 56px,
              rgba(245, 175, 95, 0.22) 56px,
              rgba(245, 175, 95, 0.22) 84px,
              rgba(145, 90, 38, 0.14) 84px,
              rgba(145, 90, 38, 0.14) 112px
            ),
            linear-gradient(180deg, rgba(200, 130, 60, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 112px 100%, 100% 24px',
        }}
      />

      {/* SVG Basketball Court Lines (FIBA / NBA Standard Markings - High Contrast) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-85"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 560"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="courtCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="homePaintGlow" cx="15%" cy="50%" r="45%">
            <stop offset="0%" stopColor={homeColor} stopOpacity="0.35" />
            <stop offset="80%" stopColor={homeColor} stopOpacity="0.1" />
            <stop offset="100%" stopColor={homeColor} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="awayPaintGlow" cx="85%" cy="50%" r="45%">
            <stop offset="0%" stopColor={awayColor} stopOpacity="0.35" />
            <stop offset="80%" stopColor={awayColor} stopOpacity="0.1" />
            <stop offset="100%" stopColor={awayColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Team Paint Glows */}
        <circle cx="120" cy="280" r="240" fill="url(#homePaintGlow)" />
        <circle cx="880" cy="280" r="240" fill="url(#awayPaintGlow)" />
        <circle cx="500" cy="280" r="200" fill="url(#courtCenterGlow)" />

        {/* Court Boundary Lines */}
        <rect
          x="30"
          y="25"
          width="940"
          height="510"
          fill="none"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="3"
        />

        {/* Half Court Line */}
        <line
          x1="500"
          y1="25"
          x2="500"
          y2="535"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="3"
        />

        {/* Center Circle & Outer Center Circle */}
        <circle
          cx="500"
          cy="280"
          r="70"
          fill="rgba(245, 158, 11, 0.06)"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="3"
        />
        <circle
          cx="500"
          cy="280"
          r="26"
          fill="rgba(245, 158, 11, 0.12)"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="2.5"
        />
        
        {/* Basketball Center Graphic Seams */}
        <path
          d="M 476 280 A 24 24 0 0 1 524 280"
          fill="none"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="2"
        />
        <line
          x1="500"
          y1="254"
          x2="500"
          y2="306"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="2"
        />

        {/* --- LEFT BASKET & PAINT (Home Side) --- */}
        {/* Key / Paint Rectangle */}
        <rect
          x="30"
          y="190"
          width="190"
          height="180"
          fill={homeColor}
          fillOpacity="0.18"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="2.5"
        />
        {/* Free Throw Circle Left */}
        <path
          d="M 220 190 A 90 90 0 0 1 220 370"
          fill="none"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="2.5"
        />
        <path
          d="M 220 190 A 90 90 0 0 0 220 370"
          fill="none"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="2.5"
          strokeDasharray="8 8"
        />
        {/* Backboard & Rim Left */}
        <line
          x1="60"
          y1="240"
          x2="60"
          y2="320"
          stroke="#ffffff"
          strokeWidth="4"
        />
        <circle
          cx="75"
          cy="280"
          r="12"
          fill="none"
          stroke="#f97316"
          strokeWidth="3"
        />
        {/* Restricted Area Arc Left */}
        <path
          d="M 60 248 A 32 32 0 0 1 60 312"
          fill="none"
          stroke="rgba(255, 255, 255, 0.65)"
          strokeWidth="2"
        />
        {/* Three Point Arc Left */}
        <path
          d="M 30 65 L 130 65 A 260 260 0 0 1 130 495 L 30 495"
          fill="none"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="3"
        />

        {/* --- RIGHT BASKET & PAINT (Away Side) --- */}
        {/* Key / Paint Rectangle */}
        <rect
          x="780"
          y="190"
          width="190"
          height="180"
          fill={awayColor}
          fillOpacity="0.18"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="2.5"
        />
        {/* Free Throw Circle Right */}
        <path
          d="M 780 190 A 90 90 0 0 0 780 370"
          fill="none"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="2.5"
        />
        <path
          d="M 780 190 A 90 90 0 0 1 780 370"
          fill="none"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="2.5"
          strokeDasharray="8 8"
        />
        {/* Backboard & Rim Right */}
        <line
          x1="940"
          y1="240"
          x2="940"
          y2="320"
          stroke="#ffffff"
          strokeWidth="4"
        />
        <circle
          cx="925"
          cy="280"
          r="12"
          fill="none"
          stroke="#f97316"
          strokeWidth="3"
        />
        {/* Restricted Area Arc Right */}
        <path
          d="M 940 248 A 32 32 0 0 0 940 312"
          fill="none"
          stroke="rgba(255, 255, 255, 0.65)"
          strokeWidth="2"
        />
        {/* Three Point Arc Right */}
        <path
          d="M 970 65 L 870 65 A 260 260 0 0 0 870 495 L 970 495"
          fill="none"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="3"
        />
      </svg>

      {/* Atmospheric Vignette & Contrast Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/60 pointer-events-none" />
    </div>
  );
};
