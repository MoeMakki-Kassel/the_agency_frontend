/** Seat layout: stacked class zones with a grid per tier (dummy map until venue coordinates exist). */
export interface SeatPosition {
  x: number;
  y: number;
}

export interface SeatForLayout {
  id: string;
  tierId: string;
  tierIndex: number;
  tierName: string;
  row?: string;
  number?: number;
}

export interface TierZoneLabel {
  tierId: string;
  tierName: string;
  tierIndex: number;
  x: number;
  y: number;
}

export interface TierZoneBounds {
  tierId: string;
  tierName: string;
  tierIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FloorMapLayout {
  positions: Map<string, SeatPosition>;
  tierLabels: TierZoneLabel[];
  tierZones: TierZoneBounds[];
  viewBox: { width: number; height: number };
}

const VIEWBOX_WIDTH = 880;
const STAGE_HEIGHT = 72;
const ZONE_GAP = 28;
const ZONE_PAD = 20;
const LABEL_HEIGHT = 36;
const SEAT_PITCH = 46;
const MAX_COLS = 14;

function sortSeatsInTier(a: SeatForLayout, b: SeatForLayout): number {
  if (a.row && b.row && a.row !== b.row) {
    return a.row.localeCompare(b.row, undefined, { numeric: true, sensitivity: 'base' });
  }
  if (a.number != null && b.number != null) return a.number - b.number;
  return a.id.localeCompare(b.id);
}

function gridCols(count: number): number {
  if (count <= 0) return 1;
  const ideal = Math.ceil(Math.sqrt(count * 1.35));
  return Math.min(MAX_COLS, Math.max(4, ideal));
}

function layoutTierZone(
  tierSeats: SeatForLayout[],
  zoneTop: number,
  centerX: number,
): { positions: Map<string, SeatPosition>; zone: TierZoneBounds; label: TierZoneLabel } {
  const positions = new Map<string, SeatPosition>();
  const sample = tierSeats[0];
  const count = tierSeats.length;
  const cols = gridCols(count);
  const rows = Math.ceil(count / cols);
  const gridW = cols > 1 ? (cols - 1) * SEAT_PITCH : 0;
  const gridH = rows > 1 ? (rows - 1) * SEAT_PITCH : 0;
  const contentW = Math.max(SEAT_PITCH, gridW + SEAT_PITCH);
  const contentH = Math.max(SEAT_PITCH, gridH + SEAT_PITCH);
  const zoneW = contentW + ZONE_PAD * 2;
  const zoneH = LABEL_HEIGHT + contentH + ZONE_PAD * 2;
  const zoneX = centerX - zoneW / 2;
  const startX = centerX - gridW / 2;
  const startY = zoneTop + LABEL_HEIGHT + ZONE_PAD + SEAT_PITCH / 2;

  const sorted = [...tierSeats].sort(sortSeatsInTier);
  sorted.forEach((seat, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.set(seat.id, {
      x: cols === 1 ? centerX : startX + col * SEAT_PITCH,
      y: rows === 1 ? startY : startY + row * SEAT_PITCH,
    });
  });

  return {
    positions,
    zone: {
      tierId: sample.tierId,
      tierName: sample.tierName,
      tierIndex: sample.tierIndex,
      x: zoneX,
      y: zoneTop,
      width: zoneW,
      height: zoneH,
    },
    label: {
      tierId: sample.tierId,
      tierName: sample.tierName,
      tierIndex: sample.tierIndex,
      x: centerX,
      y: zoneTop + LABEL_HEIGHT / 2 + 5,
    },
  };
}

export function assignArcPositions(seats: SeatForLayout[]): FloorMapLayout {
  const positions = new Map<string, SeatPosition>();
  const tierLabels: TierZoneLabel[] = [];
  const tierZones: TierZoneBounds[] = [];

  if (seats.length === 0) {
    return {
      positions,
      tierLabels,
      tierZones,
      viewBox: { width: VIEWBOX_WIDTH, height: 420 },
    };
  }

  const byTier = new Map<string, SeatForLayout[]>();
  for (const seat of seats) {
    const list = byTier.get(seat.tierId) ?? [];
    list.push(seat);
    byTier.set(seat.tierId, list);
  }

  const tierGroups = [...byTier.entries()].sort(
    (a, b) => (a[1][0]?.tierIndex ?? 0) - (b[1][0]?.tierIndex ?? 0),
  );

  const centerX = VIEWBOX_WIDTH / 2;
  let cursorY = STAGE_HEIGHT + 16;

  tierGroups.forEach(([, tierSeats]) => {
    const { positions: tierPos, zone, label } = layoutTierZone(tierSeats, cursorY, centerX);
    tierPos.forEach((pos, id) => positions.set(id, pos));
    tierZones.push(zone);
    tierLabels.push(label);
    cursorY += zone.height + ZONE_GAP;
  });

  const viewHeight = Math.max(420, cursorY + 24);

  return {
    positions,
    tierLabels,
    tierZones,
    viewBox: { width: VIEWBOX_WIDTH, height: viewHeight },
  };
}

/** @deprecated use layout.viewBox */
export const FLOOR_MAP_VIEWBOX = { width: VIEWBOX_WIDTH, height: 560 };
