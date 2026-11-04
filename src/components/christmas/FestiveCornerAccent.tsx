'use client';

import React from 'react';

export function FestiveCornerAccent() {
  return (
    <div
      className="relative flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#2E3944]/80 border border-[#748D92]/30 shadow-md backdrop-blur group"
      title="Vánoční edice TaskFlow"
    >
      {/* Detailed SVG Illustration: Stylized Santa Hat & Snowman */}
      <svg
        className="w-10 h-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 drop-shadow"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hatGradient" x1="16" y1="8" x2="48" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E03131" />
            <stop offset="1" stopColor="#9C1414" />
          </linearGradient>
          <linearGradient id="snowGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F8F9FA" />
            <stop offset="1" stopColor="#D3D9D4" />
          </linearGradient>
          <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#124E66" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Snowman Base */}
        <circle cx="32" cy="46" r="14" fill="url(#snowGradient)" stroke="#748D92" strokeWidth="1.5" />
        <circle cx="32" cy="27" r="9" fill="url(#snowGradient)" stroke="#748D92" strokeWidth="1.5" />

        {/* Snowman Buttons & Coal Eyes */}
        <circle cx="32" cy="42" r="1.5" fill="#212A31" />
        <circle cx="32" cy="48" r="1.5" fill="#212A31" />
        <circle cx="29" cy="25" r="1.2" fill="#212A31" />
        <circle cx="35" cy="25" r="1.2" fill="#212A31" />

        {/* Carrot Nose */}
        <polygon points="32,27 25,29 32,30" fill="#E8590C" />

        {/* Festive Scarf in Teal Accent (#124E66) */}
        <path
          d="M24 33 C28 36, 36 36, 40 33 C40 36, 36 38, 24 35 Z"
          fill="#124E66"
        />
        <rect x="34" y="34" width="4" height="12" rx="1.5" fill="#124E66" />

        {/* Stylized Santa Hat on Snowman */}
        {/* Hat Body */}
        <path
          d="M24 20 C24 20, 31 6, 43 11 C47 13, 50 17, 51 21 C45 19, 39 19, 24 20 Z"
          fill="url(#hatGradient)"
        />
        {/* Hat Fluffy Brim */}
        <rect x="22" y="18" width="18" height="5" rx="2.5" fill="#FFFFFF" stroke="#D3D9D4" strokeWidth="1" />
        {/* Pompom */}
        <circle cx="51" cy="21" r="3.5" fill="#FFFFFF" stroke="#D3D9D4" strokeWidth="1" filter="url(#glow)" />
      </svg>

      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wider font-bold text-[#D3D9D4]">
          Vánoční edice
        </span>
        <span className="text-[11px] text-[#748D92]">
          Klidné a organizované svátky
        </span>
      </div>
    </div>
  );
}
