import React from 'react';

export const ConvexHull = ({
  bounds,
  label = 'Applied Kinematics & Transport',
  isCollapsed = false,
  onToggleCollapse,
}) => {
  if (!bounds) return null;

  return (
    <>
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-10" aria-hidden="true">
        <rect
          x={bounds.x}
          y={bounds.y}
          width={bounds.width}
          height={bounds.height}
          rx="22"
          fill="rgba(232, 230, 227, 0.18)"
          stroke="var(--grey-strong)"
          strokeWidth="1.4"
          strokeDasharray="8 6"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* Cluster Label & Collapse Toggle */}
      <div
        className="fixed z-20 font-mono text-[10.5px] font-semibold text-text-primary bg-white-pure/95 backdrop-blur-md px-3 py-1 rounded-full border border-grey-strong flex items-center gap-2 shadow-xs pointer-events-auto select-none transition-all duration-300"
        style={{
          top: `${bounds.y + 6}px`,
          left: `${bounds.x + 14}px`,
        }}
      >
        <span className="w-2 h-2 rounded-full bg-text-secondary" aria-hidden="true" />
        <span>{label}</span>
        <button
          onClick={onToggleCollapse}
          className="btn-contemplative !px-2 !py-0 text-[10px] rounded-md h-4 min-w-4 font-mono font-bold"
          aria-label={isCollapsed ? 'Expand cluster' : 'Collapse cluster'}
        >
          {isCollapsed ? '+' : '−'}
        </button>
      </div>
    </>
  );
};
