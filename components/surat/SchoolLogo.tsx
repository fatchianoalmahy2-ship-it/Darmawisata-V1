import React from 'react';

interface SchoolLogoProps {
  className?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ className = 'w-24 h-24' }) => {
  return (
    <svg
      viewBox="0 0 500 420"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Yellow Wreath / Leaves (Sayap Daun Padi/Kapas) - Left Side */}
      <g id="leaves-left" stroke="#111111" strokeWidth="3.5" strokeLinejoin="round" fill="#FFE600">
        {/* Leaf 1 (Top left) */}
        <path d="M 185 85 C 160 55 180 30 205 55 C 220 70 200 95 185 85 Z" />
        {/* Leaf 2 */}
        <path d="M 160 110 C 125 75 150 45 180 75 C 195 90 175 120 160 110 Z" />
        {/* Leaf 3 */}
        <path d="M 140 145 C 100 105 125 75 160 105 C 175 120 155 155 140 145 Z" />
        {/* Leaf 4 */}
        <path d="M 128 185 C 80 145 105 115 145 145 C 160 160 140 195 128 185 Z" />
        {/* Leaf 5 */}
        <path d="M 125 230 C 70 190 95 160 138 190 C 152 205 135 240 125 230 Z" />
        {/* Leaf 6 (Bottom left) */}
        <path d="M 135 275 C 75 240 100 210 142 235 C 158 250 145 285 135 275 Z" />
        {/* Leaf 7 */}
        <path d="M 160 315 C 100 290 120 255 160 275 C 175 285 170 320 160 315 Z" />
      </g>

      {/* 2. Yellow Wreath / Leaves - Right Side (Symmetrical Mirror) */}
      <g id="leaves-right" stroke="#111111" strokeWidth="3.5" strokeLinejoin="round" fill="#FFE600">
        {/* Leaf 1 (Top right) */}
        <path d="M 315 85 C 340 55 320 30 295 55 C 280 70 300 95 315 85 Z" />
        {/* Leaf 2 */}
        <path d="M 340 110 C 375 75 350 45 320 75 C 305 90 325 120 340 110 Z" />
        {/* Leaf 3 */}
        <path d="M 360 145 C 400 105 375 75 340 105 C 325 120 345 155 360 145 Z" />
        {/* Leaf 4 */}
        <path d="M 372 185 C 420 145 395 115 355 145 C 340 160 360 195 372 185 Z" />
        {/* Leaf 5 */}
        <path d="M 375 230 C 430 190 405 160 362 190 C 348 205 365 240 375 230 Z" />
        {/* Leaf 6 (Bottom right) */}
        <path d="M 365 275 C 425 240 400 210 358 235 C 342 250 355 285 365 275 Z" />
        {/* Leaf 7 */}
        <path d="M 340 315 C 400 290 380 255 340 275 C 325 285 330 320 340 315 Z" />
      </g>

      {/* 3. Central Green Circle */}
      <circle cx="250" cy="205" r="115" fill="#1B803E" stroke="#111111" strokeWidth="5" />

      {/* 4. Building / Gapura (White structure in background) */}
      <g id="building" stroke="#111111" strokeWidth="3" fill="#FFFFFF">
        {/* Left Structure */}
        <path d="M 190 255 L 190 170 L 210 165 L 230 190 L 230 255 Z" />
        {/* Right Structure */}
        <path d="M 310 255 L 310 170 L 290 165 L 270 190 L 270 255 Z" />

        {/* Slatted lines on Left Tower */}
        <line x1="190" y1="180" x2="210" y2="176" stroke="#111111" strokeWidth="2.5" />
        <line x1="190" y1="190" x2="210" y2="186" stroke="#111111" strokeWidth="2.5" />
        <line x1="190" y1="200" x2="210" y2="196" stroke="#111111" strokeWidth="2.5" />
        <line x1="190" y1="210" x2="210" y2="206" stroke="#111111" strokeWidth="2.5" />
        <line x1="190" y1="220" x2="210" y2="216" stroke="#111111" strokeWidth="2.5" />
        <line x1="190" y1="230" x2="210" y2="226" stroke="#111111" strokeWidth="2.5" />
        <line x1="190" y1="240" x2="210" y2="236" stroke="#111111" strokeWidth="2.5" />
        <line x1="190" y1="250" x2="210" y2="246" stroke="#111111" strokeWidth="2.5" />

        {/* Slatted lines on Right Tower */}
        <line x1="310" y1="180" x2="290" y2="176" stroke="#111111" strokeWidth="2.5" />
        <line x1="310" y1="190" x2="290" y2="186" stroke="#111111" strokeWidth="2.5" />
        <line x1="310" y1="200" x2="290" y2="196" stroke="#111111" strokeWidth="2.5" />
        <line x1="310" y1="210" x2="290" y2="206" stroke="#111111" strokeWidth="2.5" />
        <line x1="310" y1="220" x2="290" y2="216" stroke="#111111" strokeWidth="2.5" />
        <line x1="310" y1="230" x2="290" y2="226" stroke="#111111" strokeWidth="2.5" />
        <line x1="310" y1="240" x2="290" y2="236" stroke="#111111" strokeWidth="2.5" />
        <line x1="310" y1="250" x2="290" y2="246" stroke="#111111" strokeWidth="2.5" />
      </g>

      {/* 5. Torch Handle (Shaft) */}
      <rect
        x="237"
        y="140"
        width="26"
        height="150"
        rx="13"
        fill="#FFE600"
        stroke="#111111"
        strokeWidth="4"
      />

      {/* 6. Torch Bowl (Mangkuk Obor Berulir) */}
      <g id="torch-bowl" stroke="#111111" strokeWidth="3.5" fill="#FFE600">
        <path d="M 215 110 C 215 145 285 145 285 110 Z" />
        <ellipse cx="250" cy="110" rx="35" ry="10" />
        <ellipse cx="250" cy="118" rx="31" ry="7" fill="none" />
        <ellipse cx="250" cy="126" rx="26" ry="6" fill="none" />
        <ellipse cx="250" cy="134" rx="20" ry="5" fill="none" />
      </g>

      {/* 7. Red Flame (Nyala Api 5 Lekukan) */}
      <path
        d="M 250 5 
           C 268 25 282 30 282 50 
           C 282 60 295 55 295 72 
           C 295 90 280 102 250 102 
           C 220 102 205 90 205 72 
           C 205 55 218 60 218 50 
           C 218 30 232 25 250 5 Z"
        fill="#E52421"
        stroke="#111111"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* Flame Inner Detail lines */}
      <path
        d="M 232 65 Q 240 45 250 20 Q 260 45 268 65"
        fill="none"
        stroke="#111111"
        strokeWidth="2.5"
      />

      {/* 8. PGRI Box (Trapesium/Persegi Putih) */}
      <polygon
        points="185,305 315,305 310,355 190,355"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="4"
      />
      <text
        x="250"
        y="343"
        fontSize="34"
        fontWeight="900"
        fontFamily="'Times New Roman', Georgia, serif"
        fill="#E52421"
        textAnchor="middle"
        letterSpacing="2"
      >
        PGRI
      </text>

      {/* 9. Bottom Wavy Ribbon (Pita Putih "YAYASAN PEMBINA LEMBAGA PENDIDIKAN") */}
      <g id="ribbon">
        {/* Left Swallowtail Back Fold */}
        <polygon points="40,335 5,348 20,380 50,365" fill="#E2E8F0" stroke="#111111" strokeWidth="3" />
        {/* Right Swallowtail Back Fold */}
        <polygon points="460,335 495,348 480,380 450,365" fill="#E2E8F0" stroke="#111111" strokeWidth="3" />

        {/* Main Ribbon Body */}
        <path
          d="M 5 348 L 40 330 C 130 380 370 380 460 330 L 495 348 C 455 385 410 405 250 405 C 90 405 45 385 5 348 Z"
          fill="#FFFFFF"
          stroke="#111111"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />

        {/* Text along curved path */}
        <path id="ribbon-text-path" d="M 30 368 Q 250 415 470 368" fill="none" />
        <text fontSize="20" fontWeight="900" fontFamily="sans-serif" fill="#111111" letterSpacing="1">
          <textPath href="#ribbon-text-path" startOffset="50%" textAnchor="middle">
            YAYASAN PEMBINA LEMBAGA PENDIDIKAN
          </textPath>
        </text>
      </g>
    </svg>
  );
};
