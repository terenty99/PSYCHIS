import React, { useState, useRef, useEffect } from 'react';
import { Zap, Sparkles, Sliders, ArrowRight, X } from 'lucide-react';
import { PsychisLogo } from './PsychisLogo';
import { useSparkTelemetry } from '../../hooks/useSparkTelemetry';

export const SparkTerminal = ({
  onExecuteQuery,
  isGenerating = false,
  onCancelQuery,
  onOpenSettings,
  isInitialCenter = false,
}) => {
  const [query, setQuery] = useState('');
  const [isCentered, setIsCentered] = useState(isInitialCenter);
  const inputRef = useRef(null);
  const { telemetry, refreshTelemetry } = useSparkTelemetry();

  useEffect(() => {
    setIsCentered(isInitialCenter);
  }, [isInitialCenter]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const q = query.trim();
    if (onExecuteQuery && q && !isGenerating) {
      if (isCentered) {
        setIsCentered(false);
      }
      onExecuteQuery(q);
      setQuery('');
    }
  };

  return (
    <div
      className={`fixed z-[65] left-1/2 -translate-x-1/2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center pointer-events-none ${
        isCentered
          ? 'top-[40%] -translate-y-1/2 w-[720px] max-w-[92vw]'
          : 'top-[calc(100%-3.5rem)] translate-y-0 w-[740px] max-w-[min(740px,calc(100vw-120px))]'
      }`}
    >
      {/* Hero Welcome Header (Centered on Start) */}
      <div
        className={`flex flex-col items-center text-center select-none transition-all duration-500 overflow-hidden ${
          isCentered
            ? 'opacity-100 scale-100 mb-6 max-h-[220px]'
            : 'opacity-0 scale-95 pointer-events-none mb-0 max-h-0'
        }`}
      >
        <div className="flex items-center gap-2.5 mb-2.5">
          <PsychisLogo size={32} />
          <span className="font-display text-2xl font-bold tracking-tight text-[#221E1B]">
            PSYCHIS
          </span>
        </div>
        <p className="font-sans text-[13.5px] text-[#7A746E] max-w-[460px] leading-relaxed">
          Пространственный движок знаний. Исследуйте концепции, научные формулы, алгоритмы и компании на бесконечном холсте.
        </p>
      </div>

      {/* The Interactive Command & Search Bar */}
      <footer
        id="spark-terminal"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => inputRef.current?.focus()}
        className={`relative flex items-center w-full px-3.5 rounded-2xl bg-[#0F121A] text-white border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_16px_36px_rgba(0,0,0,0.4),0_0_24px_rgba(0,0,0,0.2)] select-none pointer-events-auto cursor-text transition-all duration-500 ${
          isCentered
            ? 'h-13 py-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.35),0_0_30px_rgba(0,0,0,0.15)] border-white/30'
            : 'h-11'
        }`}
        role="search"
        aria-label="Obsidian spark terminal command line"
        style={{ backgroundColor: '#0F121A', color: '#FFFFFF' }}
      >
        {/* Interactive Telemetry Indicator */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            refreshTelemetry();
            if (onOpenSettings) onOpenSettings();
          }}
          className="flex items-center gap-2 font-mono text-[11px] text-white/70 border-r border-white/20 pr-3.5 mr-3 shrink-0 hover:text-white transition-colors cursor-pointer group"
          title="Click to configure AI Engine & API Keys"
          aria-label="AI telemetry status and settings"
        >
          <span
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isGenerating ? 'animate-ping' : ''
            }`}
            style={{
              backgroundColor: isGenerating ? '#F59E0B' : telemetry.color,
              boxShadow: `0 0 8px ${isGenerating ? 'rgba(245, 158, 11, 0.9)' : telemetry.color}`,
            }}
            aria-hidden="true"
          />
          <span className="truncate max-w-[160px] sm:max-w-[200px]">
            {isGenerating ? (
              <span className="text-amber-400 font-semibold animate-pulse">spark: synthesizing…</span>
            ) : (
              <>
                spark:{' '}
                <b
                  className="font-semibold group-hover:underline"
                  style={{ color: telemetry.color }}
                >
                  {telemetry.status === 'backend'
                    ? (telemetry.hasTavily ? 'online (Tavily + Server)' : 'online (server)')
                    : telemetry.status === 'groq'
                    ? (telemetry.hasTavily ? 'online (Tavily + Groq)' : 'online (Groq)')
                    : telemetry.status === 'direct'
                    ? 'online (Groq)'
                    : 'offline (synthesizer)'}
                </b>
              </>
            )}
          </span>
          <Sliders className="w-3 h-3 text-white/40 group-hover:text-white/80 transition-colors ml-0.5" />
        </button>

        {/* Terminal Input Form */}
        <form
          onSubmit={handleSubmit}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.focus();
          }}
          className="flex-1 flex items-center gap-2"
        >
          <label htmlFor="spark-input" className="sr-only">
            PSYCHIS Spark Command Line
          </label>
          <span className="font-mono text-[11px] text-white/50 font-medium shrink-0" aria-hidden="true">
            &gt; psychis://spark
          </span>

          <input
            ref={inputRef}
            id="spark-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder={
              isCentered
                ? 'Что вы хотите исследовать? (например, Apple, Интегралы, Квантовая физика…)'
                : 'Research query or "Bridge 0x01 and 0x04"…'
            }
            className={`flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-white/40 select-text transition-all ${
              isCentered ? 'text-[13px]' : 'text-xs'
            }`}
            spellCheck={false}
            autoComplete="off"
            disabled={isGenerating}
          />

          {isGenerating && onCancelQuery ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`bg-white/10 text-white/90 border border-white/15 rounded-xl font-mono flex items-center gap-1.5 shrink-0 ${
                  isCentered ? 'px-3 py-2 text-xs' : 'px-3 py-1.5 text-[11px]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Thinking…</span>
              </div>
              <button
                type="button"
                onClick={onCancelQuery}
                title="Отменить синтез (Esc)"
                className={`bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl font-mono flex items-center gap-1 transition-all cursor-pointer ${
                  isCentered ? 'px-3 py-2 text-xs' : 'px-2.5 py-1.5 text-[11px]'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel [Esc]</span>
              </button>
            </div>
          ) : (
            <button
              id="spark-generate-btn"
              type="submit"
              disabled={isGenerating || !query.trim()}
              className={`bg-white-pure hover:bg-[#EAE8E4] disabled:opacity-40 disabled:hover:bg-white-pure text-[#1A1816] rounded-xl font-mono font-semibold flex items-center gap-1.5 transition-all duration-150 shrink-0 cursor-pointer shadow-sm hover:-translate-y-0.5 disabled:hover:translate-y-0 active:scale-95 ${
                isCentered ? 'px-4 py-2 text-xs' : 'px-4 py-1.5 text-[11px]'
              }`}
              aria-label="Generate knowledge synthesis"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#1A1816] animate-spin" />
                  <span>Thinking…</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-[#1A1816] fill-[#1A1816]" />
                  <span>{isCentered ? 'Исследовать' : 'Generate'}</span>
                  {isCentered && <ArrowRight className="w-3 h-3 text-[#1A1816]/70 ml-0.5" />}
                </>
              )}
            </button>
          )}
        </form>
      </footer>
    </div>
  );
};