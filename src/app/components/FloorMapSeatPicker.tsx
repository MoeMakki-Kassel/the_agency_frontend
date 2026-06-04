import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from './AuthProvider';
import { useLanguage } from '../contexts/LanguageContext';
import { assignArcPositions } from '../data/dummyFloorMapLayout';
import { CurvedFloorMap, FloorMapLegend, FloorMapSeat } from './CurvedFloorMap';
import { fetchEventSeatMap, type SeatMapSeat } from '../api/seatMap';
import { SvgVenueMapPicker, TierFilterChip } from './SvgVenueMapPicker';
import { getTierColor } from '../data/tierColors';
import { useSeatPickerLayout } from '../hooks/useSeatPickerLayout';
import { usePriceFormat } from '../hooks/usePriceFormat';
import { displayTierName, sortTiersByPriceDesc } from '../utils/tierDisplay';
import { getUserFacingErrorMessage } from '../utils/userFacingError';

const API_URL = import.meta.env.VITE_API_URL;

export interface SelectedSeatInfo {
  seat_id: string;
  row: string;
  number: number;
  seatClass: string;
  price: number;
}

interface Tier {
  id: string;
  name: string;
  price: number;
  description?: string;
  selection_mode?: 'assigned' | 'general_admission';
  venue_tier_key?: string;
}

type LoadedSeat = FloorMapSeat & { row: string; number: number };

interface FloorMapSeatPickerProps {
  eventId: string;
  venueTemplateId?: string | null;
  tiers: Tier[];
  maxTicketsPerOrder?: number | null;
  onConfirm: (seats: SelectedSeatInfo[]) => void;
}

function parseSeatNumber(seatNumber: string): { row: string; number: number } {
  const ga = /^GA-(\d+)$/i.exec(seatNumber);
  if (ga) return { row: 'GA', number: parseInt(ga[1], 10) };
  const prefixed = /^[A-Z]+-([A-Z]+)-(\d+)$/i.exec(seatNumber);
  if (prefixed) return { row: prefixed[1], number: parseInt(prefixed[2], 10) };
  const [row, numStr] = seatNumber.split('-');
  return { row: row ?? '', number: parseInt(numStr ?? '0', 10) };
}

export function FloorMapSeatPicker({
  eventId,
  venueTemplateId,
  tiers,
  maxTicketsPerOrder,
  onConfirm,
}: FloorMapSeatPickerProps) {
  const { session } = useAuth();
  const { t } = useLanguage();
  const { formatPrice, formatDecimal: formatAmount } = usePriceFormat();
  const [loading, setLoading] = useState(true);
  const [mapSeats, setMapSeats] = useState<LoadedSeat[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [seatMapPayload, setSeatMapPayload] = useState<Awaited<ReturnType<typeof fetchEventSeatMap>> | null>(null);
  const [gaQuantities, setGaQuantities] = useState<Record<string, number>>({});
  const [curvedActiveTierId, setCurvedActiveTierId] = useState<string | null>(null);

  const maxSeats = maxTicketsPerOrder && maxTicketsPerOrder > 0 ? maxTicketsPerOrder : 10;
  const usesVenueMap = Boolean(venueTemplateId);

  const propTierIdsKey = useMemo(
    () => tiers.map((t) => t.id).join(','),
    [tiers],
  );

  const seatMapTierIdsKey = useMemo(
    () => seatMapPayload?.tiers?.map((t) => t.id).join(',') ?? '',
    [seatMapPayload?.tiers],
  );

  const effectiveTiers = useMemo((): Tier[] => {
    if (usesVenueMap && seatMapPayload?.tiers?.length) {
      return seatMapPayload.tiers.map((t) => ({
        id: t.id,
        name: t.name,
        price: t.price,
        selection_mode: t.selection_mode,
        venue_tier_key: t.venue_tier_key,
      }));
    }
    return tiers;
  }, [usesVenueMap, seatMapTierIdsKey, seatMapPayload, tiers]);

  const regularLabel = t('tier.regular');
  const gaTiers = useMemo(
    () =>
      sortTiersByPriceDesc(
        effectiveTiers.filter((tier) => tier.selection_mode === 'general_admission'),
      ),
    [effectiveTiers],
  );
  const mapTiers = useMemo(
    () =>
      sortTiersByPriceDesc(
        effectiveTiers.filter((tier) => tier.selection_mode !== 'general_admission'),
      ),
    [effectiveTiers],
  );
  const tierLabel = (tier: Tier) => displayTierName(tier, regularLabel);

  const hasSeatMapRef = useRef(false);
  const mapShellRef = useRef<HTMLDivElement | null>(null);
  const { preferCompactSeatUx, conserveVerticalSpace } = useSeatPickerLayout(mapShellRef);

  useEffect(() => {
    hasSeatMapRef.current = false;
  }, [eventId]);

  useEffect(() => {
    if (!eventId) {
      setMapSeats([]);
      setSeatMapPayload(null);
      setLoading(false);
      hasSeatMapRef.current = false;
      return;
    }

    if (!usesVenueMap && tiers.length === 0) {
      setMapSeats([]);
      setSeatMapPayload(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      const showFullScreenLoader = usesVenueMap ? !hasSeatMapRef.current : true;
      if (showFullScreenLoader) setLoading(true);
      try {
        const headers = session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined;

        if (usesVenueMap) {
          const payload = await fetchEventSeatMap(eventId, session?.access_token);
          if (cancelled) return;
          hasSeatMapRef.current = true;
          setSeatMapPayload(payload);
          const tierList =
            payload.tiers?.length > 0
              ? payload.tiers.map((t) => ({
                  id: t.id,
                  name: t.name,
                  price: t.price,
                  selection_mode: t.selection_mode,
                  venue_tier_key: t.venue_tier_key,
                }))
              : tiers;
          const tierById = new Map(tierList.map((t, i) => [t.id, { ...t, index: i }]));
          const loaded: LoadedSeat[] = payload.seats.map((s) => {
            const tier = tierById.get(s.tier_id) ?? tierList.find((t) => t.id === s.tier_id);
            const tierIndex = tier ? tierList.indexOf(tier) : 0;
            return {
              id: s.id,
              label: s.seat_number,
              tierId: s.tier_id,
              tierName: tier ? tierLabel(tier) : '',
              tierIndex,
              price: tier?.price ?? 0,
              isAvailable: s.status === 'available',
              isSelected: false,
              row: s.row,
              number: s.number,
            };
          });
          setMapSeats(loaded);
          const gaInit: Record<string, number> = {};
          for (const gt of tierList.filter((t) => t.selection_mode === 'general_admission')) {
            gaInit[gt.id] = 0;
          }
          setGaQuantities(gaInit);
        } else {
          const results = await Promise.all(
            tiers.map(async (tier, tierIndex) => {
              const res = await axios.get(
                `${API_URL}/events/${eventId}/tiers/${tier.id}/seats`,
                { headers },
              );
              return (res.data as { id: string; seat_number: string; status: string }[]).map(
                (s) => {
                  const { row, number } = parseSeatNumber(s.seat_number);
                  return {
                    id: s.id,
                    label: `${row}${number}`,
                    tierId: tier.id,
                    tierName: tierLabel(tier),
                    tierIndex,
                    price: tier.price,
                    isAvailable: s.status === 'available',
                    isSelected: false,
                    row,
                    number,
                  } satisfies LoadedSeat;
                },
              );
            }),
          );
          if (cancelled) return;
          setSeatMapPayload(null);
          setMapSeats(results.flat());
        }
        setSelectedIds(new Set());
      } catch (err: unknown) {
        if (!cancelled) {
          toast.error(getUserFacingErrorMessage(err, t('booking.seat.loadFailed'), t));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId, usesVenueMap, propTierIdsKey, session?.access_token]);

  const seatsWithSelection = useMemo(
    () => mapSeats.map((s) => ({ ...s, isSelected: selectedIds.has(s.id) })),
    [mapSeats, selectedIds],
  );

  const layout = useMemo(
    () =>
      usesVenueMap
        ? null
        : assignArcPositions(
            seatsWithSelection.map((s) => ({
              id: s.id,
              tierId: s.tierId,
              tierIndex: s.tierIndex,
              tierName: s.tierName,
              row: s.row,
              number: s.number,
            })),
          ),
    [seatsWithSelection, usesVenueMap],
  );

  const tierIndexById = useMemo(
    () => new Map(effectiveTiers.map((t, i) => [t.id, i])),
    [effectiveTiers],
  );

  const gaCount = Object.values(gaQuantities).reduce((a, b) => a + b, 0);
  const mapSelectedCount = selectedIds.size;
  const totalSelected = mapSelectedCount + gaCount;

  const selectedMapSeats = useMemo(
    () => mapSeats.filter((s) => selectedIds.has(s.id)),
    [mapSeats, selectedIds],
  );

  const totalPrice = useMemo(() => {
    let sum = selectedMapSeats.reduce((s, seat) => s + seat.price, 0);
    for (const [tierId, qty] of Object.entries(gaQuantities)) {
      if (qty > 0) {
        const tier = effectiveTiers.find((t) => t.id === tierId);
        sum += (tier?.price ?? 0) * qty;
      }
    }
    return sum;
  }, [selectedMapSeats, gaQuantities, effectiveTiers]);

  const seatToastDetail = (seat: Pick<FloorMapSeat, 'tierName' | 'label' | 'price'>) =>
    `${seat.tierName} ${seat.label} · ${formatPrice(seat.price)}`;

  const notifySeatSelected = (seat: Pick<FloorMapSeat, 'tierName' | 'label' | 'price'>) => {
    toast.success(t('booking.seat.selected'), { description: seatToastDetail(seat) });
  };

  const notifySeatRemoved = (seat: Pick<FloorMapSeat, 'tierName' | 'label' | 'price'>) => {
    toast.info(t('booking.seat.removed'), { description: seatToastDetail(seat) });
  };

  const handleSeatClick = (seat: FloorMapSeat) => {
    if (!seat.isAvailable) {
      toast.error(t('booking.seat.taken'));
      return;
    }

    if (!usesVenueMap && curvedActiveTierId == null) {
      setCurvedActiveTierId(seat.tierId);
    }

    if (selectedIds.has(seat.id)) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(seat.id);
        return next;
      });
      notifySeatRemoved(seat);
      return;
    }

    const wouldBe = selectedIds.size + gaCount + 1;
    if (wouldBe > maxSeats) {
      toast.error(t('booking.seat.maxReached'));
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(seat.id);
      return next;
    });
    notifySeatSelected(seat);
  };

  const handleVenueSeatToggle = (seat: SeatMapSeat, tierName: string, price: number) => {
    if (seat.status !== 'available') {
      toast.error(t('booking.seat.taken'));
      return;
    }
    const loaded = mapSeats.find((s) => s.id === seat.id);
    if (loaded) handleSeatClick(loaded);
    else {
      handleSeatClick({
        id: seat.id,
        label: seat.seat_number,
        tierId: seat.tier_id,
        tierName,
        tierIndex: tierIndexById.get(seat.tier_id) ?? 0,
        price,
        isAvailable: true,
        isSelected: selectedIds.has(seat.id),
      });
    }
  };

  const setGaQty = (tierId: string, qty: number) => {
    const tier = effectiveTiers.find((t) => t.id === tierId);
    const prevQty = gaQuantities[tierId] ?? 0;
    const otherGa = gaCount - prevQty;
    const capped = Math.max(0, Math.min(qty, maxSeats - mapSelectedCount - otherGa));
    if (capped === prevQty) {
      if (qty > prevQty) toast.error(t('booking.seat.maxReached'));
      return;
    }
    setGaQuantities((prev) => ({ ...prev, [tierId]: capped }));
    if (!tier) return;
    const detail = `${tierLabel(tier)} · ${formatPrice(tier.price)} · ${formatAmount(capped, { maximumFractionDigits: 0 })}`;
    if (capped > prevQty) {
      toast.success(t('booking.ga.added'), { description: detail });
    } else {
      toast.info(t('booking.ga.removed'), { description: detail });
    }
  };

  const handleConfirm = async () => {
    if (totalSelected < 1) {
      toast.error(t('booking.seat.selectAtLeastOne'));
      return;
    }

    const out: SelectedSeatInfo[] = selectedMapSeats.map((s) => ({
      seat_id: s.id,
      row: s.row,
      number: s.number,
      seatClass: s.tierId,
      price: s.price,
    }));

    try {
      const headers = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined;

      for (const gt of gaTiers) {
        const qty = gaQuantities[gt.id] ?? 0;
        if (qty < 1) continue;
        const res = await axios.get(
          `${API_URL}/events/${eventId}/tiers/${gt.id}/seats?status=available&limit=${qty}`,
          { headers },
        );
        const picked = res.data as { id: string; seat_number: string }[];
        if (picked.length < qty) {
          toast.error(
            t('booking.ga.onlyAvailable')
              .replace('{{count}}', String(picked.length))
              .replace('{{tier}}', tierLabel(gt)),
          );
          return;
        }
        for (const s of picked) {
          const { row, number } = parseSeatNumber(s.seat_number);
          out.push({
            seat_id: s.id,
            row,
            number,
            seatClass: gt.id,
            price: gt.price,
          });
        }
      }
    } catch (err: unknown) {
      toast.error(getUserFacingErrorMessage(err, t('booking.ga.reserveFailed'), t));
      return;
    }

    onConfirm(out);
  };

  const tierLegend = sortTiersByPriceDesc(effectiveTiers).map((tier, index) => ({
    id: tier.id,
    name: tierLabel(tier),
    price: tier.price,
    index,
  }));

  const showLoadingOverlay = loading && (usesVenueMap ? !seatMapPayload : mapSeats.length === 0);

  if (showLoadingOverlay) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm font-medium">
        Loading seats...
      </div>
    );
  }

  const ticketCountLabel =
    totalSelected === 1 ? t('booking.ticketSelected') : t('booking.ticketsSelected');
  const compactSummary = preferCompactSeatUx;

  return (
    <div className="flex flex-col min-h-0 flex-1 gap-0">
      <div
        className={`sticky top-0 z-20 shrink-0 px-4 sm:px-0 bg-white/95 backdrop-blur-sm border-b border-border ${
          compactSummary
            ? 'pt-2 pb-1.5 sm:pt-3 sm:pb-2 scaled-laptop:pt-1.5 scaled-laptop:pb-1 cramped:pt-1.5 cramped:pb-1'
            : 'pt-3 pb-2'
        }`}
      >
        {!compactSummary && (
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
            {t('booking.selection.summary')}
          </p>
        )}
        <div
          className={`flex items-center justify-between gap-3 bg-muted rounded-xl ${
            compactSummary ? 'p-2 sm:p-3' : 'p-3'
          }`}
        >
          <div className="min-w-0">
            <span className="text-sm sm:text-base font-semibold text-foreground block">
              {totalSelected} {ticketCountLabel}
            </span>
            {totalSelected === 0 && !compactSummary ? (
              <span className="text-xs text-muted-foreground mt-0.5 block truncate">
                {t('booking.selection.empty')}
              </span>
            ) : totalSelected > 0 ? (
              <span className="text-xs text-[#525252] mt-0.5 block truncate">
                {selectedMapSeats
                  .slice(0, 2)
                  .map((s) => `${s.tierName} ${s.label}`)
                  .join(' · ')}
                {totalSelected > 2 ? ` · +${totalSelected - 2}` : ''}
              </span>
            ) : null}
          </div>
          {totalSelected > 0 && (
            <span className="text-base sm:text-lg font-bold shrink-0">{formatPrice(totalPrice)}</span>
          )}
        </div>
        {totalSelected > 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 -mx-1 px-1">
            {selectedMapSeats.map((seat) => (
              <button
                key={seat.id}
                type="button"
                onClick={() => handleSeatClick(seat)}
                className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium touch-manipulation"
              >
                {seat.tierName} {seat.label} ×
              </button>
            ))}
            {gaTiers.map((gt) => {
              const q = gaQuantities[gt.id] ?? 0;
              if (q < 1) return null;
              return (
                <span
                  key={gt.id}
                  className="shrink-0 px-3 py-1.5 bg-[#525252] text-white rounded-lg text-xs"
                >
                  {tierLabel(gt)} ×{q}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div
        ref={mapShellRef}
        className={`flex-1 min-h-0 flex flex-col px-4 sm:px-0 overflow-hidden min-h-[min(32vh,260px)] short:min-h-[min(36vh,300px)] scaled-laptop:min-h-[min(40vh,340px)] cramped:min-h-[min(42vh,320px)] ${
          usesVenueMap || preferCompactSeatUx ? 'py-1' : 'py-3'
        }`}
      >
      {usesVenueMap && seatMapPayload ? (
        <SvgVenueMapPicker
          seatMap={seatMapPayload}
          tierIndexById={tierIndexById}
          selectedIds={selectedIds}
          onToggle={handleVenueSeatToggle}
          fillContainer
          containerRef={mapShellRef}
        />
      ) : layout ? (
        <div className="flex flex-col min-h-0 flex-1 gap-0 overflow-auto">
          {mapTiers.length > 1 && !preferCompactSeatUx && (
            <div
              className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory shrink-0"
              role="group"
              aria-label={t('seats.filterByTier')}
            >
              <TierFilterChip
                label={t('seats.allSections')}
                active={curvedActiveTierId == null}
                onClick={() => setCurvedActiveTierId(null)}
              />
              {mapTiers.map((tier, index) => (
                <TierFilterChip
                  key={tier.id}
                  label={`${tierLabel(tier)} — ${formatPrice(tier.price)}`}
                  active={curvedActiveTierId === tier.id}
                  color={getTierColor(tier.id, index).fill}
                  onClick={() =>
                    setCurvedActiveTierId((prev) => (prev === tier.id ? null : tier.id))
                  }
                />
              ))}
            </div>
          )}
          <div className={preferCompactSeatUx ? 'flex-1 min-h-0 overflow-auto' : undefined}>
            <CurvedFloorMap
              seats={seatsWithSelection}
              positions={layout.positions}
              tierLabels={layout.tierLabels}
              tierZones={layout.tierZones}
              mapSize={layout.viewBox}
              activeTierId={curvedActiveTierId}
              onSeatClick={handleSeatClick}
            />
          </div>
          {mapTiers.length > 1 && preferCompactSeatUx && (
            <div
              className="shrink-0 border-t border-border bg-white/95 backdrop-blur-md z-20"
              role="group"
              aria-label={t('seats.filterByTier')}
            >
              <div className="flex gap-1.5 overflow-x-auto px-2 py-2 snap-x snap-mandatory scrollbar-none">
                <TierFilterChip
                  compact
                  label={t('seats.allSections')}
                  active={curvedActiveTierId == null}
                  onClick={() => setCurvedActiveTierId(null)}
                />
                {mapTiers.map((tier, index) => (
                  <TierFilterChip
                    key={tier.id}
                    compact
                    label={`${tierLabel(tier)} · ${formatAmount(tier.price)}`}
                    active={curvedActiveTierId === tier.id}
                    color={getTierColor(tier.id, index).fill}
                    onClick={() =>
                      setCurvedActiveTierId((prev) => (prev === tier.id ? null : tier.id))
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {!usesVenueMap && <FloorMapLegend tiers={tierLegend} />}
      </div>

      {gaTiers.length > 0 &&
        (conserveVerticalSpace ? (
          <details className="shrink-0 mx-4 sm:mx-0 border border-border rounded-xl bg-card text-card-foreground group">
            <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium touch-manipulation [&::-webkit-details-marker]:hidden">
              {t('tier.regularStanding')}
              <span className="float-end text-muted-foreground text-xs font-normal group-open:hidden">
                Tap to expand
              </span>
            </summary>
            <div className="space-y-2 px-3 pb-3 pt-0 border-t border-border">
              {gaTiers.map((gt) => (
                <div key={gt.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm truncate">
                    {tierLabel(gt)} — {formatPrice(gt.price)}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      aria-label={`Decrease ${tierLabel(gt)}`}
                      className="w-9 h-9 rounded-lg border border-border text-lg touch-manipulation active:bg-muted"
                      onClick={() => setGaQty(gt.id, (gaQuantities[gt.id] ?? 0) - 1)}
                    >
                      −
                    </button>
                    <span className="w-7 text-center font-semibold text-sm">
                      {gaQuantities[gt.id] ?? 0}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase ${tierLabel(gt)}`}
                      className="w-9 h-9 rounded-lg border border-border text-lg touch-manipulation active:bg-muted"
                      onClick={() => setGaQty(gt.id, (gaQuantities[gt.id] ?? 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </details>
        ) : (
          <div className="shrink-0 space-y-3 mx-4 sm:mx-0 p-4 bg-card text-card-foreground border border-border rounded-xl">
            <p className="text-sm font-medium">{t('tier.regularStanding')}</p>
            {gaTiers.map((gt) => (
              <div key={gt.id} className="flex items-center justify-between gap-4">
                <span className="text-sm">
                  {tierLabel(gt)} — {formatPrice(gt.price)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Decrease ${tierLabel(gt)}`}
                    className="w-11 h-11 sm:w-9 sm:h-9 rounded-lg border border-border text-lg touch-manipulation active:bg-muted"
                    onClick={() => setGaQty(gt.id, (gaQuantities[gt.id] ?? 0) - 1)}
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{gaQuantities[gt.id] ?? 0}</span>
                  <button
                    type="button"
                    aria-label={`Increase ${tierLabel(gt)}`}
                    className="w-11 h-11 sm:w-9 sm:h-9 rounded-lg border border-border text-lg touch-manipulation active:bg-muted"
                    onClick={() => setGaQty(gt.id, (gaQuantities[gt.id] ?? 0) + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

      <div className="sticky bottom-0 z-20 shrink-0 px-4 sm:px-0 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white to-white/90 border-t border-border">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={totalSelected < 1}
          className="w-full py-3.5 sm:py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-accent transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base"
        >
          {totalSelected < 1
            ? t('booking.selection.empty')
            : `${t('booking.continue')} · ${formatPrice(totalPrice)}`}
        </button>
      </div>
    </div>
  );
}
