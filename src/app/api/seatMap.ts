import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface SeatMapSeat {
  id: string;
  tier_id: string;
  seat_number: string;
  map_x: number;
  map_y: number;
  status: string;
  section_key: string;
  row: string;
  number: number;
  shape?: 'rect' | 'circle';
  w?: number;
  h?: number;
}

export interface SeatMapTier {
  id: string;
  name: string;
  price: number;
  venue_tier_key?: string;
  selection_mode: 'assigned' | 'general_admission';
  total_quantity: number;
  available_quantity: number;
}

export interface SeatMapPayload {
  layout: {
    page_w: number;
    page_h: number;
    floor_plan_url: string | null;
    ga_zone?: { type: string; x: number; y: number; w: number; h: number } | null;
  };
  seats: SeatMapSeat[];
  tiers: SeatMapTier[];
}

export async function fetchEventSeatMap(
  eventId: string,
  accessToken?: string,
): Promise<SeatMapPayload> {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  const res = await axios.get<SeatMapPayload>(`${API_URL}/events/${eventId}/seat-map`, {
    headers,
  });
  return res.data;
}
