import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TYPING_SPEED, CHARS_PER_TICK } from '../constants';

type FitMode = 'width' | 'both';

type Props = {
  ascii: string;
  accent?: string;
  className?: string;
  style?: React.CSSProperties;
  minFontPx?: number;
  maxFontPx?: number;
  lineHeightRatio?: number; // e.g., 1.05
  fitMode?: FitMode; // width-only (default) or width+height
  bare?: boolean; // if true, render without border/overlay background
};

const AsciiPanel: React.FC<Props> = ({
  ascii,
  accent = '#4fae9b',
  className,
  style,
  minFontPx = 2,
  maxFontPx = 16,
  lineHeightRatio = 1.05,
  fitMode = 'width',
  bare = false,
}) => {
  // Only used for font auto-fit; avoids re-renders during typing
  const [fontPx, setFontPx] = useState(10);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);
  const started = useRef(false);
  const rafId = useRef<number | null>(null);
  const chPerPxRef = useRef<number | null>(null);

  const lines = useMemo(() => ascii.split('\n'), [ascii]);
  const maxCols = useMemo(() => lines.reduce((m, l) => Math.max(m, l.length), 0), [lines]);
  const rows = lines.length;

  // Measure 1ch in pixels per font-size px (char width ratio)
  const measureChPerPx = (container: HTMLElement) => {
    if (chPerPxRef.current) return chPerPxRef.current;
    const probe = document.createElement('div');
    probe.className = 'font-mono';
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.whiteSpace = 'nowrap';
    probe.style.left = '-9999px';
    probe.style.top = '0';
    probe.style.fontSize = '100px';
    probe.style.lineHeight = '100px';
    probe.style.width = '1ch';
    probe.textContent = '0';
    container.appendChild(probe);
    const widthPx = probe.getBoundingClientRect().width || 60; // fallback
    container.removeChild(probe);
    const ratio = widthPx / 100; // px per 1px of font-size
    chPerPxRef.current = ratio || 0.6;
    return chPerPxRef.current;
  };

  // Fit the ASCII to the container by adjusting font-size using width and optional height constraints
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const compute = () => {
      const cs = window.getComputedStyle(el);
      const padL = parseFloat(cs.paddingLeft || '0');
      const padR = parseFloat(cs.paddingRight || '0');
      const padT = parseFloat(cs.paddingTop || '0');
      const padB = parseFloat(cs.paddingBottom || '0');
      const innerW = Math.max(0, el.clientWidth - padL - padR);
      const innerH = Math.max(0, el.clientHeight - padT - padB);
      if (innerW <= 0 || maxCols === 0) return;

      const chPerPx = measureChPerPx(el);
      // Width-constrained font size based on columns
      const pxFromW = Math.floor(innerW / (chPerPx * Math.max(1, maxCols)));
      // Height-constrained font size based on rows and desired line height (optional)
      const pxFromH = fitMode === 'both' && innerH > 0
        ? Math.floor(innerH / (lineHeightRatio * Math.max(1, rows)))
        : Number.MAX_SAFE_INTEGER;

      const next = Math.min(maxFontPx, Math.min(pxFromW, pxFromH));
      if (!Number.isNaN(next) && next !== fontPx) setFontPx(Math.max(minFontPx, next));
    };

    compute();
    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    window.addEventListener('resize', compute);
    return () => { ro.disconnect(); window.removeEventListener('resize', compute); };
  }, [maxCols, rows, minFontPx, maxFontPx, lineHeightRatio, fontPx, fitMode]);

  // Start typing when in view, using rAF and direct DOM writes (no React re-render)
  useEffect(() => {
    const container = rootRef.current;
    const pre = preRef.current;
    if (!container || !pre) return;

    // Initial placeholder to reserve a bit of height for layout stability
    pre.textContent = lines.slice(0, 16).join('\n');

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      pre.textContent = ascii;
      return;
    }

    const onIntersect = (entries: IntersectionObserverEntry[]) => {
      if (!entries.some(e => e.isIntersecting)) return;
      if (started.current) return;
      started.current = true;

      const total = ascii.length;
      const desiredFrames = 42; // ~0.7s at 60fps
      const minStep = CHARS_PER_TICK;
      const step = Math.max(minStep, Math.ceil(total / desiredFrames));

      let visibleChars = 0;
      let acc = 0;

      const tick = () => {
        acc += TYPING_SPEED;
        while (acc >= TYPING_SPEED) {
          acc -= TYPING_SPEED;
          visibleChars = Math.min(total, visibleChars + step);
        }
        pre.textContent = ascii.slice(0, visibleChars);
        if (visibleChars < total) {
          rafId.current = requestAnimationFrame(tick);
        } else {
          if (rafId.current) cancelAnimationFrame(rafId.current);
          rafId.current = null;
          pre.textContent = ascii; // ensure final text
        }
      };

      rafId.current = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(onIntersect, { threshold: 0.2 });
    io.observe(container);
    return () => {
      io.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [ascii, lines]);

  const Wrapper: React.ElementType = 'div';

  return (
    <Wrapper
      ref={rootRef}
      className={`${bare ? '' : 'relative border p-3 md:p-4'} ${className ?? ''}`}
      style={{ ...(bare ? {} : { borderColor: accent, backgroundColor: '#000' }), ...style }}
    >
      {/* scanline overlay */}
      {!bare && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.1) 50%)',
            backgroundSize: '100% 10px',
            zIndex: 1,
          }}
        />
      )}
      <pre
        ref={preRef}
        className={`relative ${bare ? '' : 'z-10'} font-mono whitespace-pre text-left`}
        style={{
          color: accent,
          fontSize: `${fontPx}px`,
          lineHeight: `${Math.round(fontPx * lineHeightRatio)}px`,
          letterSpacing: '0px',
          fontVariantLigatures: 'none',
          maxWidth: '100%',
          overflow: 'visible',
        }}
      />
    </Wrapper>
  );
};

export default AsciiPanel;
