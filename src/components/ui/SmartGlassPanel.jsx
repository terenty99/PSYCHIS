import React from 'react';

export const SmartGlassPanel = ({
  nodeId,
  children,
  className = '',
  isSelected = false,
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
        isDragging ? 'is-dragging' : ''
      } ${isLinkSelected ? 'link-source-selected' : ''} ${
        isLinkShaking ? 'link-hover-shake' : ''
      } ${variantClass} ${className}`}
    >
      {children}
    </article>
  );
};
