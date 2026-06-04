import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getTierColor } from '../data/tierColors';
import { useLanguage } from '../contexts/LanguageContext';
import { interpolateTemplate } from '../hooks/useAppLocale';
import { usePriceFormat } from '../hooks/usePriceFormat';
import { useSeatPickerLayout } from '../hooks/useSeatPickerLayout';
import type { SeatMapPayload, SeatMapSeat } from '../api/seatMap';
import { displayTierName, sortTiersByPriceDesc } from '../utils/tierDisplay';

export interface SvgMapSeatSelection {
  id: string;
  tierId: string;
  tierName: string;
  price: number;
  label: string;
  row: string;
  number: number;
}

type ViewBox = [number, number, number, number];

const ZOOM_STEP_DESKTOP = 0.88;
const ZOOM_STEP_TOUCH = 0.84;
const TIER_BOUNDS_PADDING = 64;
const TIER_BOUNDS_PADDING_TOUCH = 48;
const VISUAL_SEAT_SCALE = 1.18;
const VIEW_ANIM_MS_DESKTOP = 480;
const VIEW_ANIM_MS_TOUCH = 560;
/** Desktop only — avoid cropping too tight when animating view. */
function minTierVisibleFracDesktop(): number {
  return 0.58;
}

function minViewFrac(coarsePointer: boolean): number {
  return coarsePointer ? 0.14 : 0.1;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function clampView(view: ViewBox, pageW: number, pageH: number, coarsePointer: boolean): ViewBox {
  const [vx, vy, vw, vh] = view;
  const minFrac = minViewFrac(coarsePointer);
  const minW = pageW * minFrac;
  const minH = pageH * minFrac;
  const w = Math.max(minW, Math.min(pageW, vw));
  const h = Math.max(minH, Math.min(pageH, vh));
  const x = Math.max(0, Math.min(pageW - w, vx));
  const y = Math.max(0, Math.min(pageH - h, vy));
  return [x, y, w, h];
}

/** Widen the viewport so desktop tier focus never crops too tight. */
function softenTierFocusView(
  view: ViewBox,
  pageW: number,
  pageH: number,
  coarsePointer: boolean,
): ViewBox {
  const [vx, vy, vw, vh] = view;
  const minW = pageW * minTierVisibleFracDesktop();
  const minH = pageH * minTierVisibleFracDesktop();
  if (vw >= minW && vh >= minH) return view;
  const nw = Math.max(vw, minW);
  const nh = Math.max(vh, minH);
  const cx = vx + vw / 2;
  const cy = vy + vh / 2;
  return clampView([cx - nw / 2, cy - nh / 2, nw, nh], pageW, pageH, coarsePointer);
}

export type TierBounds = {
  view: ViewBox;
  centerX: number;
  centerY: number;
};

/** scale < 1 zooms in (smaller viewport), scale > 1 zooms out */
function zoomView(
  view: ViewBox,
  scale: number,
  pageW: number,
  pageH: number,
  coarsePointer: boolean,
): ViewBox {
  const [vx, vy, vw, vh] = view;
  const cx = vx + vw / 2;
  const cy = vy + vh / 2;
  const nw = vw * scale;
  const nh = vh * scale;
  return clampView([cx - nw / 2, cy - nh / 2, nw, nh], pageW, pageH, coarsePointer);
}

/** Pinch / zoom around a fixed point in SVG coordinates. */
function zoomViewAtPoint(
  view: ViewBox,
  scale: number,
  px: number,
  py: number,
  pageW: number,
  pageH: number,
  coarsePointer: boolean,
): ViewBox {
  const [vx, vy, vw, vh] = view;
  const nw = vw * scale;
  const nh = vh * scale;
  const nx = px - ((px - vx) / vw) * nw;
  const ny = py - ((py - vy) / vh) * nh;
  return clampView([nx, ny, nw, nh], pageW, pageH, coarsePointer);
}

function panView(
  view: ViewBox,
  dx: number,
  dy: number,
  pageW: number,
  pageH: number,
  coarsePointer: boolean,
): ViewBox {
  const [vx, vy, vw, vh] = view;
  return clampView([vx + dx, vy + dy, vw, vh], pageW, pageH, coarsePointer);
}

function clientToSvgPoint(
  svg: SVGSVGElement,
  view: ViewBox,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = svg.getBoundingClientRect();
  const nx = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
  const ny = rect.height > 0 ? (clientY - rect.top) / rect.height : 0;
  return {
    x: view[0] + nx * view[2],
    y: view[1] + ny * view[3],
  };
}

function touchDistance(touches: TouchList): number {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function touchMidpoint(touches: TouchList): { x: number; y: number } {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
}

function isMapUiTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('[data-map-ui], button, a, [role="button"]'));
}

function boundsForMapSeats(
  subset: SeatMapSeat[],
  pageW: number,
  pageH: number,
  coarsePointer: boolean,
  options?: { padding?: number; tight?: boolean },
): TierBounds | null {
  if (subset.length === 0) return null;
  const padding = options?.padding ?? (coarsePointer ? 40 : TIER_BOUNDS_PADDING);
  const tight = options?.tight ?? coarsePointer;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const s of subset) {
    const w = (s.w ?? 10) * VISUAL_SEAT_SCALE;
    const h = (s.h ?? 10) * VISUAL_SEAT_SCALE;
    minX = Math.min(minX, s.map_x - w / 2);
    minY = Math.min(minY, s.map_y - h / 2);
    maxX = Math.max(maxX, s.map_x + w / 2);
    maxY = Math.max(maxY, s.map_y + h / 2);
  }

  const vx = Math.max(0, minX - padding);
  const vy = Math.max(0, minY - padding);
  const vw = Math.min(pageW - vx, maxX - minX + padding * 2);
  const vh = Math.min(pageH - vy, maxY - minY + padding * 2);
  const raw = clampView([vx, vy, vw, vh], pageW, pageH, coarsePointer);
  const view = tight ? raw : softenTierFocusView(raw, pageW, pageH, coarsePointer);
  return {
    view,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

function boundsForTierSeats(
  seats: SeatMapSeat[],
  tierId: string,
  pageW: number,
  pageH: number,
  coarsePointer: boolean,
  options?: { padding?: number; tight?: boolean },
): TierBounds | null {
  return boundsForMapSeats(
    seats.filter((s) => s.tier_id === tierId),
    pageW,
    pageH,
    coarsePointer,
    options,
  );
}

function boundsForSeat(
  seat: SeatMapSeat,
  pageW: number,
  pageH: number,
  coarsePointer: boolean,
): ViewBox | null {
  const b = boundsForMapSeats([seat], pageW, pageH, coarsePointer, {
    padding: coarsePointer ? 88 : 64,
    tight: true,
  });
  return b?.view ?? null;
}

function fullView(pageW: number, pageH: number): ViewBox {
  return [0, 0, pageW, pageH];
}

function seatDisplayLabel(seat: SeatMapSeat): string {
  if (seat.seat_number) return seat.seat_number;
  if (seat.row) return `${seat.row}-${seat.number}`;
  return String(seat.number);
}

type HoveredSeatTip = {
  label: string;
  sublabel: string;
  x: number;
  y: number;
  reserved?: boolean;
};

const TOOLTIP_OFFSET_X = 18;
const TOOLTIP_OFFSET_Y = -40;
const MIN_HIT_SIZE = 18;
const MIN_HIT_SIZE_COARSE = 28;
const WHEEL_ZOOM_SENSITIVITY = 0.0012;
const TOOLTIP_HIDE_MS = 30;
const MOBILE_TOOLTIP_HIDE_MS = 2000;
const MOBILE_RESERVED_TOOLTIP_HIDE_MS = 2800;
const TAP_MOVE_THRESHOLD_PX = 12;
const TAP_MAX_DURATION_MS = 350;

function getSeatIdFromTarget(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest('[data-seat-id]');
  return el?.getAttribute('data-seat-id');
}

function tooltipTransform(clientX: number, clientY: number) {
  return `translate(${clientX + TOOLTIP_OFFSET_X}px, ${clientY + TOOLTIP_OFFSET_Y}px)`;
}

function moveTooltipEl(el: HTMLDivElement | null, clientX: number, clientY: number) {
  if (!el) return;
  el.style.transform = tooltipTransform(clientX, clientY);
}

function MapSeatTooltipPortal({
  tip,
  tooltipRef,
}: {
  tip: HoveredSeatTip;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
}) {
  const reserved = tip.reserved === true;
  return createPortal(
    <div
      ref={tooltipRef}
      className={`pointer-events-none fixed top-0 left-0 px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-lg border will-change-transform ${
        reserved
          ? 'z-[100001] bg-[#7f1d1d] text-white border-[#991b1b]'
          : 'z-[9999] bg-[#111] text-white border-[#333]'
      }`}
      style={{ transform: tooltipTransform(tip.x, tip.y) }}
      role="tooltip"
    >
      <span className="block whitespace-nowrap font-semibold">{tip.label}</span>
      {tip.sublabel ? (
        <span
          className={`block text-[10px] font-normal mt-0.5 whitespace-nowrap ${
            reserved ? 'text-red-100' : 'text-[#a3a3a3]'
          }`}
        >
          {tip.sublabel}
        </span>
      ) : null}
    </div>,
    document.body,
  );
}

interface SvgVenueMapPickerProps {
  seatMap: SeatMapPayload;
  tierIndexById: Map<string, number>;
  selectedIds: Set<string>;
  onToggle: (seat: SeatMapSeat, tierName: string, price: number) => void;
  /** When true, map grows to fill the parent flex area (booking dialog). */
  fillContainer?: boolean;
  /** Observed for compact layout when vertical space in the dialog is tight. */
  containerRef?: React.RefObject<HTMLElement | null>;
}

function SeatMarker({
  seat,
  tierIndex,
  minHitSize,
  selected,
  seatFill,
  label,
  touchSelectOnMap,
  onMouseEnter,
  onMouseLeave,
  onActivate,
  skipClickAfterTouchRef,
  elevated = false,
}: {
  seat: SeatMapSeat;
  tierIndex: number;
  minHitSize: number;
  selected: boolean;
  seatFill: string;
  label: string;
  touchSelectOnMap: boolean;
  onMouseEnter: (seat: SeatMapSeat, e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onActivate: () => void;
  skipClickAfterTouchRef: React.MutableRefObject<boolean>;
  elevated?: boolean;
}) {
  const w = seat.w ?? 10;
  const h = seat.h ?? 10;
  const visW = w * VISUAL_SEAT_SCALE;
  const visH = h * VISUAL_SEAT_SCALE;
  const hit = Math.max(minHitSize, w + 4, h + 4);
  const disabled = seat.status !== 'available';
  const stroke = selected ? '#1d4ed8' : disabled ? '#dc2626' : 'transparent';
  const strokeW = selected ? 2.5 : disabled ? 1.25 : 0;

  const hitHandlers = {
    onMouseEnter: (e: React.MouseEvent) => onMouseEnter(seat, e),
    onMouseLeave,
    onClick: (e: React.MouseEvent) => {
      if (touchSelectOnMap) return;
      if (skipClickAfterTouchRef.current) return;
      if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType === 'touch') return;
      onActivate();
    },
    style: {
      cursor: disabled ? 'not-allowed' : 'pointer',
      touchAction: 'none',
    } as React.CSSProperties,
  };

  const elevatedStyle: React.CSSProperties | undefined = elevated
    ? { filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }
    : undefined;
  const selectedStyle: React.CSSProperties | undefined = selected
    ? { transform: 'scale(1.08)', transformOrigin: `${seat.map_x}px ${seat.map_y}px` }
    : undefined;

  if (seat.shape === 'circle') {
    const r = Math.max(visW, visH) / 2;
    const hitR = Math.max(hit / 2, r + 2);
    return (
      <g key={seat.id} aria-label={label} style={{ ...elevatedStyle, ...selectedStyle }}>
        <circle
          data-seat-hit=""
          data-seat-id={seat.id}
          cx={seat.map_x}
          cy={seat.map_y}
          r={hitR}
          fill="transparent"
          {...hitHandlers}
        />
        <circle
          cx={seat.map_x}
          cy={seat.map_y}
          r={r}
          fill={seatFill}
          stroke={stroke}
          strokeWidth={strokeW}
          pointerEvents="none"
        />
      </g>
    );
  }

  return (
    <g key={seat.id} aria-label={label} style={{ ...elevatedStyle, ...selectedStyle }}>
      <rect
        data-seat-hit=""
        data-seat-id={seat.id}
        x={seat.map_x - hit / 2}
        y={seat.map_y - hit / 2}
        width={hit}
        height={hit}
        fill="transparent"
        {...hitHandlers}
      />
      <rect
        x={seat.map_x - visW / 2}
        y={seat.map_y - visH / 2}
        width={visW}
        height={visH}
        fill={seatFill}
        stroke={stroke}
        strokeWidth={strokeW}
        rx={1}
        pointerEvents="none"
      />
    </g>
  );
}

export function SvgVenueMapPicker({
  seatMap,
  tierIndexById,
  selectedIds,
  onToggle,
  fillContainer = false,
  containerRef,
}: SvgVenueMapPickerProps) {
  const { t } = useLanguage();
  const { formatPrice, formatDecimal } = usePriceFormat();
  const { layout, seats, tiers } = seatMap;
  const { page_w: pageW, page_h: pageH, floor_plan_url: floorPlanUrl } = layout;
  const [view, setView] = useState<ViewBox>(() => fullView(pageW, pageH));
  const [displayView, setDisplayView] = useState<ViewBox>(() => fullView(pageW, pageH));
  const [activeTierId, setActiveTierId] = useState<string | null>(null);
  const [hoveredTip, setHoveredTip] = useState<HoveredSeatTip | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const mapWrapRef = useRef<HTMLDivElement | null>(null);
  const mapGestureRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const hideTipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipClickAfterTouchRef = useRef(false);
  const viewAnimRef = useRef<number | null>(null);
  const displayViewRef = useRef<ViewBox>(fullView(pageW, pageH));
  const prevSelectedIdsRef = useRef<Set<string>>(new Set());
  const maskId = React.useId().replace(/:/g, '');
  const { coarsePointer, narrowViewport, preferCompactSeatUx } =
    useSeatPickerLayout(containerRef);
  const useCompactChrome = preferCompactSeatUx || fillContainer;
  const fillMapArea = useCompactChrome;
  const touchLikeInteraction = coarsePointer || narrowViewport;
  const preferTouchUx = touchLikeInteraction || useCompactChrome;
  const activeTierIdRef = useRef<string | null>(null);
  const preferTouchUxRef = useRef(false);
  const seatsRef = useRef(seats);
  const tierByIdRef = useRef(new Map<string, (typeof tiers)[0]>());
  const handleSeatInteractionRef = useRef<
    (seatId: string, clientX: number, clientY: number) => void
  >(() => {});

  const viewAnimMs = touchLikeInteraction ? VIEW_ANIM_MS_TOUCH : VIEW_ANIM_MS_DESKTOP;
  const zoomStep = touchLikeInteraction ? ZOOM_STEP_TOUCH : ZOOM_STEP_DESKTOP;
  const minHitSize = coarsePointer ? MIN_HIT_SIZE_COARSE : MIN_HIT_SIZE;

  const tierById = useMemo(() => new Map(tiers.map((ti) => [ti.id, ti])), [tiers]);

  const regularLabel = t('tier.regular');
  const tierLabel = (tier: (typeof tiers)[0]) => displayTierName(tier, regularLabel);

  const mapTiers = useMemo(
    () =>
      sortTiersByPriceDesc(
        tiers.filter(
          (ti) =>
            ti.selection_mode !== 'general_admission' && seats.some((s) => s.tier_id === ti.id),
        ),
      ),
    [tiers, seats],
  );

  /** When a section is selected, only its seats are interactive (others hidden). */
  const visibleSeats = useMemo(() => {
    if (!activeTierId) return seats;
    return seats.filter((s) => s.tier_id === activeTierId);
  }, [seats, activeTierId]);

  const activeTier = activeTierId ? tierById.get(activeTierId) : null;

  activeTierIdRef.current = activeTierId;
  preferTouchUxRef.current = preferTouchUx;
  seatsRef.current = seats;
  tierByIdRef.current = tierById;

  displayViewRef.current = displayView;

  const animateViewTo = useCallback((target: ViewBox) => {
    if (viewAnimRef.current != null) {
      cancelAnimationFrame(viewAnimRef.current);
    }
    const start = displayViewRef.current;
    const startTime = performance.now();

    const tick = (now: number) => {
      const raw = Math.min(1, (now - startTime) / viewAnimMs);
      const eased = easeInOutCubic(raw);
      const next: ViewBox = [
        start[0] + (target[0] - start[0]) * eased,
        start[1] + (target[1] - start[1]) * eased,
        start[2] + (target[2] - start[2]) * eased,
        start[3] + (target[3] - start[3]) * eased,
      ];
      displayViewRef.current = next;
      setDisplayView(next);
      if (raw < 1) {
        viewAnimRef.current = requestAnimationFrame(tick);
      } else {
        viewAnimRef.current = null;
        displayViewRef.current = target;
        setDisplayView(target);
      }
    };
    viewAnimRef.current = requestAnimationFrame(tick);
  }, [viewAnimMs]);

  const applyView = useCallback(
    (next: ViewBox, animate = true) => {
      setView(next);
      if (animate) animateViewTo(next);
      else {
        displayViewRef.current = next;
        setDisplayView(next);
      }
    },
    [animateViewTo],
  );

  useEffect(() => {
    const full = fullView(pageW, pageH);
    setView(full);
    setDisplayView(full);
    displayViewRef.current = full;
    setActiveTierId(null);
  }, [pageW, pageH]);

  const tierSpotlightBounds = useMemo((): ViewBox | null => {
    if (!activeTierId) return null;
    const padding = useCompactChrome ? TIER_BOUNDS_PADDING_TOUCH : TIER_BOUNDS_PADDING + 20;
    const b = boundsForTierSeats(seats, activeTierId, pageW, pageH, coarsePointer, {
      padding,
      tight: useCompactChrome,
    });
    return b?.view ?? null;
  }, [activeTierId, seats, pageW, pageH, coarsePointer, useCompactChrome]);

  useEffect(
    () => () => {
      if (viewAnimRef.current != null) cancelAnimationFrame(viewAnimRef.current);
    },
    [],
  );

  const commitView = useCallback((next: ViewBox) => {
    displayViewRef.current = next;
    setDisplayView(next);
    setView(next);
  }, []);

  const scrollMapIntoView = useCallback(() => {
    const wrap = mapWrapRef.current;
    if (!wrap) return;
    requestAnimationFrame(() => {
      wrap.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    });
  }, []);

  const frameView = useCallback(
    (target: ViewBox, animate = true) => {
      applyView(target, animate);
      scrollMapIntoView();
    },
    [applyView, scrollMapIntoView],
  );

  const focusSeatsInView = useCallback(
    (seatIds: string[]) => {
      if (seatIds.length === 0) return;
      let target: ViewBox | null = null;
      if (seatIds.length === 1) {
        const seat = seats.find((s) => s.id === seatIds[0]);
        if (seat) target = boundsForSeat(seat, pageW, pageH, coarsePointer);
      } else {
        const subset = seats.filter((s) => seatIds.includes(s.id));
        target =
          boundsForMapSeats(subset, pageW, pageH, coarsePointer, {
            padding: useCompactChrome ? 72 : TIER_BOUNDS_PADDING,
            tight: useCompactChrome,
          })?.view ?? null;
      }
      if (target) frameView(target, true);
    },
    [seats, pageW, pageH, coarsePointer, useCompactChrome, frameView],
  );

  useEffect(() => {
    const wrap = mapGestureRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg) return;

    const pointers = new Map<number, { x: number; y: number }>();
    let pinchAnchor: {
      startDist: number;
      startView: ViewBox;
      midSvg: { x: number; y: number };
    } | null = null;
    let panAnchor: { startView: ViewBox; x: number; y: number } | null = null;
    let touchTap: {
      pointerId: number;
      startX: number;
      startY: number;
      startTime: number;
      seatId: string | null;
      didPan: boolean;
    } | null = null;
    const canPan = () => {
      if (preferTouchUxRef.current) return true;
      const v = displayViewRef.current;
      return v[2] < pageW * 0.985 || Boolean(activeTierIdRef.current);
    };

    const clearGesture = () => {
      pointers.clear();
      pinchAnchor = null;
      panAnchor = null;
      touchTap = null;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (isMapUiTarget(e.target)) return;

      const seatIdOnDown = getSeatIdFromTarget(e.target);
      const skipCaptureForMouseSeat =
        e.pointerType === 'mouse' && seatIdOnDown != null;

      if (!skipCaptureForMouseSeat) {
        try {
          wrap.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 2) {
        const pts = [...pointers.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        pinchAnchor = {
          startDist: dist,
          startView: displayViewRef.current,
          midSvg: clientToSvgPoint(svg, displayViewRef.current, mid.x, mid.y),
        };
        panAnchor = null;
        touchTap = null;
        skipClickAfterTouchRef.current = true;
        return;
      }

      if (pointers.size === 1) {
        const seatId = seatIdOnDown;
        if (e.pointerType === 'touch' || preferTouchUxRef.current) {
          touchTap = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            startTime: performance.now(),
            seatId,
            didPan: false,
          };
        }
        if (canPan() && !(skipCaptureForMouseSeat && seatId)) {
          panAnchor = { startView: displayViewRef.current, x: e.clientX, y: e.clientY };
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 2 && pinchAnchor) {
        e.preventDefault();
        const pts = [...pointers.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const ratio = pinchAnchor.startDist > 0 ? dist / pinchAnchor.startDist : 1;
        const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        const midSvg = clientToSvgPoint(svg, pinchAnchor.startView, mid.x, mid.y);
        const blendX = pinchAnchor.midSvg.x * 0.6 + midSvg.x * 0.4;
        const blendY = pinchAnchor.midSvg.y * 0.6 + midSvg.y * 0.4;
        const scale = ratio > 0 ? 1 / ratio : 1;
        commitView(
          zoomViewAtPoint(
            pinchAnchor.startView,
            scale,
            blendX,
            blendY,
            pageW,
            pageH,
            coarsePointer,
          ),
        );
        skipClickAfterTouchRef.current = true;
        if (touchTap) touchTap.didPan = true;
        return;
      }

      if (pointers.size === 1 && panAnchor) {
        const dx = e.clientX - panAnchor.x;
        const dy = e.clientY - panAnchor.y;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

        if (touchTap && touchTap.pointerId === e.pointerId) {
          const moveDist = Math.hypot(e.clientX - touchTap.startX, e.clientY - touchTap.startY);
          if (moveDist > TAP_MOVE_THRESHOLD_PX) {
            touchTap.didPan = true;
          }
        }
        const rect = svg.getBoundingClientRect();
        const scaleX = rect.width > 0 ? displayViewRef.current[2] / rect.width : 1;
        const scaleY = rect.height > 0 ? displayViewRef.current[3] / rect.height : 1;

        e.preventDefault();
        skipClickAfterTouchRef.current = true;
        commitView(
          panView(panAnchor.startView, -dx * scaleX, -dy * scaleY, pageW, pageH, coarsePointer),
        );
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const tap = touchTap && touchTap.pointerId === e.pointerId ? { ...touchTap } : null;

      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchAnchor = null;
      if (pointers.size === 0) {
        panAnchor = null;
        touchTap = null;
        window.setTimeout(() => {
          skipClickAfterTouchRef.current = false;
        }, 280);
      }

      if (tap && !tap.didPan && (e.pointerType === 'touch' || preferTouchUxRef.current)) {
        const duration = performance.now() - tap.startTime;
        const moveDist = Math.hypot(e.clientX - tap.startX, e.clientY - tap.startY);
        if (duration <= TAP_MAX_DURATION_MS && moveDist <= TAP_MOVE_THRESHOLD_PX) {
          let seatId = tap.seatId;
          if (!seatId) {
            const hit = document.elementFromPoint(e.clientX, e.clientY);
            seatId = getSeatIdFromTarget(hit);
          }
          if (seatId) {
            handleSeatInteractionRef.current(seatId, e.clientX, e.clientY);
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (touchLikeInteraction) return;
      e.preventDefault();
      const pt = clientToSvgPoint(svg, displayViewRef.current, e.clientX, e.clientY);
      const scale = Math.exp(e.deltaY * WHEEL_ZOOM_SENSITIVITY);
      commitView(
        zoomViewAtPoint(displayViewRef.current, scale, pt.x, pt.y, pageW, pageH, coarsePointer),
      );
    };

    wrap.addEventListener('pointerdown', onPointerDown);
    wrap.addEventListener('pointermove', onPointerMove);
    wrap.addEventListener('pointerup', onPointerUp);
    wrap.addEventListener('pointercancel', onPointerUp);
    wrap.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      wrap.removeEventListener('pointerdown', onPointerDown);
      wrap.removeEventListener('pointermove', onPointerMove);
      wrap.removeEventListener('pointerup', onPointerUp);
      wrap.removeEventListener('pointercancel', onPointerUp);
      wrap.removeEventListener('wheel', onWheel);
      clearGesture();
    };
  }, [coarsePointer, touchLikeInteraction, pageW, pageH, commitView]);

  const resetView = useCallback(() => {
    setActiveTierId(null);
    frameView(fullView(pageW, pageH), true);
  }, [pageW, pageH, frameView]);

  const zoomIn = useCallback(() => {
    setView((v) => {
      const next = zoomView(v, zoomStep, pageW, pageH, coarsePointer);
      applyView(next, true);
      return next;
    });
  }, [pageW, pageH, coarsePointer, applyView, zoomStep]);

  const zoomOut = useCallback(() => {
    setView((v) => {
      const next = zoomView(v, 1 / zoomStep, pageW, pageH, coarsePointer);
      applyView(next, true);
      return next;
    });
  }, [pageW, pageH, coarsePointer, applyView, zoomStep]);

  const focusTier = useCallback(
    (tierId: string | null) => {
      if (tierId == null) {
        resetView();
        return;
      }
      if (activeTierId === tierId) {
        resetView();
        return;
      }
      setActiveTierId(tierId);
      const bounds = boundsForTierSeats(seats, tierId, pageW, pageH, coarsePointer, {
        tight: useCompactChrome,
        padding: useCompactChrome ? TIER_BOUNDS_PADDING_TOUCH : TIER_BOUNDS_PADDING,
      });
      if (!bounds) return;
      frameView(bounds.view, true);
    },
    [activeTierId, seats, pageW, pageH, coarsePointer, useCompactChrome, resetView, frameView],
  );

  useEffect(() => {
    const prev = prevSelectedIdsRef.current;
    const added = [...selectedIds].filter((id) => !prev.has(id));
    prevSelectedIdsRef.current = new Set(selectedIds);
    if (added.length === 0) return;
    const idsToFrame =
      selectedIds.size > 1 ? [...selectedIds] : [added[added.length - 1]!];
    focusSeatsInView(idsToFrame);
  }, [selectedIds, focusSeatsInView]);

  const seatFill = (seat: SeatMapSeat) => {
    if (seat.status !== 'available') return '#ef4444';
    if (selectedIds.has(seat.id)) return '#2563eb';
    return 'transparent';
  };

  const isSeatReserved = useCallback((seat: SeatMapSeat) => seat.status !== 'available', []);

  const buildTip = useCallback(
    (seat: SeatMapSeat, clientX: number, clientY: number): HoveredSeatTip => {
      const tier = tierById.get(seat.tier_id);
      const reserved = isSeatReserved(seat);
      if (reserved) {
        return {
          label: seatDisplayLabel(seat),
          sublabel: t('seats.reservedTap'),
          x: clientX,
          y: clientY,
          reserved: true,
        };
      }
      const isSelected = selectedIds.has(seat.id);
      const statusKey = isSelected ? 'seats.status.selected' : 'seats.available';
      const status = t(statusKey);
      return {
        label: seatDisplayLabel(seat),
        sublabel: tier
          ? `${tierLabel(tier)} · ${formatPrice(tier.price)} · ${status}`
          : status,
        x: clientX,
        y: clientY,
      };
    },
    [tierById, selectedIds, t, isSeatReserved],
  );

  const cancelHideTooltip = useCallback(() => {
    if (hideTipTimerRef.current) {
      clearTimeout(hideTipTimerRef.current);
      hideTipTimerRef.current = null;
    }
  }, []);

  const hideSeatTooltipNow = useCallback(() => {
    cancelHideTooltip();
    setHoveredTip(null);
  }, [cancelHideTooltip]);

  const scheduleHideTooltip = useCallback(() => {
    cancelHideTooltip();
    hideTipTimerRef.current = setTimeout(() => {
      setHoveredTip(null);
      hideTipTimerRef.current = null;
    }, TOOLTIP_HIDE_MS);
  }, [cancelHideTooltip]);

  const showMobileSeatTip = useCallback(
    (seat: SeatMapSeat, clientX: number, clientY: number) => {
      cancelHideTooltip();
      const tip = buildTip(seat, clientX, clientY);
      setHoveredTip(tip);
      hideTipTimerRef.current = setTimeout(() => {
        setHoveredTip(null);
        hideTipTimerRef.current = null;
      }, tip.reserved ? MOBILE_RESERVED_TOOLTIP_HIDE_MS : MOBILE_TOOLTIP_HIDE_MS);
    },
    [buildTip, cancelHideTooltip],
  );

  const notifyReservedSeatTap = useCallback(
    (seat: SeatMapSeat, clientX: number, clientY: number) => {
      const tier = tierById.get(seat.tier_id);
      const label = seatDisplayLabel(seat);
      showMobileSeatTip(seat, clientX, clientY);
      toast.info(t('seats.reservedTap'), {
        description: tier ? `${label} · ${tierLabel(tier)}` : label,
      });
    },
    [tierById, showMobileSeatTip, t],
  );

  const handleSeatActivate = useCallback(
    (seat: SeatMapSeat) => {
      const tier = tierById.get(seat.tier_id);
      if (seat.status !== 'available' || !tier) return;
      hideSeatTooltipNow();
      if (activeTierId == null) {
        setActiveTierId(seat.tier_id);
      }
      onToggle(seat, tierLabel(tier), tier.price);
    },
    [tierById, activeTierId, onToggle, hideSeatTooltipNow],
  );

  useEffect(() => {
    handleSeatInteractionRef.current = (seatId, clientX, clientY) => {
      const seat = seatsRef.current.find((s) => s.id === seatId);
      if (!seat) return;
      if (activeTierIdRef.current && seat.tier_id !== activeTierIdRef.current) return;

      if (isSeatReserved(seat)) {
        if (preferTouchUxRef.current) {
          notifyReservedSeatTap(seat, clientX, clientY);
        }
        return;
      }

      if (preferTouchUxRef.current) {
        showMobileSeatTip(seat, clientX, clientY);
      }
      handleSeatActivate(seat);
    };
  }, [showMobileSeatTip, handleSeatActivate, notifyReservedSeatTap, isSeatReserved]);

  const showSeatTooltip = useCallback(
    (seat: SeatMapSeat, e: React.MouseEvent) => {
      if (useCompactChrome) return;
      if (activeTierId && seat.tier_id !== activeTierId) return;
      cancelHideTooltip();
      setHoveredTip(buildTip(seat, e.clientX, e.clientY));
    },
    [buildTip, cancelHideTooltip, activeTierId, useCompactChrome],
  );

  useEffect(() => () => cancelHideTooltip(), [cancelHideTooltip]);

  useEffect(() => {
    const wrap = mapWrapRef.current;
    if (!wrap || !hoveredTip) return;
    const onMove = (e: MouseEvent) => {
      moveTooltipEl(tooltipRef.current, e.clientX, e.clientY);
    };
    wrap.addEventListener('mousemove', onMove, { passive: true });
    return () => wrap.removeEventListener('mousemove', onMove);
  }, [hoveredTip]);

  const svgLayoutStyle: React.CSSProperties = fillMapArea
    ? {
        width: '100%',
        maxWidth: '100%',
        display: 'block',
        height: '100%',
        minHeight: useCompactChrome ? 'min(36dvh, 340px)' : 'min(280px, 40dvh)',
      }
    : {
        width: '100%',
        minWidth: activeTierId ? 'min(100%, 480px)' : '720px',
        height: 'auto',
      };

  const tierFilterRow = (compact: boolean) => (
    <>
      <TierFilterChip
        compact={compact}
        label={t('seats.allSections')}
        active={activeTierId == null}
        onClick={() => focusTier(null)}
      />
      {mapTiers.map((tier) => (
        <TierFilterChip
          key={tier.id}
          compact={compact}
          label={
            compact
              ? `${tierLabel(tier)} · ${formatDecimal(tier.price)}`
              : `${tierLabel(tier)} — ${formatPrice(tier.price)}`
          }
          active={activeTierId === tier.id}
          color={getTierColor(tier.id, tierIndexById.get(tier.id)).fill}
          onClick={() => focusTier(tier.id)}
        />
      ))}
    </>
  );

  return (
    <div className={`flex flex-col ${fillMapArea ? 'flex-1 min-h-0 gap-0' : 'gap-3'}`}>
      <div className={`${useCompactChrome ? 'hidden' : ''} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2`}>
        <div
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-none"
          role="group"
          aria-label={t('seats.filterByTier')}
        >
          <TierFilterChip
            label={t('seats.allSections')}
            active={activeTierId == null}
            onClick={() => focusTier(null)}
          />
          {mapTiers.map((tier) => (
            <TierFilterChip
              key={tier.id}
              label={`${tierLabel(tier)} — ${formatPrice(tier.price)}`}
              active={activeTierId === tier.id}
              color={getTierColor(tier.id, tierIndexById.get(tier.id)).fill}
              onClick={() => focusTier(tier.id)}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <ZoomButton label={t('seats.zoomOut')} onClick={zoomOut}>
            <Minus size={18} />
          </ZoomButton>
          <ZoomButton label={t('seats.zoomIn')} onClick={zoomIn}>
            <Plus size={18} />
          </ZoomButton>
          <button
            type="button"
            onClick={resetView}
            className="px-3 py-2 text-xs font-medium text-[#525252] border border-[#e8e8e8] rounded-lg hover:bg-muted touch-manipulation min-h-11 sm:min-h-0"
          >
            {t('seats.resetView')}
          </button>
        </div>
      </div>

      {activeTier && !useCompactChrome && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-[#000000]/15 bg-[#f5f5f5] px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {interpolateTemplate(t('seats.viewingSection'), { name: tierLabel(activeTier) })}
            </p>
            <p className="text-[11px] text-[#525252] mt-0.5">{t('seats.sectionFocusHint')}</p>
          </div>
          <button
            type="button"
            onClick={resetView}
            className="shrink-0 px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground touch-manipulation min-h-10"
          >
            {t('seats.showAllSections')}
          </button>
        </div>
      )}

      <div
        ref={mapWrapRef}
        className={`relative w-full rounded-xl border border-[#e8e8e8] bg-[#fafafa] select-none ${
          fillMapArea
            ? 'flex-1 min-h-0 overflow-hidden flex flex-col'
            : 'overflow-auto max-h-[min(52dvh,640px)] sm:max-h-[min(70vh,640px)] p-2'
        } ${activeTierId ? 'ring-2 ring-black/10' : ''}`}
        onMouseLeave={hideSeatTooltipNow}
      >
        {hoveredTip && !useCompactChrome && (
          <MapSeatTooltipPortal tip={hoveredTip} tooltipRef={tooltipRef} />
        )}
        {useCompactChrome && (
          <>
            <div className="absolute top-2 left-2 right-14 z-20 pointer-events-none scaled-laptop:hidden cramped:hidden">
              <p className="text-[10px] text-white/90 bg-black/55 backdrop-blur-sm rounded-md px-2 py-1 leading-snug max-w-[72%]">
                {t('seats.touchHint')}
              </p>
            </div>
            <div data-map-ui className="absolute top-2 right-2 z-30 flex flex-col gap-1 touch-auto">
              <ZoomButton label={t('seats.zoomIn')} onClick={zoomIn} floating>
                <Plus size={18} />
              </ZoomButton>
              <ZoomButton label={t('seats.zoomOut')} onClick={zoomOut} floating>
                <Minus size={18} />
              </ZoomButton>
              <button
                type="button"
                onClick={resetView}
                aria-label={t('seats.resetView')}
                className="h-9 px-2 text-[10px] font-semibold rounded-lg border border-[#e8e8e8] bg-white/95 text-[#525252] touch-manipulation shadow-sm"
              >
                {t('seats.resetView')}
              </button>
            </div>
          </>
        )}
        <div
          ref={mapGestureRef}
          className={
            useCompactChrome
              ? 'flex-1 min-h-0 p-1 pb-[4.5rem] scaled-laptop:pb-[3.5rem] cramped:pb-[3.25rem] touch-none'
              : undefined
          }
        >
        <svg
          ref={svgRef}
          viewBox={displayView.join(' ')}
          style={svgLayoutStyle}
          role="img"
          aria-label="Venue seat map"
        >
          <defs>
            {tierSpotlightBounds && (
              <mask id={`tier-dim-${maskId}`}>
                <rect x={0} y={0} width={pageW} height={pageH} fill="white" />
                <rect
                  x={tierSpotlightBounds[0]}
                  y={tierSpotlightBounds[1]}
                  width={tierSpotlightBounds[2]}
                  height={tierSpotlightBounds[3]}
                  rx={28}
                  ry={28}
                  fill="black"
                />
              </mask>
            )}
          </defs>
          {floorPlanUrl && (
            <image
              href={floorPlanUrl}
              x={0}
              y={0}
              width={pageW}
              height={pageH}
              preserveAspectRatio="none"
              pointerEvents="none"
              opacity={activeTierId ? 0.35 : 1}
              className="transition-opacity duration-500"
            />
          )}
          {floorPlanUrl && tierSpotlightBounds && (
            <image
              href={floorPlanUrl}
              x={0}
              y={0}
              width={pageW}
              height={pageH}
              preserveAspectRatio="none"
              pointerEvents="none"
              mask={`url(#tier-dim-${maskId})`}
              className="transition-opacity duration-500"
            />
          )}
          {layout.ga_zone?.type === 'rect' && (
            <rect
              x={layout.ga_zone.x}
              y={layout.ga_zone.y}
              width={layout.ga_zone.w}
              height={layout.ga_zone.h}
              fill="rgba(120,120,120,0.12)"
              stroke="#999"
              strokeDasharray="8 4"
              pointerEvents="none"
            />
          )}
          {tierSpotlightBounds && (
            <rect
              x={0}
              y={0}
              width={pageW}
              height={pageH}
              fill={useCompactChrome ? 'rgba(12, 12, 14, 0.72)' : 'rgba(12, 12, 14, 0.58)'}
              mask={`url(#tier-dim-${maskId})`}
              pointerEvents="none"
              className="transition-opacity duration-500 ease-in-out"
            />
          )}

          {visibleSeats.map((seat) => (
              <SeatMarker
                key={seat.id}
                seat={seat}
                tierIndex={tierIndexById.get(seat.tier_id) ?? 0}
                minHitSize={minHitSize}
                selected={selectedIds.has(seat.id)}
                seatFill={seatFill(seat)}
                label={seatDisplayLabel(seat)}
                touchSelectOnMap={preferTouchUx}
                onMouseEnter={showSeatTooltip}
                onMouseLeave={scheduleHideTooltip}
                onActivate={() => handleSeatActivate(seat)}
                skipClickAfterTouchRef={skipClickAfterTouchRef}
                elevated={activeTierId != null}
              />
          ))}
        </svg>
        </div>

        {useCompactChrome && (
          <div
            className="absolute bottom-0 inset-x-0 z-30 border-t border-[#e8e8e8] bg-white/95 backdrop-blur-md rounded-b-xl shadow-[0_-6px_24px_rgba(0,0,0,0.08)] touch-auto"
            data-map-ui
            role="group"
            aria-label={t('seats.filterByTier')}
          >
            {activeTier && (
              <div className="flex items-center justify-between gap-2 px-2.5 pt-1.5 pb-0.5 scaled-laptop:pt-1 scaled-laptop:pb-0 cramped:pt-1 cramped:pb-0">
                <p className="text-[11px] font-semibold text-foreground truncate min-w-0">
                  {interpolateTemplate(t('seats.viewingSection'), { name: tierLabel(activeTier) })}
                </p>
                <button
                  type="button"
                  onClick={resetView}
                  className="shrink-0 text-[11px] font-semibold text-[#525252] underline touch-manipulation py-1"
                >
                  {t('seats.showAllSections')}
                </button>
              </div>
            )}
            <div className="flex gap-1.5 overflow-x-auto px-2 py-2 snap-x snap-mandatory scrollbar-none">
              {tierFilterRow(true)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TierFilterChip({
  label,
  active,
  color,
  onClick,
  compact = false,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 snap-start rounded-lg font-medium border transition-all duration-200 touch-manipulation ${
        compact
          ? 'px-2.5 py-2 text-[11px] min-h-9'
          : 'px-3 py-2.5 sm:py-1.5 text-xs min-h-11 sm:min-h-0'
      } ${
        active
          ? 'bg-primary text-primary-foreground border-primary scale-[1.02]'
          : 'bg-card text-foreground border-border hover:border-primary'
      }`}
      style={!active && color ? { borderLeftWidth: 3, borderLeftColor: color } : undefined}
    >
      {label}
    </button>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
  floating = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  floating?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex items-center justify-center rounded-lg border touch-manipulation ${
        floating
          ? 'w-9 h-9 border-[#e8e8e8] bg-white/95 text-[#525252] shadow-sm'
          : 'w-11 h-11 sm:w-9 sm:h-9 border-border bg-card text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}
