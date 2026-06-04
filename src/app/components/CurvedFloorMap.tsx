import React from 'react';
import { SeatPosition, TierZoneLabel, TierZoneBounds } from '../data/dummyFloorMapLayout';
import { getTierColor, TierColorClasses } from '../data/tierColors';
import { useLanguage } from '../contexts/LanguageContext';

export interface FloorMapSeat {
  id: string;
  label: string;
  tierId: string;
  tierName: string;
  tierIndex: number;
  price: number;
  isAvailable: boolean;
  isSelected: boolean;
}

interface CurvedFloorMapProps {
  seats: FloorMapSeat[];
  positions: Map<string, SeatPosition>;
  tierLabels: TierZoneLabel[];
  tierZones: TierZoneBounds[];
  mapSize: { width: number; height: number };
  activeTierId?: string | null;
  onSeatClick: (seat: FloorMapSeat) => void;
}

function seatButtonClass(seat: FloorMapSeat, tierColor: TierColorClasses): string {
  const base =
    'absolute w-9 h-9 sm:w-10 sm:h-10 rounded-full border-[3px] text-[10px] sm:text-[11px] font-bold flex items-center justify-center transition-all -translate-x-1/2 -translate-y-1/2 shadow-sm';

  if (!seat.isAvailable) {
    return base + ' bg-red-500 border-red-700 text-white cursor-not-allowed opacity-90';
  }
  if (seat.isSelected) {
    return (
      base +
      ' ' +
      tierColor.bg +
      ' ' +
      tierColor.border +
      ' ' +
      tierColor.text +
      ' ring-2 ring-black ring-offset-2 cursor-pointer scale-105 z-20'
    );
  }
  return (
    base +
    ' bg-green-500 border-green-600 text-white hover:bg-green-600 hover:scale-105 cursor-pointer z-10 ring-2 ring-offset-1'
  );
}

export function CurvedFloorMap({
  seats,
  positions,
  tierLabels,
  tierZones,
  mapSize,
  activeTierId = null,
  onSeatClick,
}: CurvedFloorMapProps) {
  const { t } = useLanguage();
  const { width, height } = mapSize;
  const svgViewBox = '0 0 ' + width + ' ' + height;

  const focusZone = activeTierId
    ? tierZones.find((z) => z.tierId === activeTierId)
    : undefined;
  const innerTransform = focusZone
    ? {
        transform: 'scale(1.12)',
        transformOrigin: `${((focusZone.x + focusZone.width / 2) / width) * 100}% ${((focusZone.y + focusZone.height / 2) / height) * 100}%`,
        transition: 'transform 0.25s ease',
      }
    : { transition: 'transform 0.25s ease' };

  return (
    <div className="space-y-3">
      <p className="text-xs sm:text-sm text-[#8c8c8c] px-1">{t('seats.mapHint')}</p>

      <div className="relative w-full overflow-auto rounded-xl border border-[#e8e8e8] bg-gradient-to-b from-[#fafafa] to-white p-4 sm:p-5">
        <svg
          viewBox={svgViewBox}
          className="w-full min-w-[720px] h-auto pointer-events-none"
          role="img"
          aria-label="Venue floor map"
        >
          <defs>
            <linearGradient id="stageGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#525252" />
            </linearGradient>
          </defs>

          <rect
            x={width * 0.28}
            y={12}
            width={width * 0.44}
            height={48}
            rx={10}
            fill="url(#stageGrad)"
          />
          <text
            x={width / 2}
            y={42}
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            letterSpacing="4"
          >
            {t('seats.stage')}
          </text>

          {tierZones.map((zone) => {
            const color = getTierColor(zone.tierId, zone.tierIndex);
            const dimmed = activeTierId != null && zone.tierId !== activeTierId;
            return (
              <rect
                key={zone.tierId}
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                rx={14}
                fill={color.fill}
                fillOpacity={dimmed ? 0.03 : 0.08}
                stroke={color.fill}
                strokeWidth={2}
                strokeOpacity={dimmed ? 0.15 : 0.45}
                style={{ transition: 'fill-opacity 0.25s ease, stroke-opacity 0.25s ease' }}
              />
            );
          })}

          {tierLabels.map((zone) => (
            <text
              key={'label-' + zone.tierId}
              x={zone.x}
              y={zone.y}
              textAnchor="middle"
              fill="#171717"
              fontSize="13"
              fontWeight="700"
            >
              {zone.tierName}
            </text>
          ))}
        </svg>

        <div
          className="absolute inset-4 sm:inset-5 min-w-[min(100%,680px)]"
          style={{ aspectRatio: width + ' / ' + height, ...innerTransform }}
        >
          {seats.map((seat) => {
            const pos = positions.get(seat.id);
            if (!pos) return null;
            const hidden = activeTierId != null && seat.tierId !== activeTierId;
            const tierColor = getTierColor(seat.tierId, seat.tierIndex);
            const leftPct = (pos.x / width) * 100;
            const topPct = (pos.y / height) * 100;
            const ringStyle: React.CSSProperties | undefined =
              seat.isAvailable && !seat.isSelected
                ? { boxShadow: '0 0 0 2px white, 0 0 0 4px ' + tierColor.fill }
                : undefined;

            return (
              <button
                key={seat.id}
                type="button"
                disabled={!seat.isAvailable || hidden}
                onClick={() => onSeatClick(seat)}
                className={
                  seatButtonClass(seat, tierColor) +
                  (seat.isAvailable && !seat.isSelected ? ' ring-transparent' : '')
                }
                style={{
                  left: leftPct + '%',
                  top: topPct + '%',
                  opacity: hidden ? 0 : 1,
                  pointerEvents: hidden ? 'none' : 'auto',
                  transition: 'opacity 0.25s ease, transform 0.25s ease',
                  ...ringStyle,
                }}
                title={seat.tierName + ' · ' + seat.label + ' · ' + seat.price + ' JOD'}
                aria-label={
                  seat.tierName +
                  ', seat ' +
                  seat.label +
                  ', ' +
                  (seat.isAvailable ? 'available' : 'unavailable')
                }
              >
                {seat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function FloorMapLegend({
  tiers,
}: {
  tiers: { id: string; name: string; price: number; index: number }[];
}) {
  const { t } = useLanguage();

  return (
    <div className="mt-2 space-y-3">
      <p className="text-xs font-semibold text-[#525252] uppercase tracking-wide">
        {t('seats.legendTitle')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-green-500 border-2 border-green-600 shrink-0" />
          <span>{t('seats.available')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-red-500 border-2 border-red-700 shrink-0" />
          <span>{t('seats.taken')}</span>
        </div>
      </div>
      <div className="border-t border-[#e8e8e8] pt-3">
        <p className="text-xs text-[#8c8c8c] mb-2">{t('seats.classColors')}</p>
        <div className="flex flex-wrap gap-2">
          {tiers.map((tier) => {
            const c = getTierColor(tier.id, tier.index);
            return (
              <div
                key={tier.id}
                className={'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 bg-card text-card-foreground ' + c.border}
              >
                <span className={'w-4 h-4 rounded-full ' + c.bg} />
                <span className="text-xs font-medium">
                  {tier.name} · {tier.price} JOD
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
