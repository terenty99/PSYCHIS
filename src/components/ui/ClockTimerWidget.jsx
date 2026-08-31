import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const ClockTimerWidget = () => {
  const [localTime, setLocalTime] = useState('--:--:--');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // Local real-time clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setLocalTime(`${hours}:${mins}:${secs}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Research stopwatch timer
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimerSeconds(0);
  };

  const formatTimer = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
  };

  return (
    <aside
      className="fixed top-3.5 left-4 z-40 bg-white-warm/95 backdrop-blur-md border border-grey-medium rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.05),0_6px_16px_-4px_rgba(0,0,0,0.07)] px-3.5 py-1.5 flex items-center gap-3.5 font-mono text-xs select-none"
      role="timer"
      aria-label="Clock and research timer"
    >
      {/* Live local time */}
      <div className="flex items-center gap-2 border-r border-grey-medium pr-3.5">
        <span
          className="w-2 h-2 rounded-full bg-text-muted animate-pulse"
          style={{ boxShadow: '0 0 6px rgba(138, 135, 130, 0.4)' }}
          aria-hidden="true"
        />
        <div>
          <div className="text-[8.5px] text-text-faint font-semibold tracking-wider uppercase">LOCAL</div>
          <div className="text-[12.5px] font-semibold text-text-secondary tabular-nums">{localTime}</div>
        </div>
      </div>

      {/* Stopwatch Timer */}
      <div className="flex items-center gap-3">
        <div>
          <div className="text-[8.5px] text-text-faint font-semibold tracking-wider uppercase">TIMER</div>
          <div className="text-[13px] font-semibold text-text-primary tabular-nums">
            {formatTimer(timerSeconds)}
          </div>
        </div>

        {/* Stopwatch Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleStart}
            className={`btn-contemplative !w-7 !h-7 !p-0 rounded-lg ${isRunning ? 'opacity-40 pointer-events-none' : ''}`}
            aria-label="Start research timer"
            title="Start timer"
          >
            <Play className="w-3 h-3 text-text-secondary fill-text-secondary" />
          </button>
          <button
            onClick={handlePause}
            className={`btn-contemplative !w-7 !h-7 !p-0 rounded-lg ${!isRunning ? 'opacity-40 pointer-events-none' : ''}`}
            aria-label="Pause research timer"
            title="Pause timer"
          >
            <Pause className="w-3 h-3 text-text-secondary fill-text-secondary" />
          </button>
          <button
            onClick={handleReset}
            className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg"
            aria-label="Reset research timer"
            title="Reset timer"
          >
            <RotateCcw className="w-3 h-3 text-text-secondary" />
          </button>
        </div>
      </div>
    </aside>
  );
};
