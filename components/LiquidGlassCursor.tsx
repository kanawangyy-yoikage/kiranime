"use client";
/**
 * LiquidGlassCursor
 * ------------------
 * Standalone "liquid glass" wrapper implementing the same core technique as
 * childrentime/liquid-glass (https://github.com/childrentime/liquid-glass),
 * which itself references shuding/liquid-glass.js:
 *
 *   1. An SDF (signed distance field) describes the glass shape (rounded
 *      rect / capsule / circle).
 *   2. For every pixel we run a "fragment shader" that turns SDF distance
 *      into a per-pixel displacement vector (a convex-lens bulge — pixels
 *      near the center get pulled inward more than pixels near the rim).
 *   3. Those vectors are encoded into the R/G channels of an off-screen
 *      <canvas> (R = horizontal, G = vertical), matching the encoding
 *      `feDisplacementMap` expects.
 *   4. The canvas is serialized to a PNG data URL and fed into an SVG
 *      <feImage>/<feDisplacementMap> filter, applied via
 *      `backdrop-filter: url(#filter)` so real page content behind the
 *      glass gets refracted by the browser's own compositor.
 *
 * On top of that core algorithm this component adds the "liquid" cursor
 * follow behaviour: the whole glass leans toward the pointer with a
 * spring/elastic response, and a chromatic-aberration pass (three
 * differently-scaled feDisplacementMap copies, recombined with feBlend)
 * fakes the RGB fringing you see at the edge of real glass.
 *
 * Usage:
 *   <LiquidGlassCursor cornerRadius={24} padding="16px 24px">
 *     <span>Your content</span>
 *   </LiquidGlassCursor>
 *
 * Mouse-container mode (glass reacts to pointer anywhere in a larger area,
 * not just when hovering the glass itself):
 *   const containerRef = useRef<HTMLDivElement>(null)
 *   <div ref={containerRef} className="relative">
 *     <LiquidGlassCursor mouseContainer={containerRef} style={{ position: "absolute", top: 40, left: 40 }}>
 *       <span>Follows the mouse anywhere in the container</span>
 *     </LiquidGlassCursor>
 *   </div>
 */
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type LiquidGlassMode = "standard" | "polar" | "prominent";

export interface LiquidGlassCursorProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** How far the backdrop is displaced by the lens, in px. Default 64. */
  displacementScale?: number;
  /** Extra gaussian blur baked into the glass, in px. Default 0.5. */
  blurAmount?: number;
  /** backdrop-filter saturate() percentage. Default 140. */
  saturation?: number;
  /** RGB channel offset strength used to fake chromatic aberration. Default 2. */
  aberrationIntensity?: number;
  /** 0–1, how "liquid"/springy the follow-the-mouse motion feels. Default 0.25. */
  elasticity?: number;
  /** Corner radius in px. Default 24. */
  cornerRadius?: number;
  /**
   * Minimum width/height guarantee in px, applied via `min-width`/`min-height`
   * (not padding), so the glass box always keeps a real footprint even if a
   * caller's className overrides `padding` with `!important`. Default 40.
   */
  minSize?: number;
  /** CSS padding around children, e.g. "10px 20px". Default "1rem 1.5rem". */
  padding?: string;
  /** Flip highlight polarity for use over light backgrounds. */
  overLight?: boolean;
  /** Visual mode: standard refraction, polar swirl, or a more prominent bevel. */
  mode?: LiquidGlassMode;
  /** Track the mouse across a larger ancestor instead of just this element. */
  mouseContainer?: React.RefObject<HTMLElement | null> | null;
  onClick?: () => void;
  "aria-label"?: string;
  "aria-haspopup"?: React.AriaAttributes["aria-haspopup"];
  "aria-expanded"?: React.AriaAttributes["aria-expanded"];
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** t*t*(3-2t) — slow→fast→slow easing, same as the reference implementation's smoothStep. */
function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Signed distance field for a rounded rectangle centered at the origin. Negative = inside. */
function roundedRectSdf(x: number, y: number, halfWidth: number, halfHeight: number, radius: number): number {
  const qx = Math.abs(x) - halfWidth + radius;
  const qy = Math.abs(y) - halfHeight + radius;
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - radius;
}

/**
 * Convex-lens bulge — the reference project's `fragment`.
 *
 * `roundedRectSdf` returns a value that is very negative deep inside the
 * shape, approaches 0 right at the rim (from inside), and goes positive
 * once outside the shape.
 *
 * We want the classic plano-convex lens look: dead flat (no pull at all,
 * `scaled = 0`) at the center, ramping smoothly up to maximum pull
 * (`scaled ≈ 1`) right at the inner edge of the rim, then dropping straight
 * back to 0 the instant we're outside the glass — a real lens doesn't bend
 * light past its own edge.
 *
 * `smoothStep(-band, 0, d)` is monotonic across that whole inside region
 * (0 far from the rim → 1 at the rim), which is exactly that curve; the
 * explicit `d > 0 → 0` branch handles "outside the shape" since smoothStep
 * alone would otherwise stay pinned at 1 forever past the edge.
 */
function defaultFragment(
  uv: { x: number; y: number },
  halfWidth: number,
  halfHeight: number,
  radius: number,
  polar: boolean
) {
  const ix = uv.x - 0.5;
  const iy = uv.y - 0.5;

  const d = roundedRectSdf(ix, iy, halfWidth, halfHeight, radius);
  // Width of the transition band, in the same normalized units as `d`.
  // Wider band = the bulge reaches further toward the center; narrower =
  // distortion stays confined to a thin ring right at the rim.
  const band = Math.max(halfWidth, halfHeight) * 0.9;
  const scaled = d > 0 ? 0 : smoothStep(-band, 0, d);

  if (polar) {
    // Swirl the pull slightly around the center for the "polar" visual mode.
    const angle = Math.atan2(iy, ix) + scaled * 0.6;
    const radiusFromCenter = Math.hypot(ix, iy) * (1 - scaled * 0.5);
    return {
      x: Math.cos(angle) * radiusFromCenter + 0.5,
      y: Math.sin(angle) * radiusFromCenter + 0.5,
    };
  }

  return { x: ix * scaled + 0.5, y: iy * scaled + 0.5 };
}

/**
 * Builds the R/G-encoded displacement map canvas exactly like the reference
 * project's `updateShader`: first pass computes raw pixel-space (dx, dy) for
 * every pixel, second pass normalizes and writes them into the RGBA buffer.
 * Returns both the data URL and the `scale` feDisplacementMap should use.
 *
 * Rendered at full 1:1 resolution (no downsampling) — the reference project
 * builds its displacement map at the glass's real pixel dimensions, and any
 * downsampling here is exactly what makes the bulge look blocky/stepped
 * instead of a smooth, continuous lens curve. `maxSide` caps compute cost
 * for very large panels without softening the curve itself, since the map
 * is still built at native device-pixel density up to that cap.
 */
function buildDisplacementMap(
  width: number,
  height: number,
  cornerRadius: number,
  polar: boolean,
  maxSide = 512
): { url: string; maxScale: number } | null {
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const nativeW = Math.max(2, Math.round(width * dpr));
  const nativeH = Math.max(2, Math.round(height * dpr));
  // Only downscale if the panel is genuinely huge (e.g. a full-width hero
  // card) — for normal button/pill sizes this is a no-op and we render 1:1.
  const scaleDown = Math.min(1, maxSide / Math.max(nativeW, nativeH));
  const w = Math.max(2, Math.round(nativeW * scaleDown));
  const h = Math.max(2, Math.round(nativeH * scaleDown));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const halfWidth = 0.5 - (Math.max(4, cornerRadius) / Math.min(width, height)) * 0.5;
  const halfHeight = halfWidth; // symmetric bulge footprint; shape comes from `radius` below
  const radius = clamp(cornerRadius / Math.min(width, height), 0.02, 0.5);

  const data = new Uint8ClampedArray(w * h * 4);
  const rawValues = new Float32Array(w * h * 2);
  let maxScale = 0;

  let rvi = 0;
  for (let py = 0; py < h; py++) {
    const v = (py + 0.5) / h;
    for (let px = 0; px < w; px++) {
      const u = (px + 0.5) / w;
      const pos = defaultFragment({ x: u, y: v }, halfWidth, halfHeight, radius, polar);

      const dx = (pos.x - u) * w;
      const dy = (pos.y - v) * h;

      if (Math.abs(dx) > maxScale) maxScale = Math.abs(dx);
      if (Math.abs(dy) > maxScale) maxScale = Math.abs(dy);
      rawValues[rvi++] = dx;
      rawValues[rvi++] = dy;
    }
  }

  maxScale = Math.max(maxScale, 1e-6);

  let idx = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = rawValues[idx++] / maxScale + 0.5;
    const g = rawValues[idx++] / maxScale + 0.5;
    data[i] = r * 255;
    data[i + 1] = g * 255;
    data[i + 2] = 128;
    data[i + 3] = 255;
  }

  ctx.putImageData(new ImageData(data, w, h), 0, 0);
  // maxScale was computed in the map's own pixel units; scale back up by
  // however much we shrank from native device pixels so the
  // feDisplacementMap `scale` attribute (real CSS px) lines up correctly.
  const upscale = 1 / scaleDown / dpr;
  return { url: canvas.toDataURL("image/png"), maxScale: maxScale * upscale };
}

let uid = 0;

export const LiquidGlassCursor = React.forwardRef<HTMLDivElement, LiquidGlassCursorProps>(
  (
    {
      children,
      className,
      style,
      displacementScale = 64,
      blurAmount = 0.5,
      saturation = 140,
      aberrationIntensity = 2,
      elasticity = 0.25,
      cornerRadius = 24,
      minSize = 40,
      padding = "1rem 1.5rem",
      overLight = false,
      mode = "standard",
      mouseContainer = null,
      onClick,
      "aria-label": ariaLabel,
      "aria-haspopup": ariaHaspopup,
      "aria-expanded": ariaExpanded,
    },
    forwardedRef
  ) => {
    const localRef = React.useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;
    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        localRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [forwardedRef]
    );

    const [filterId] = React.useState(() => `liquid-glass-cursor-${++uid}`);
    const [size, setSize] = React.useState({ width: 0, height: 0 });
    const [hovered, setHovered] = React.useState(false);
    const [active, setActive] = React.useState(false);
    const [map, setMap] = React.useState<{ url: string; maxScale: number } | null>(null);

    // Raw (unsprung) offset of pointer relative to element center, normalized -1..1
    const targetOffset = React.useRef({ x: 0, y: 0 });
    // Sprung ("elastic") offset actually applied to transforms
    const springOffset = React.useRef({ x: 0, y: 0 });
    const rafRef = React.useRef<number | null>(null);

    const [renderOffset, setRenderOffset] = React.useState({ x: 0, y: 0 });
    const [glarePos, setGlarePos] = React.useState({ x: 50, y: 50 });

    // Track element size for the SVG filter + displacement map viewport, and
    // (re)build the displacement map whenever the glass is resized.
    React.useEffect(() => {
      const el = localRef.current;
      if (!el) return;
      const update = () => {
        const width = el.offsetWidth;
        const height = el.offsetHeight;
        setSize({ width, height });
        if (width > 1 && height > 1) {
          setMap(buildDisplacementMap(width, height, cornerRadius, mode === "polar"));
        }
      };
      update();
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
      }
      return undefined;
    }, [cornerRadius, mode]);

    // Spring loop: eases springOffset toward targetOffset every frame while
    // either is non-trivial, mimicking Apple's "liquid" elastic bending.
    // `velocityRef` persists across restarts so the loop can be kicked back
    // to life (e.g. on pointer move) without losing existing momentum.
    const velocityRef = React.useRef({ x: 0, y: 0 });

    const stepSpring = React.useCallback(() => {
      const stiffness = clamp(elasticity, 0.02, 1);
      const damping = 0.72;

      const dx = targetOffset.current.x - springOffset.current.x;
      const dy = targetOffset.current.y - springOffset.current.y;

      velocityRef.current.x = (velocityRef.current.x + dx * stiffness) * damping;
      velocityRef.current.y = (velocityRef.current.y + dy * stiffness) * damping;

      springOffset.current.x += velocityRef.current.x;
      springOffset.current.y += velocityRef.current.y;

      setRenderOffset({ x: springOffset.current.x, y: springOffset.current.y });

      const settled =
        Math.abs(dx) < 0.001 &&
        Math.abs(dy) < 0.001 &&
        Math.abs(velocityRef.current.x) < 0.001 &&
        Math.abs(velocityRef.current.y) < 0.001;

      if (!settled) {
        rafRef.current = requestAnimationFrame(stepSpring);
      } else {
        rafRef.current = null;
      }
    }, [elasticity]);

    const kickSpringLoop = React.useCallback(() => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(stepSpring);
      }
    }, [stepSpring]);

    React.useEffect(() => {
      kickSpringLoop();
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      };
    }, [kickSpringLoop]);

    const handlePointerMove = React.useCallback(
      (clientX: number, clientY: number) => {
        const el = localRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // Normalized offset of the pointer from the element's center,
        // clamped so the "liquid" bend never overshoots wildly.
        const nx = clamp((clientX - cx) / (rect.width / 2 || 1), -1.4, 1.4);
        const ny = clamp((clientY - cy) / (rect.height / 2 || 1), -1.4, 1.4);
        targetOffset.current = { x: nx * 8 * elasticity * 4, y: ny * 8 * elasticity * 4 };

        // Glare follows raw pointer position within the surface (0-100%).
        const gx = clamp(((clientX - rect.left) / (rect.width || 1)) * 100, 0, 100);
        const gy = clamp(((clientY - rect.top) / (rect.height || 1)) * 100, 0, 100);
        setGlarePos({ x: gx, y: gy });

        kickSpringLoop();
      },
      [elasticity, kickSpringLoop]
    );

    // Local hover tracking (default mode: glass reacts only to its own bounds).
    React.useEffect(() => {
      if (mouseContainer) return; // handled by the container-mode effect below
      const el = localRef.current;
      if (!el) return;

      const onMove = (e: PointerEvent) => handlePointerMove(e.clientX, e.clientY);
      const onEnter = () => setHovered(true);
      const onLeave = () => {
        setHovered(false);
        targetOffset.current = { x: 0, y: 0 };
        setGlarePos({ x: 50, y: 50 });
        kickSpringLoop();
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
      };
    }, [mouseContainer, handlePointerMove, kickSpringLoop]);

    // mouseContainer mode: listen on the larger ancestor so the glass leans
    // toward the pointer anywhere inside that region, Apple-widget style.
    React.useEffect(() => {
      const containerEl = mouseContainer?.current;
      if (!containerEl) return;

      const onMove = (e: PointerEvent) => {
        setHovered(true);
        handlePointerMove(e.clientX, e.clientY);
      };
      const onLeave = () => {
        setHovered(false);
        targetOffset.current = { x: 0, y: 0 };
        setGlarePos({ x: 50, y: 50 });
        kickSpringLoop();
      };

      containerEl.addEventListener("pointermove", onMove);
      containerEl.addEventListener("pointerleave", onLeave);
      return () => {
        containerEl.removeEventListener("pointermove", onMove);
        containerEl.removeEventListener("pointerleave", onLeave);
      };
      // mouseContainer.current is stable for the component's lifetime in practice;
      // re-run if the ref object identity changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mouseContainer, handlePointerMove, kickSpringLoop]);

    const w = Math.max(1, Math.round(size.width) || 1);
    const h = Math.max(1, Math.round(size.height) || 1);

    // Edge-only displacement scale: prominent mode pushes harder, polar mode
    // relies more on the swirl baked into the displacement map itself.
    const modeScale =
      mode === "prominent" ? displacementScale * 1.4 : mode === "polar" ? displacementScale * 0.85 : displacementScale;
    // Normalize against the map's own natural scale so `displacementScale`
    // keeps meaning a "px of bulge" regardless of glass size.
    const baseScale = map ? (modeScale / 64) * (map.maxScale || 1) : modeScale;
    const aberrationOffset = aberrationIntensity * 3;
    // How far feDisplacementMap can push a pixel is bounded by the largest
    // scale we feed it (the red/blue chromatic-aberration passes go a bit
    // further than baseScale). Half that value is the true max offset in
    // any direction (SVG's displacement scale is a full-range, so a pixel
    // moves up to `scale / 2` px from its source position). Add a flat 8px
    // safety pad on top so rounding/DPR differences never clip a sliver of
    // the curve right at the rim.
    const maxDisplacement = Math.abs(baseScale) + aberrationOffset;
    const filterMargin = Math.ceil(maxDisplacement / 2 + 8);

    const pressScale = active ? 0.97 : hovered ? 1.015 : 1;
    const tiltX = renderOffset.y * -0.6;
    const tiltY = renderOffset.x * 0.6;

    const rimOpacity = overLight ? 0.35 : 0.6;
    const tint = overLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.10)";

    return (
      <div
        ref={setRefs}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={ariaLabel}
        aria-haspopup={ariaHaspopup}
        aria-expanded={ariaExpanded}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        onPointerDown={() => onClick && setActive(true)}
        onPointerUp={() => setActive(false)}
        onPointerCancel={() => setActive(false)}
        className={cn(
          "relative inline-flex isolate select-none",
          onClick && "cursor-pointer",
          className
        )}
        style={{
          borderRadius: cornerRadius,
          padding,
          // Guaranteed floor so the glass box never collapses to ~0×0 when a
          // caller passes an `!important` Tailwind padding override (e.g.
          // leftover `!p-2` classes from an older glass-button variant).
          // min-width/min-height target a different property than padding,
          // so they can't be fought over by the same specificity war — the
          // box keeps enough room for the lens to actually bulge even if
          // its padding gets stomped on from outside.
          minWidth: minSize,
          minHeight: minSize,
          transform: `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${
            renderOffset.x * 0.35
          }px, ${renderOffset.y * 0.35}px, 0) scale(${pressScale})`,
          transition: "transform 120ms ease-out",
          willChange: "transform",
          ...style,
        }}
      >
        {/* SVG lens filter: real SDF-driven displacement map (see buildDisplacementMap
            above) plus a chromatic-aberration pass — same technique as
            childrentime/liquid-glass, just with three scaled copies recombined.

            IMPORTANT: the filter region needs real margin around the glass
            box. With userSpaceOnUse and x/y/width/height pinned exactly to
            the box (0,0,w,h — no margin), every pixel that
            feDisplacementMap pushes outward gets clipped by the filter
            region itself before it's ever composited, which is what made
            the effect look like plain blur with zero curvature. */}
        {w > 1 && h > 1 && map && (
          <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <defs>
              <filter
                id={filterId}
                x={-filterMargin}
                y={-filterMargin}
                width={w + filterMargin * 2}
                height={h + filterMargin * 2}
                filterUnits="userSpaceOnUse"
                primitiveUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feImage
                  href={map.url}
                  x="0"
                  y="0"
                  width={w}
                  height={h}
                  preserveAspectRatio="none"
                  result="map"
                />

                {/* Red channel: displaced slightly further out for chromatic fringing */}
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="map"
                  scale={baseScale + aberrationOffset}
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="dispR"
                />
                <feColorMatrix
                  in="dispR"
                  type="matrix"
                  values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                  result="onlyR"
                />

                {/* Blue channel: displaced the opposite way */}
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="map"
                  scale={baseScale - aberrationOffset}
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="dispB"
                />
                <feColorMatrix
                  in="dispB"
                  type="matrix"
                  values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                  result="onlyB"
                />

                {/* Green / base channel: the "true" refraction, no fringe offset */}
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="map"
                  scale={baseScale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="dispG"
                />
                <feColorMatrix
                  in="dispG"
                  type="matrix"
                  values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                  result="onlyG"
                />

                <feBlend in="onlyR" in2="onlyB" mode="screen" result="rb" />
                <feBlend in="rb" in2="onlyG" mode="screen" result="fringed" />
                <feGaussianBlur in="fringed" stdDeviation={blurAmount} />
              </filter>
            </defs>
          </svg>
        )}

        {/* Refractive backdrop layer */}
        <span
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            borderRadius: "inherit",
            backdropFilter: map
              ? `url(#${filterId}) saturate(${saturation}%) brightness(${overLight ? 0.98 : 1.06})`
              : `blur(${blurAmount}px) saturate(${saturation}%) brightness(${overLight ? 0.98 : 1.06})`,
            WebkitBackdropFilter: `blur(${Math.max(blurAmount, 4)}px) saturate(${saturation}%)`,
            background: tint,
          }}
        />

        {/* Pointer-tracking specular glare */}
        <span
          aria-hidden="true"
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-200"
          style={{
            borderRadius: "inherit",
            opacity: hovered ? 1 : 0.5,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${
              overLight ? 0.35 : 0.55
            }) 0%, transparent 55%)`,
            mixBlendMode: "overlay",
          }}
        />

        {/* Bevel rim highlight */}
        <span
          aria-hidden="true"
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            borderRadius: "inherit",
            boxShadow: `
              inset 0 1px 1px rgba(255,255,255,${rimOpacity}),
              inset 0 -1px 1px rgba(0,0,0,0.12),
              0 8px 24px rgba(0,0,0,0.18)
            `,
          }}
        />

        <span className="relative z-20">{children}</span>
      </div>
    );
  }
);
LiquidGlassCursor.displayName = "LiquidGlassCursor";

/* ------------------------------------------------------------------ */
/* Drop-in adapters so nav pills/buttons can use the cursor-following   */
/* glass with the same call sites as the plain button/link primitives. */
/* ------------------------------------------------------------------ */

export interface LiquidGlassCursorButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  children?: React.ReactNode;
  labelClassName?: string;
  onClick?: () => void;
}

export const LiquidGlassCursorButton = React.forwardRef<HTMLButtonElement, LiquidGlassCursorButtonProps>(
  ({ children, className, labelClassName, onClick, "aria-label": ariaLabel, "aria-haspopup": ariaHaspopup, "aria-expanded": ariaExpanded, style }, ref) => {
    // LiquidGlassCursor already renders a div with role="button"/keyboard
    // handling when onClick is passed, so we skip wrapping it in a native
    // <button> to avoid nesting a div inside a button (invalid HTML).
    void ref; // native button ref not applicable — the div itself is focusable via role="button"
    return (
      <LiquidGlassCursor
        cornerRadius={9999}
        padding="0.625rem 1.25rem"
        className={cn("text-sm font-semibold", className)}
        onClick={onClick}
        style={style}
        aria-label={ariaLabel}
        aria-haspopup={ariaHaspopup}
        aria-expanded={ariaExpanded}
      >
        <span className={cn("flex items-center justify-center gap-2", labelClassName)}>{children}</span>
      </LiquidGlassCursor>
    );
  }
);
LiquidGlassCursorButton.displayName = "LiquidGlassCursorButton";

export interface LiquidGlassCursorLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
  labelClassName?: string;
}

export const LiquidGlassCursorLink = React.forwardRef<HTMLAnchorElement, LiquidGlassCursorLinkProps>(
  ({ children, className, labelClassName, href, ...rest }, ref) => {
    return (
      <Link ref={ref} href={href} className="contents" {...rest}>
        <LiquidGlassCursor
          cornerRadius={9999}
          padding="0.625rem 1.25rem"
          className={cn("text-sm font-semibold", className)}
        >
          <span className={cn("flex items-center justify-center gap-2", labelClassName)}>{children}</span>
        </LiquidGlassCursor>
      </Link>
    );
  }
);
LiquidGlassCursorLink.displayName = "LiquidGlassCursorLink";

export default LiquidGlassCursor;
