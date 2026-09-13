import React, { useState, useEffect } from 'react';

/**
 * PSYCHIS In-Canvas Progressive Node Synthesis Preview
 * Matches the warm-paper, light glassmorphic aesthetic with dashed border,
 * top-left rust synthesis badge, top-right node ID badge, horizontal skeleton bars,
 * and live generation status telemetry.
 */
export const GeneratingPreviewNode = ({
  node,
  isSelected = false,
  isAnticipating = false,
  isDragging = false,
  isLinkSelected = false,
  isLinkShaking = false,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  onClick,
  onCancel,
}) => {
  const [stage, setStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1200);
    const t2 = setTimeout(() => setStage(2), 2600);
    const t3 = setTimeout(() => setStage(3), 4200);
    const t4 = setTimeout(() => setStage(4), 6500);
    const timer = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(timer);
    };
  }, []);

  const STAGES = [
    'Поиск веб-источников и генерация связей...',
    'Анализ семантики и контекстной структуры...',
    'Верификация данных и построение графа...',
    'Кристаллизация карточки знаний...',
    'Завершение синтеза и материализация...',
  ];
  const statusText = elapsed >= 8
    ? 'Завершение синтеза и материализация...'
    : STAGES[Math.min(stage, STAGES.length - 1)];

  const queryText = node.data?.query || node.data?.title || node.title || 'Новая карточка';
  const posX = Math.round(node.position?.x ?? 0);
  const posY = Math.round(node.position?.y ?? 0);
  const width = node.width || 340;

  return (
    <article
      data-node-id={node.id}
      id={node.id ? `node-${node.id}` : undefined}
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        width: `${width}px`,
      }}
      className={`absolute z-20 pointer-events-auto rounded-[20px] p-4 select-none bg-[#FAF9F6]/95 backdrop-blur-md border-[1.5px] border-dashed border-[#8C827A]/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-150 ${
        isSelected ? 'ring-1 ring-[#8C827A]/50 shadow-[0_12px_36px_rgba(0,0,0,0.1)]' : ''
      } ${isDragging ? 'opacity-90 cursor-grabbing scale-[1.01]' : 'cursor-grab'}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      role="article"
      aria-label={`Синтез карточки: ${queryText}`}
    >
      {/* 1. Header: Rust Amber Status + [SELECTED] + Node ID Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold text-[#C25E38] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C25E38] animate-pulse shrink-0" />
          <span>СИНТЕЗ КАРТОЧКИ...</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono text-[8px] font-bold text-[#C25E38] uppercase tracking-wider">
            [SYNTHESIS]
          </span>
          <span className="bg-[#EAE6DF] border border-[#DED9D2] text-[#4A453E] font-mono text-[8.5px] font-bold px-1.5 py-0.5 rounded leading-none">
            {node.id || '0x01'}
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              title="Отменить синтез (Esc)"
              className="ml-0.5 p-0.5 rounded hover:bg-red-500/10 text-[#8C827A] hover:text-red-600 transition-colors cursor-pointer"
              aria-label="Отменить синтез"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top-Right Subtle Skeleton Shimmer Bar */}
      <div className="flex justify-end mb-2.5">
        <div className="h-2 w-44 bg-[#ECE8E1] rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* 3. Target Query / Title */}
      <h3 className="font-display text-[15px] font-bold text-[#1C1917] mb-3 leading-snug line-clamp-2">
        {queryText}
      </h3>

      {/* 4. Description Skeleton Lines (Simulating Text Construction) */}
      <div className="space-y-2 mb-4">
        <div className="h-2 bg-[#ECE8E1] rounded-full w-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
        </div>
        <div className="h-2 bg-[#ECE8E1] rounded-full w-[85%] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
        </div>
        <div className="h-2 bg-[#ECE8E1] rounded-full w-[60%] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* 5. Bottom Status Line + Timer + PSYCHIS Watermark */}
      <div className="flex items-center justify-between text-[8.5px] pt-2 border-t border-[#EAE6DF]/80">
        <div className="font-mono text-[#8C827A] flex items-center gap-1.5 min-w-0 truncate">
          <span className="text-[#C25E38] font-bold">•</span>
          <span className="truncate">{statusText}</span>
          <span className="text-[#A8A49E] text-[8px] font-mono shrink-0">({elapsed}s)</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {onCancel && elapsed >= 4 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="font-mono text-[8px] text-red-600/80 hover:text-red-700 underline cursor-pointer"
            >
              Отмена
            </button>
          )}
          <span className="font-mono text-[8px] font-bold text-[#A8A49E] tracking-widest uppercase">
            PSYCHIS
          </span>
        </div>
      </div>
    </article>
  );
};
