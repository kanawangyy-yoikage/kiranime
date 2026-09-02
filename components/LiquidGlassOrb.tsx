"use client";
/**
 * LiquidGlassOrb
 * ----------------
 * Draggable "liquid glass" panel modeled after childrentime/liquid-glass:
 * https://github.com/childrentime/liquid-glass
 * (which itself references shuding/liquid-glass.js)
 *
 * Unlike `LiquidGlassCursor` (a fixed panel whose glass bends toward the
 * pointer) or `LiquidGlassButton`/`LiquidGlassViewport` (static lens on nav
 * pills), this is a free-floating glass shape you can grab and drag around
 * the screen. Whatever is behind it — page content, images, text — visibly
 * refracts/magnifies through the glass as if it were a real lens, and the
 * distortion updates live as you drag it to a new spot.
 *
 * How it works (same core technique as the reference project):
 *  1. An SDF (signed distance field) defines the glass shape — here, a
 *     rounded rectangle / capsule / circle depending on `shape`.
 *  2. For every pixel we compute how far inside the shape it is, then turn
 *     that into a 2D displacement vector pointing away from the shape's
 *     spine (a convex-lens-like bulge), encoded into the R/G channels of an
 *     off-screen <canvas> as a displacement map.
 *  3. That canvas is re-drawn to a PNG data URL and fed into an SVG
 *     <feImage>/<feDisplacementMap> filter, which is applied via
 *     `backdrop-filter: url(#filter)` so the actual page content behind the
 *     glass gets pixel-shifted in the browser's compositor — no need to
 *     screenshot the page ourselves.
 *
 * Usage:
 *   <LiquidGlassOrb width={220} height={140} />
 *   <LiquidGlassOrb shape="circle" width={160} height={160} initialX={80} initialY={200} />
 *
 * Custom distortion profile (equivalent to the reference's `fragment` prop):
 *   <LiquidGlassOrb
 *     width={260}
 *     height={160}
 *     displace={(nx, ny, dist) => ({ x: -nx * dist, y: -ny * dist })}
 *   />
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export type LiquidGlassOrbShape = "rounded" | "circle" | "capsule";

export interface LiquidGlassOrbProps {
  /** Width of the glass shape in px. Default 220. */
  width?: number;
  /** Height of the glass shape in px. Default 140. */
  height?: number;
  /** rounded = rounded-rect, circle = perfect circle (width used as diameter), capsule = fully pill-shaped. */
  shape?: LiquidGlassOrbShape;
  /** Corner radius for the "rounded" shape, in px. Ignored for circle/capsule. Default 32. */
  cornerRadius?: number;
  /** How strongly the backdrop is pixel-displaced. Default 40. */
  displacementScale?: number;
  /** Extra backdrop blur, in px. Default 0.5. */
  blurAmount?: number;
  /** backdrop-filter saturate() percentage. Default 150. */
  saturation?: number;
  /** Starting position (px, relative to the nearest positioned ancestor). */
  initialX?: number;
  initialY?: number;
  /** Disable dragging — renders a fixed glass shape at (initialX, initialY). */
  draggable?: boolean;
  /** Keep the orb within its offset parent's bounds while dragging. Default true. */
  constrainToParent?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /**
   * Custom per-pixel displacement profile, mirroring the reference
   * project's `fragment` prop. Receives normalized coordinates
   * (nx, ny in -1..1 from the shape's center) and the SDF distance
   * (0 at the edge, 1 at the center); returns a displacement vector
   * in the same normalized space. Defaults to a convex-lens bulge.
   */
  displace?: (nx: number, ny: number, dist: number) => { x: number; y: number };
}

let uid = 0;

/** Signed-distance-field for a rounded rectangle, 0 at the edge growing to 1 at the center. */
function roundedRectSdf(nx: number, ny: number, cornerFrac: number): number {
  const ax = Math.abs(nx);
  const ay = Math.abs(ny);
  const cx = Math.max(0, ax - (1 - cornerFrac));
  const cy = Math.max(0, ay - (1 - cornerFrac));
  const cornerDist = Math.hypot(cx, cy) / Math.max(cornerFrac, 0.0001);
  const edgeDist = Math.max(ax, ay);
  const d = Math.max(edgeDist, cornerDist);
  return Math.max(0, 1 - d);
}

function circleSdf(nx: number, ny: number): number {
  return Math.max(0, 1 - Math.hypot(nx, ny));
}

function defaultDisplace(nx: number, ny: number, dist: number) {
  // Convex-lens bulge: pixels near the center are pulled inward more than
  // pixels near the rim, producing a magnifying, slightly refractive look.
  const curve = Math.sin(Math.pow(dist, 0.85) * Math.PI * 0.5);
  return { x: -nx * curve, y: -ny * curve };
}

/** Builds the displacement map canvas → PNG data URL for the current shape/size. */
function buildDisplacementMap(
  width: number,
  height: number,
  shape: LiquidGlassOrbShape,
  cornerRadius: number,
  displace: (nx: number, ny: number, dist: number) => { x: number; y: number }
): string | null {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const img = ctx.createImageData(w, h);
  const data = img.data;
  const cornerFrac =
    shape === "circle" ? 1 : shape === "capsule" ? 1 : clamp01(cornerRadius / (Math.min(w, h) / 2));

  for (let y = 0; y < h; y++) {
    const ny = (y / h) * 2 - 1;
    for (let x = 0; x < w; x++) {
      const nx = (x / w) * 2 - 1;

      const dist = shape === "circle" ? circleSdf(nx, ny) : roundedRectSdf(nx, ny, cornerFrac);

      let r = 128;
      let g = 128;
      let a = 0;

      if (dist > 0) {
        const { x: dx, y: dy } = displace(nx, ny, dist);
        r = Math.round(128 + clamp(dx, -1, 1) * 127);
        g = Math.round(128 + clamp(dy, -1, 1) * 127);
        a = 255;
      }

      const i = (y * w + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = 128;
      data[i + 3] = a;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
function clamp01(n: number) {
  return clamp(n, 0, 1);
}

export const LiquidGlassOrb = React.forwardRef<HTMLDivElement, LiquidGlassOrbProps>(
  (
    {
      width = 220,
      height = 140,
      shape = "rounded",
      cornerRadius = 32,
      displacementScale = 40,
      blurAmount = 0.5,
      saturation = 150,
      initialX = 24,
      initialY = 24,
      draggable = true,
      constrainToParent = true,
      className,
      style,
      children,
      displace = defaultDisplace,
    },
    forwardedRef
  ) => {
    const elRef = React.useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;
    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        elRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [forwardedRef]
    );

    const [filterId] = React.useState(() => `liquid-glass-orb-${++uid}`);
    const [mapUrl, setMapUrl] = React.useState<string | null>(null);
    const [pos, setPos] = React.useState({ x: initialX, y: initialY });
    const [dragging, setDragging] = React.useState(false);

    const dragState = React.useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });

    // (Re)build the displacement map whenever size/shape/params change.
    React.useEffect(() => {
      const url = buildDisplacementMap(width, height, shape, cornerRadius, displace);
      setMapUrl(url);
      // displace is typically an inline function; identity changes every
      // render, so we intentionally key off the primitive params only.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height, shape, cornerRadius]);

    const onPointerDown = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!draggable) return;
        const el = elRef.current;
        if (!el) return;
        el.setPointerCapture(e.pointerId);
        dragState.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
        setDragging(true);
      },
      [draggable, pos.x, pos.y]
    );

    const onPointerMove = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragging) return;
        const dx = e.clientX - dragState.current.startX;
        const dy = e.clientY - dragState.current.startY;
        let nextX = dragState.current.origX + dx;
        let nextY = dragState.current.origY + dy;

        if (constrainToParent && elRef.current?.offsetParent) {
          const parent = elRef.current.offsetParent as HTMLElement;
          const maxX = Math.max(0, parent.clientWidth - width);
          const maxY = Math.max(0, parent.clientHeight - height);
          nextX = clamp(nextX, 0, maxX);
          nextY = clamp(nextY, 0, maxY);
        }

        setPos({ x: nextX, y: nextY });
      },
      [dragging, constrainToParent, width, height]
    );

    const endDrag = React.useCallback(() => setDragging(false), []);

    const borderRadius =
      shape === "circle" ? "50%" : shape === "capsule" ? 9999 : cornerRadius;

    return (
      <div
        ref={setRefs}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          "absolute select-none isolate",
          draggable && (dragging ? "cursor-grabbing" : "cursor-grab"),
          className
        )}
        style={{
          left: pos.x,
          top: pos.y,
          width,
          height,
          borderRadius,
          touchAction: "none",
          transition: dragging ? "none" : "box-shadow 200ms ease-out",
          ...style,
        }}
      >
        {mapUrl && (
          <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <defs>
              <filter
                id={filterId}
                x="0"
                y="0"
                width={width}
                height={height}
                filterUnits="userSpaceOnUse"
                primitiveUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feImage href={mapUrl} width="100%" height="100%" preserveAspectRatio="none" result="map" />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="map"
                  scale={displacementScale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>
        )}

        {/* Refractive backdrop: distorts whatever is visually behind the orb */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: "inherit",
            backdropFilter: mapUrl
              ? `url(#${filterId}) blur(${blurAmount}px) saturate(${saturation}%)`
              : `blur(${blurAmount}px) saturate(${saturation}%)`,
            WebkitBackdropFilter: `blur(${Math.max(blurAmount, 6)}px) saturate(${saturation}%)`,
            background: "rgba(255,255,255,0.06)",
          }}
        />

        {/* Glass bevel: rim highlight + soft shadow, like a real lens edge */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: "inherit",
            boxShadow: `
              inset 0 0 0 1px rgba(255,255,255,0.35),
              inset 0 2px 1px rgba(255,255,255,0.5),
              inset 0 -6px 12px -6px rgba(0,0,0,0.25),
              0 12px 32px rgba(0,0,0,${dragging ? 0.35 : 0.22})
            `,
          }}
        />

        {/* Top-left specular highlight, fixed light source like the reference demo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: "inherit",
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.35) 0%, transparent 55%)",
            mixBlendMode: "overlay",
          }}
        />

        {children && <div className="relative z-10 w-full h-full flex items-center justify-center">{children}</div>}
      </div>
    );
  }
);
LiquidGlassOrb.displayName = "LiquidGlassOrb";

export default LiquidGlassOrb;
