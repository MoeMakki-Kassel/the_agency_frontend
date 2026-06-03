import { useEffect, useState, type RefObject } from 'react';

/** Below this inner height, seat picker uses compact chrome (bottom tier dock, etc.). */
export const SEAT_PICKER_CONTAINER_COMPACT_PX = 720;

export interface SeatPickerLayoutState {
  coarsePointer: boolean;
  narrowViewport: boolean;
  shortViewport: boolean;
  /** Desktop/tablet with limited height (e.g. 1920×1200 @ 150% → ~1280×800). */
  scaledLaptopViewport: boolean;
  crampedViewport: boolean;
  containerCompact: boolean;
  /** Touch-style / short-viewport seat UX (bottom tier dock, flex-filled map). */
  preferCompactSeatUx: boolean;
  /** Collapse GA / maximize map chrome (scaled laptop + very short). */
  conserveVerticalSpace: boolean;
}

export function useSeatPickerLayout(
  containerRef?: RefObject<HTMLElement | null>,
): SeatPickerLayoutState {
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [narrowViewport, setNarrowViewport] = useState(false);
  const [shortViewport, setShortViewport] = useState(false);
  const [scaledLaptopViewport, setScaledLaptopViewport] = useState(false);
  const [crampedViewport, setCrampedViewport] = useState(false);
  const [containerCompact, setContainerCompact] = useState(false);

  useEffect(() => {
    const mqCoarse = window.matchMedia('(pointer: coarse)');
    const mqNarrow = window.matchMedia('(max-width: 768px)');
    const mqShort = window.matchMedia('(max-height: 900px)');
    const mqScaledLaptop = window.matchMedia('(min-width: 769px) and (max-height: 900px)');
    const mqCramped = window.matchMedia('(max-height: 750px)');
    const update = () => {
      setCoarsePointer(mqCoarse.matches);
      setNarrowViewport(mqNarrow.matches);
      setShortViewport(mqShort.matches);
      setScaledLaptopViewport(mqScaledLaptop.matches);
      setCrampedViewport(mqCramped.matches);
    };
    update();
    mqCoarse.addEventListener('change', update);
    mqNarrow.addEventListener('change', update);
    mqShort.addEventListener('change', update);
    mqScaledLaptop.addEventListener('change', update);
    mqCramped.addEventListener('change', update);
    return () => {
      mqCoarse.removeEventListener('change', update);
      mqNarrow.removeEventListener('change', update);
      mqShort.removeEventListener('change', update);
      mqScaledLaptop.removeEventListener('change', update);
      mqCramped.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) {
      setContainerCompact(false);
      return;
    }

    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? el.getBoundingClientRect().height;
      setContainerCompact(h > 0 && h < SEAT_PICKER_CONTAINER_COMPACT_PX);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  const preferCompactSeatUx =
    coarsePointer ||
    narrowViewport ||
    shortViewport ||
    scaledLaptopViewport ||
    containerCompact;

  const conserveVerticalSpace = scaledLaptopViewport || crampedViewport;

  return {
    coarsePointer,
    narrowViewport,
    shortViewport,
    scaledLaptopViewport,
    crampedViewport,
    containerCompact,
    preferCompactSeatUx,
    conserveVerticalSpace,
  };
}
