import React from 'react';

/**
 * SpatialContourBackground / HandmadePaperBackground — PSYCHIS Minimalist Spatially-Conscious Canvas Surface
 * 
 * Architecture:
 * - Lives strictly inside the transformed viewport div in SpatialCanvas.jsx
 * - Inherits identical transform: translate(pan.x, pan.y) scale(zoom)
 * - Consists of EXACTLY two layers:
 *   1. Layer 1 (Base): The preserved luminous white-gray gradient covering full canvas area
 *   2. Layer 2 (Overlay): Scalable architectural topographic contours & isolines (No paper grain/fibers)
 */

export const SpatialContourBackground = () => {
  return (
    <div
      className="absolute pointer-events-none select-none z-0 overflow-visible"
      style={{
        left: -10000,
        top: -10000,
        width: 20000,
        height: 20000,
      }}
    >
      {/* LAYER 1 (BASE): Preserved White-Gray Atelier Gradient */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(175deg, #FFFFFF 0%, #F9F8F6 30%, #F2F0ED 70%, #EAE8E4 100%)',
        }}
      />

      {/* LAYER 2 (OVERLAY): Scalable Architectural Topographic Contours & Isolines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="contour-pattern"
            width="1000"
            height="1000"
            patternUnits="userSpaceOnUse"
          >
            {/* 1. Fine Micro-Contours (0.55px, subtle elevation steps) */}
            <g stroke="#D8D5CE" strokeWidth="0.55" fill="none" opacity="0.28">
              {/* Summit 1 micro loops */}
              <path d="M 260 235 C 280 235, 295 245, 295 260 C 295 275, 280 285, 260 285 C 240 285, 225 275, 225 260 C 225 245, 240 235, 260 235 Z" />
              <path d="M 260 190 C 305 190, 340 220, 340 260 C 340 305, 295 330, 260 330 C 220 330, 180 300, 180 260 C 180 220, 215 190, 260 190 Z" />
              <path d="M 260 150 C 330 150, 380 205, 380 260 C 380 330, 315 370, 260 370 C 195 370, 140 315, 140 260 C 140 195, 195 150, 260 150 Z" />
              <path d="M 260 110 C 355 110, 420 185, 420 260 C 420 355, 345 410, 260 410 C 165 410, 100 340, 100 260 C 100 170, 170 110, 260 110 Z" />
              <path d="M 260 70 C 380 70, 460 175, 460 260 C 460 380, 365 450, 260 450 C 140 450, 60 360, 60 260 C 60 150, 145 70, 260 70 Z" />
              <path d="M 260 35 C 405 35, 500 160, 500 260 C 500 405, 390 490, 260 490 C 115 490, 20 380, 20 260 C 20 130, 120 35, 260 35 Z" />

              {/* Summit 2 micro loops */}
              <path d="M 740 655 C 760 655, 775 665, 775 680 C 775 695, 760 705, 740 705 C 720 705, 705 695, 705 680 C 705 665, 720 655, 740 655 Z" />
              <path d="M 740 610 C 785 610, 825 640, 825 680 C 825 725, 780 750, 740 750 C 695 750, 655 720, 655 680 C 655 640, 690 610, 740 610 Z" />
              <path d="M 740 565 C 815 565, 870 615, 870 680 C 870 755, 805 805, 740 805 C 660 805, 610 745, 610 680 C 610 605, 665 565, 740 565 Z" />
              <path d="M 740 515 C 845 515, 915 585, 915 680 C 915 780, 830 855, 740 855 C 630 855, 555 775, 555 680 C 555 575, 635 515, 740 515 Z" />
              <path d="M 740 465 C 875 465, 960 555, 960 680 C 960 810, 855 915, 740 915 C 595 915, 505 810, 505 680 C 505 535, 605 465, 740 465 Z" />

              {/* Saddle / Depression micro loops */}
              <path d="M 340 680 C 375 680, 400 700, 400 720 C 400 745, 370 760, 340 760 C 305 760, 280 740, 280 720 C 280 695, 310 680, 340 680 Z" />
              <path d="M 340 635 C 405 635, 450 675, 450 720 C 450 770, 395 805, 340 805 C 280 805, 235 765, 235 720 C 235 670, 280 635, 340 635 Z" />
              <path d="M 340 590 C 435 590, 495 650, 495 720 C 495 795, 420 850, 340 850 C 255 850, 185 785, 185 720 C 185 645, 250 590, 340 590 Z" />

              {/* Flowing traversing micro lines */}
              <path d="M 0 80 C 160 30, 380 140, 520 100 C 680 50, 860 130, 1000 80" />
              <path d="M 0 120 C 160 70, 380 180, 520 140 C 680 90, 860 170, 1000 120" />
              <path d="M 0 160 C 160 110, 380 220, 520 180 C 680 130, 860 210, 1000 160" />
              <path d="M 0 200 C 160 150, 380 260, 520 220 C 680 170, 860 250, 1000 200" />
              <path d="M 0 440 C 180 380, 340 500, 520 460 C 700 420, 840 500, 1000 440" />
              <path d="M 0 480 C 180 420, 340 540, 520 500 C 700 460, 840 540, 1000 480" />
              <path d="M 0 520 C 180 460, 340 580, 520 540 C 700 500, 840 580, 1000 520" />
              <path d="M 0 560 C 180 500, 340 620, 520 580 C 700 540, 840 620, 1000 560" />
              <path d="M 0 860 C 160 800, 340 920, 500 880 C 660 830, 840 910, 1000 860" />
              <path d="M 0 900 C 160 840, 340 960, 500 920 C 660 870, 840 950, 1000 900" />
              <path d="M 0 940 C 160 880, 340 1000, 500 960 C 660 910, 840 990, 1000 940" />
              <path d="M 0 980 C 160 920, 340 1040, 500 1000 C 660 950, 840 1030, 1000 980" />

              {/* Vertical traversing micro lines */}
              <path d="M 60 0 C 20 150, 120 350, 70 500 C 20 650, 100 850, 60 1000" />
              <path d="M 100 0 C 60 150, 160 350, 110 500 C 60 650, 140 850, 100 1000" />
              <path d="M 140 0 C 100 150, 200 350, 150 500 C 100 650, 180 850, 140 1000" />
              <path d="M 500 0 C 460 180, 560 340, 520 500 C 480 660, 550 820, 500 1000" />
              <path d="M 540 0 C 500 180, 600 340, 560 500 C 520 660, 590 820, 540 1000" />
              <path d="M 580 0 C 540 180, 640 340, 600 500 C 560 660, 630 820, 580 1000" />
              <path d="M 880 0 C 840 180, 920 340, 880 500 C 840 660, 920 820, 880 1000" />
              <path d="M 920 0 C 880 180, 960 340, 920 500 C 880 660, 960 820, 920 1000" />
            </g>

            {/* 2. Intermediate Contours (0.85px, crisp secondary elevation lines) */}
            <g stroke="#C8C4BC" strokeWidth="0.85" fill="none" opacity="0.38">
              {/* Summit 1 intermediate loops */}
              <path d="M 260 215 C 295 215, 315 235, 315 260 C 315 290, 290 305, 260 305 C 225 305, 205 285, 205 260 C 205 235, 225 215, 260 215 Z" />
              <path d="M 260 170 C 320 170, 360 210, 360 260 C 360 320, 310 350, 260 350 C 200 350, 160 310, 160 260 C 160 205, 205 170, 260 170 Z" />
              <path d="M 260 130 C 345 130, 400 195, 400 260 C 400 345, 335 390, 260 390 C 175 390, 125 330, 125 260 C 125 180, 180 130, 260 130 Z" />
              <path d="M 260 55 C 395 55, 480 165, 480 260 C 480 395, 385 470, 260 470 C 125 470, 55 370, 55 260 C 55 140, 135 55, 260 55 Z" />
              <path d="M 260 20 C 420 20, 520 150, 520 260 C 520 420, 410 510, 260 510 C 100 510, 20 390, 20 260 C 20 120, 110 20, 260 20 Z" />

              {/* Summit 2 intermediate loops */}
              <path d="M 740 635 C 775 635, 800 655, 800 680 C 800 710, 775 725, 740 725 C 705 725, 680 705, 680 680 C 680 655, 705 635, 740 635 Z" />
              <path d="M 740 590 C 800 590, 845 630, 845 680 C 845 740, 795 775, 740 775 C 675 775, 635 735, 635 680 C 635 625, 675 590, 740 590 Z" />
              <path d="M 740 490 C 860 490, 935 570, 935 680 C 935 800, 845 885, 740 885 C 610 885, 530 795, 530 680 C 530 550, 615 490, 740 490 Z" />
              <path d="M 740 440 C 890 440, 980 540, 980 680 C 980 830, 870 940, 740 940 C 570 940, 480 830, 480 680 C 480 510, 580 440, 740 440 Z" />

              {/* Saddle Intermediate loops */}
              <path d="M 340 660 C 390 660, 425 690, 425 720 C 425 760, 385 780, 340 780 C 290 780, 260 750, 260 720 C 260 685, 295 660, 340 660 Z" />
              <path d="M 340 615 C 420 615, 470 665, 470 720 C 470 785, 410 825, 340 825 C 265 825, 215 775, 215 720 C 215 655, 265 615, 340 615 Z" />
              <path d="M 340 570 C 450 570, 515 640, 515 720 C 515 810, 435 870, 340 870 C 240 870, 170 800, 170 720 C 170 630, 235 570, 340 570 Z" />

              {/* Flowing traversing intermediates */}
              <path d="M 0 100 C 160 50, 380 160, 520 120 C 680 70, 860 150, 1000 100" />
              <path d="M 0 180 C 160 130, 380 240, 520 200 C 680 150, 860 230, 1000 180" />
              <path d="M 0 420 C 180 360, 340 480, 520 440 C 700 400, 840 480, 1000 420" />
              <path d="M 0 460 C 180 400, 340 520, 520 480 C 700 440, 840 520, 1000 460" />
              <path d="M 0 540 C 180 480, 340 600, 520 560 C 700 520, 840 600, 1000 540" />
              <path d="M 0 580 C 180 520, 340 640, 520 600 C 700 560, 840 640, 1000 580" />
              <path d="M 0 840 C 160 780, 340 900, 500 860 C 660 810, 840 890, 1000 840" />
              <path d="M 0 880 C 160 820, 340 940, 500 900 C 660 850, 840 930, 1000 880" />
              <path d="M 0 960 C 160 900, 340 1020, 500 980 C 660 930, 840 1010, 1000 960" />

              {/* Vertical traversing intermediates */}
              <path d="M 80 0 C 40 150, 140 350, 90 500 C 40 650, 120 850, 80 1000" />
              <path d="M 120 0 C 80 150, 180 350, 130 500 C 80 650, 160 850, 120 1000" />
              <path d="M 160 0 C 120 150, 220 350, 170 500 C 120 650, 200 850, 160 1000" />
              <path d="M 520 0 C 480 180, 580 340, 540 500 C 500 660, 570 820, 520 1000" />
              <path d="M 560 0 C 520 180, 620 340, 580 500 C 540 660, 610 820, 560 1000" />
              <path d="M 600 0 C 560 180, 660 340, 620 500 C 580 660, 650 820, 600 1000" />
              <path d="M 900 0 C 860 180, 940 340, 900 500 C 860 660, 940 820, 900 1000" />
            </g>

            {/* 3. Major Index Contours (1.3px, high-visibility topological anchors) */}
            <g stroke="#B5B0A8" strokeWidth="1.3" fill="none" opacity="0.48">
              {/* Summit 1 Index (+500m) */}
              <path d="M 260 90 C 370 90, 440 180, 440 260 C 440 370, 360 430, 260 430 C 150 430, 90 350, 90 260 C 90 160, 160 90, 260 90 Z" />

              {/* Summit 2 Index (+400m) */}
              <path d="M 740 540 C 830 540, 890 600, 890 680 C 890 770, 820 830, 740 830 C 640 830, 580 760, 580 680 C 580 590, 640 540, 740 540 Z" />

              {/* Ridge Index (+300m) */}
              <path d="M 0 500 C 180 440, 340 560, 520 520 C 700 480, 840 560, 1000 500" />

              {/* North Ridge Index (+200m) */}
              <path d="M 0 140 C 160 90, 380 200, 520 160 C 680 110, 860 190, 1000 140" />

              {/* South Valley Index (+150m) */}
              <path d="M 0 920 C 160 860, 340 980, 500 940 C 660 890, 840 970, 1000 920" />
            </g>

            {/* 4. Geodetic Markers, Summits, & Typography Labels */}
            {/* Summit 1 Peak Marker */}
            <path d="M 260 250 L 264 258 L 256 258 Z" fill="#8A8782" opacity="0.6" />
            <circle cx="260" cy="260" r="1.5" fill="#4A4540" opacity="0.75" />
            <text x="260" y="274" fill="#8A8782" fontSize="8" fontFamily="'JetBrains Mono', monospace" fontWeight="600" textAnchor="middle" opacity="0.55" letterSpacing="0.5">▲ 620.4m</text>
            <text x="260" y="82" fill="#8A8782" fontSize="7" fontFamily="'JetBrains Mono', monospace" fontWeight="600" textAnchor="middle" opacity="0.45" letterSpacing="0.8">INDEX +500m</text>

            {/* Summit 2 Peak Marker */}
            <path d="M 740 670 L 744 678 L 736 678 Z" fill="#8A8782" opacity="0.6" />
            <circle cx="740" cy="680" r="1.5" fill="#4A4540" opacity="0.75" />
            <text x="740" y="694" fill="#8A8782" fontSize="8" fontFamily="'JetBrains Mono', monospace" fontWeight="600" textAnchor="middle" opacity="0.55" letterSpacing="0.5">▲ 485.2m</text>
            <text x="740" y="532" fill="#8A8782" fontSize="7" fontFamily="'JetBrains Mono', monospace" fontWeight="600" textAnchor="middle" opacity="0.45" letterSpacing="0.8">INDEX +400m</text>

            {/* Saddle Marker */}
            <circle cx="340" cy="720" r="2" fill="none" stroke="#8A8782" strokeWidth="0.8" opacity="0.5" />
            <text x="340" y="734" fill="#8A8782" fontSize="7.5" fontFamily="'JetBrains Mono', monospace" fontWeight="500" textAnchor="middle" opacity="0.45">⊙ 220.0m</text>

            {/* Traverse Labels */}
            <text x="520" y="513" fill="#8A8782" fontSize="7" fontFamily="'JetBrains Mono', monospace" fontWeight="600" textAnchor="middle" opacity="0.45" letterSpacing="0.8">INDEX +300m</text>
            <text x="520" y="153" fill="#8A8782" fontSize="7" fontFamily="'JetBrains Mono', monospace" fontWeight="600" textAnchor="middle" opacity="0.45" letterSpacing="0.8">INDEX +200m</text>
            <text x="500" y="933" fill="#8A8782" fontSize="7" fontFamily="'JetBrains Mono', monospace" fontWeight="600" textAnchor="middle" opacity="0.45" letterSpacing="0.8">INDEX +150m</text>

            {/* Geodetic Survey Grid Crosshairs & Coordinate Labels */}
            <path d="M 493 500 H 507 M 500 493 V 507" stroke="#8A8782" strokeWidth="0.85" opacity="0.45" />
            <text x="512" y="503" fill="#8A8782" fontSize="7.5" fontFamily="'JetBrains Mono', monospace" opacity="0.45" letterSpacing="0.5">SEC 05 // 1000m</text>

            <path d="M 93 100 H 107 M 100 93 V 107" stroke="#8A8782" strokeWidth="0.8" opacity="0.35" />
            <path d="M 893 100 H 907 M 900 93 V 107" stroke="#8A8782" strokeWidth="0.8" opacity="0.35" />
            <path d="M 93 900 H 107 M 100 893 V 907" stroke="#8A8782" strokeWidth="0.8" opacity="0.35" />
            <path d="M 893 900 H 907 M 900 893 V 907" stroke="#8A8782" strokeWidth="0.8" opacity="0.35" />
          </pattern>
        </defs>

        {/* Scalable Seamless Topographic Contour Surface */}
        <rect
          x="-10000"
          y="-10000"
          width="20000"
          height="20000"
          fill="url(#contour-pattern)"
        />
      </svg>
    </div>
  );
};

// Backwards compatibility alias
export const HandmadePaperBackground = SpatialContourBackground;
