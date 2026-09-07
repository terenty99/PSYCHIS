import React, { useState, useRef } from 'react';
import { Zap, Sparkles, Sliders } from 'lucide-react';
import { useSparkTelemetry } from '../../hooks/useSparkTelemetry';

export const SparkTerminal = ({ onExecuteQuery, isGenerating = false, onOpenSettings }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const { telemetry, refreshTelemetry } = useSparkTelemetry();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onExecuteQuery && query.trim() && !isGenerating) {
      onExecuteQuery(query.trim());
      setQuery('');
    }
  };

  return (
    <footer
      id="spark-terminal"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={() => inputRef.current?.focus()}
      className="fixed z-[65] flex items-center bottom-4 left-1/2 -translate-x-1/2 w-[740px] max-w-[94vw] h-11 px-3.5 rounded-2xl bg-[#0F121A] text-white border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_16px_36px_rgba(0,0,0,0.4),0_0_24px_rgba(0,0,0,0.2)] select-none pointer-events-auto cursor-text"
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
        <span className="truncate max-w-[180px] sm:max-w-[220px]">
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
                  ? 'online (server)'
                  : telemetry.status === 'groq'
                  ? 'online (Groq)'
                  : telemetry.status === 'direct'
                  ? 'online (Gemini)'
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
          placeholder='Research query or "Bridge 0x01 and 0x04"…'
          className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs placeholder:text-white/40 select-text"
          spellCheck={false}
          autoComplete="off"
          disabled={isGenerating}
        />

        <button
          id="spark-generate-btn"
          type="submit"
          disabled={isGenerating || !query.trim()}
          className="px-4 py-1.5 bg-white-pure hover:bg-[#EAE8E4] disabled:opacity-40 disabled:hover:bg-white-pure text-[#1A1816] rounded-xl font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-150 shrink-0 cursor-pointer shadow-sm hover:-translate-y-0.5 disabled:hover:translate-y-0"
          aria-label="Generate knowledge synthesis"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-3 h-3 text-[#1A1816] animate-spin" />
              <span>Thinking…</span>
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-[#1A1816] fill-[#1A1816]" />
              <span>Generate</span>
            </>
          )}
        </button>
      </form>
    </footer>
  );
};