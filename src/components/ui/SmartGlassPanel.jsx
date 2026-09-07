import React from 'react';

export const SmartGlassPanel = ({
  nodeId,
  children,
  className = '',
  isSelected = false,
  isAnticipating = false,
  isDragging = false,
  isLinkSelected = false,
  isLinkShaking = false,
  style = {},
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  onClick,
  onKeyDown,
  tabIndex = 0,
  ariaLabel,
  role = 'article',
  variant = 'default',
}) => {
  let variantClass = '';
  if (variant === 'website') {
    variantClass = 'border-[1.5px] !border-grey-medium shadow-[0_4px_14px_-4px_rgba(139,135,130,0.12)]';
  } else if (variant === 'contradiction') {
    variantClass = 'border-[1.5px] !border-grey-deep shadow-[0_6px_18px_-5px_rgba(222,217,213,0.15)]';
  }

  return (
    <article
      data-node-id={nodeId}
      id={nodeId ? `node-${nodeId}` : undefined}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      onKeyDown={onKeyDown}
      style={style}
      className={`smart-glass-panel absolute p-4 overflow-hidden select-none ${isSelected ? 'is-selected' : ''} ${
        isAnticipating ? 'is-anticipating' : ''
      } ${isDragging ? 'is-dragging' : ''} ${isLinkSelected ? 'link-source-selected' : ''} ${
        isLinkShaking ? 'link-hover-shake' : ''
      } ${variantClass} ${className}`}
    >
      {(isSelected || isAnticipating) && (
        <span className="absolute top-1.5 right-2 font-mono text-[8px] font-bold text-text-muted/80 tracking-wider pointer-events-none select-none uppercase">
          [SELECTED]
        </span>
      )}
      {children}
    </article>
  );
};
