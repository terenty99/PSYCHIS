import React, { useState } from 'react';
import { Zap, Terminal } from 'lucide-react';

export const SparkTerminal = ({ onExecuteQuery }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onExecuteQuery) {
      onExecuteQuery(query.trim() || 'Chebyshev Kinematics & Cryogenics');
    }
  };

  return (
    <footer
      className="fixed z-40 flex items-center bottom-4 left-1/2 -translate-x-1/2 w-[740px] max-w-[94vw] h-12 px-4 rounded-2xl bg-obsidian-bg backdrop-blur-2xl border border-white/15 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_20px_45px_rgba(0,0,0,0.35),0_0_25px_rgba(248,247,245,0.08)] select-none"
      role="search"
      aria-label="Obsidian spark terminal command line"
    >
      {/* Telemetry Indicator */}
      <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-white/40 border-r border-white/10 pr-3.5 mr-3.5 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-ping-slow" aria-hidden="true" />
        <span>
          spark: <b className="text-white/70 font-semibold">online</b>
        </span>
      </div>

      {/* Terminal Input Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
        <label htmlFor="spark-input" className="sr-only">
          PSYCHIS Spark Command Line
        </label>
        <span className="font-mono text-xs text-white/40 font-medium shrink-0" aria-hidden="true">
          &gt; psychis://spark
        </span>

        <input
          id="spark-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Research query or "Bridge 0x01 and 0x04"…'
          className="flex-1 bg-transparent border-none outline-none text-white/80 font-mono text-xs placeholder:text-white/30 select-text"
          spellCheck={false}
        />

        <button
          type="submit"
          className="ml-2 px-3.5 py-1.5 bg-white-warm hover:bg-grey-soft text-text-primary rounded-xl font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-200 shrink-0 cursor-pointer"
          aria-label="Generate knowledge synthesis"
        >
          <Zap className="w-3 h-3 text-text-primary fill-text-primary" />
          <span>Generate</span>
        </button>
      </form>
    </footer>
  );
};
