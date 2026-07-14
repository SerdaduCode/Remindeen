import { apiFetch } from '@/lib/api';

const BROWSER_TRACKING_URL = import.meta.env.VITE_API_BROWSER_TRACKING as string;
const BROWSER_TRACKING_WEEKLY_URL = import.meta.env.VITE_API_BROWSER_TRACKING_WEEKLY as string;

interface SiteDuration {
  domain: string;
  duration: number;
}

export interface DailyStatRow {
  domain: string;
  date: string; // YYYY-MM-DD
  duration: number;
}

export function syncBrowserTracking(date: string, sites: SiteDuration[]): Promise<void> {
  return apiFetch<void>(BROWSER_TRACKING_URL, {
    method: 'POST',
    body: JSON.stringify({ date, sites }),
  });
}

export function fetchBrowsingWeeklyStats(today: string): Promise<DailyStatRow[]> {
  return apiFetch<DailyStatRow[]>(`${BROWSER_TRACKING_WEEKLY_URL}?today=${today}`, {
    method: 'GET',
  });
}
