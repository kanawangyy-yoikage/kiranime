"use client";
/**
 * LiquidGlassCursor
 * ------------------
 * Standalone "liquid glass" wrapper modeled after rdev/liquid-glass-react:
 * https://github.com/rdev/liquid-glass-react
 *
 * Wrap any content and it becomes a refractive glass surface that bends
 * and follows the cursor with a spring-like ("elastic") response, complete
 * with chromatic aberration at the edges and a specular highlight that
 * tracks the pointer. Unlike KiraStream's existing `LiquidGlassButton`
 * (a fixed lens for nav pills), this component is meant for arbitrary,
 * freely-placed content — cards, panels, floating pills, hero badges, etc.
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
  "aria-expanded"?: boolean;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

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
    const localRef = React.useRef<HTMLDivElement>(null);
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

    // Raw (unsprung) offset of pointer relative to element center, normalized -1..1
    const targetOffset = React.useRef({ x: 0, y: 0 });
    // Sprung ("elastic") offset actually applied to transforms
    const springOffset = React.useRef({ x: 0, y: 0 });
    const rafRef = React.useRef<number | null>(null);

    const [renderOffset, setRenderOffset] = React.useState({ x: 0, y: 0 });
    const [glarePos, setGlarePos] = React.useState({ x: 50, y: 50 });

    // Track element size for the SVG filter + displacement map viewport.
    React.useEffect(() => {
      const el = localRef.current;
      if (!el) return;
      const update = () => setSize({ width: el.offsetWidth, height: el.offsetHeight });
      update();
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
      }
      return undefined;
    }, []);

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
    const scale =
      mode === "prominent" ? displacementScale * 1.4 : mode === "polar" ? displacementScale * 0.85 : displacementScale;

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
          transform: `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${
            renderOffset.x * 0.35
          }px, ${renderOffset.y * 0.35}px, 0) scale(${pressScale})`,
          transition: "transform 120ms ease-out",
          willChange: "transform",
          ...style,
        }}
      >
        {/* SVG lens filter: edge-weighted displacement + chromatic aberration */}
        {w > 1 && h > 1 && (
          <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <defs>
              <filter
                id={filterId}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
                filterUnits="objectBoundingBox"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type={mode === "polar" ? "turbulence" : "fractalNoise"}
                  baseFrequency={mode === "polar" ? "0.008 0.012" : "0.012 0.018"}
                  numOctaves={2}
                  seed={7}
                  result="noise"
                />
                <feGaussianBlur in="noise" stdDeviation={mode === "prominent" ? 3 : 2} result="softNoise" />

                {/* Red channel: displaced further out for chromatic fringing */}
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="softNoise"
                  scale={scale + aberrationIntensity * 6}
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
                  in2="softNoise"
                  scale={-(scale + aberrationIntensity * 6)}
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
                  in2="softNoise"
                  scale={scale}
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
            backdropFilter: `url(#${filterId}) saturate(${saturation}%) brightness(${overLight ? 0.98 : 1.06})`,
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
/* Drop-in adapters so nav pills/buttons can switch to the cursor-     */
/* following variant with the same call sites as LiquidGlassViewport's */
/* LiquidGlassButton / LiquidGlassLink.                                 */
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
