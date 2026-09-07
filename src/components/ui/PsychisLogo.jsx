import React from 'react';

/**
 * PSYCHIS Core Spatial Linkage Logo
 * 
 * Specification:
 * - Two precise dot nodes connected by a single cubic Bézier curve
 * - Chebyshev linkage asymmetric tension (straightened baseline transitioning to vertical coupling)
 * - Rendered on crisp white background with warm dark gray (#4A4540) monoline stroke
 */
export const PsychisLogo = ({
  size = 24,
  showText = false,
  className = '',
  iconClassName = '',
  background = 'white',
  withBorder = true,
  strokeColor = '#4A4540',
  title = 'PSYCHIS — Spatial Knowledge Engine',
}) => {
  const hasBg = background === 'white' || background === 'true';

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      title={title}
    >
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center flex-shrink-0 transition-all ${
          hasBg
            ? `bg-white rounded-lg p-[15%] ${withBorder ? 'border border-[#E4E1DC] shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : ''}`
            : ''
        } ${iconClassName}`}
      >
        <svg
          viewBox="0 0 128 128"
          width="100%"
          height="100%"
          className="overflow-visible"
          aria-hidden="true"
        >
          {/* Chebyshev Asymmetric Linkage Curve */}
          <path
            d="M 30,98 C 76,96 92,56 98,30"
            fill="none"
            stroke={strokeColor}
            strokeWidth="9.5"
            strokeLinecap="round"
          />
          {/* Node A: Spatial Anchor */}
          <circle cx="30" cy="98" r="7.5" fill={strokeColor} />
          {/* Node B: Knowledge Target */}
          <circle cx="98" cy="30" r="7.5" fill={strokeColor} />
        </svg>
      </div>

      {showText && (
        <span className="font-display font-semibold text-[15px] tracking-tight text-text-primary">
          PSYCHIS
        </span>
      )}
    </div>
  );
};

export default PsychisLogo;
