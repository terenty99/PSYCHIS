import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * KaTeX formula renderer with accessible text fallback
 */
export const MathFormula = ({ math, inline = false, ariaLabel }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: !inline,
        throwOnError: false,
      });
    } catch (err) {
      return math;
    }
  }, [math, inline]);

  return (
    <span
      className={`inline-block select-none ${inline ? 'my-0' : 'my-1'} text-text-primary`}
      aria-label={ariaLabel || math}
      role="math"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
