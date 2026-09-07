import React, { useMemo } from 'react';
import katex from 'katex';

export const sanitizeLatex = (raw) => {
  if (!raw || typeof raw !== 'string') return '';
  let str = raw.trim();

  // Fix formfeed artifacts (\f interpreted as formfeed by bad JSON decoders)
  str = str.replace(/\x0c/g, '\\f');

  // Fix fused Law of Sines / trigonometric fractions like fracasinA -> \frac{a}{\sin A}
  str = str.replace(/\\?frac([a-zA-Z0-9])\\?sin([a-zA-Z0-9])/gi, '\\frac{$1}{\\sin $2}');
  str = str.replace(/\\?frac([a-zA-Z0-9])\\?cos([a-zA-Z0-9])/gi, '\\frac{$1}{\\cos $2}');
  str = str.replace(/\\?frac([a-zA-Z0-9])\\?tan([a-zA-Z0-9])/gi, '\\frac{$1}{\\tan $2}');

  // Restore dropped backslashes before common LaTeX math operators
  str = str.replace(/(?<!\\)\b(frac|sqrt|sin|cos|tan|cot|sec|csc|log|ln|lim|sum|prod|int|oint|partial|nabla|theta|alpha|beta|gamma|delta|epsilon|lambda|mu|pi|rho|sigma|tau|phi|omega|Delta|Gamma|Lambda|Phi|Psi|Omega|cdot|times|approx|ne|le|ge|pm|infty|to)\b/g, '\\$1');

  // Fix over-escaped double backslashes
  str = str.replace(/\\\\([a-zA-Z]+)/g, '\\$1');

  return str;
};

/**
 * KaTeX formula renderer with accessible text fallback and complete crash-safety.
 */
export const MathFormula = ({ math, inline = false, ariaLabel }) => {
  // Coerce any input into a safe string representation
  const mathStr = useMemo(() => {
    if (math == null) return '';
    let raw = '';
    if (typeof math === 'string') raw = math.trim();
    else if (typeof math === 'object') {
      raw = (math.formula || math.equation || math.latex || math.expr || '').trim();
    } else {
      raw = String(math).trim();
    }
    return sanitizeLatex(raw);
  }, [math]);

  const html = useMemo(() => {
    if (!mathStr) return '';
    try {
      return katex.renderToString(mathStr, {
        displayMode: !inline,
        throwOnError: false,
      });
    } catch (err) {
      return '';
    }
  }, [mathStr, inline]);

  if (!mathStr) return null;

  return (
    <span
      className={`inline-block select-none ${inline ? 'my-0' : 'my-1'} text-text-primary`}
      aria-label={typeof ariaLabel === 'string' ? ariaLabel : mathStr}
      role="math"
      dangerouslySetInnerHTML={{ __html: html || mathStr }}
    />
  );
};
