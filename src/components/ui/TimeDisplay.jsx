import React, { useState, useEffect } from 'react';

export const TimeDisplay = ({ showSeconds = false, compact = false, className = '' }) => {
  const [timeState, setTimeState] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    return {
      hhmm: `${hours}:${mins}`,
      seconds: secs,
      iso: now.toISOString(),
    };
  });

  useEffect(() => {
    let timerId = null;

    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeState({
        hhmm: `${hours}:${mins}`,
        seconds: secs,
        iso: now.toISOString(),
      });

      if (!showSeconds) {
        // Schedule next update precisely at the roll-over of the next minute
        const delayToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;
        timerId = setTimeout(updateTime, Math.max(1000, delayToNextMinute));
      }
    };

    if (showSeconds) {
      updateTime();
      timerId = setInterval(updateTime, 1000);
      return () => clearInterval(timerId);
    } else {
      updateTime();
      return () => clearTimeout(timerId);
    }
  }, [showSeconds]);

  if (compact) {
    return (
      <time
        dateTime={timeState.iso}
        aria-hidden="true"
        className={`select-none flex items-center gap-1.5 px-2.5 h-7 rounded-xl font-mono text-[11px] text-text-secondary cursor-default hover:text-text-primary transition-colors ${className}`}
        title="Current local time"
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"
          style={{ animationDuration: '2s' }}
          aria-hidden="true"
        />
        <span className="tabular-nums font-semibold tracking-tight text-text-primary">
          {timeState.hhmm}
          {showSeconds && (
            <span className="text-[10px] text-text-muted ml-0.5">:{timeState.seconds}</span>
          )}
        </span>
      </time>
    );
  }

  return (
    <time
      dateTime={timeState.iso}
      aria-hidden="true"
      className={`select-none flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white-pure/90 border border-grey-medium/70 font-mono text-xs leading-none text-text-secondary shadow-3xs h-8 cursor-default ${className}`}
      title="Current local time"
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"
        style={{ animationDuration: '2s' }}
        aria-hidden="true"
      />
      <span className="tabular-nums font-medium tracking-tight">
        {timeState.hhmm}
        {showSeconds && (
          <span className="text-[11px] text-text-muted ml-0.5">:{timeState.seconds}</span>
        )}
      </span>
    </time>
  );
};
