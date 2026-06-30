import { apiFetch } from '@/lib/api';

const BROWSER_TRACKING_URL = import.meta.env.VITE_API_BROWSER_TRACKING as string;

interface SiteDuration {
  domain: string;
  duration: number;
}

export function syncBrowserTracking(date: string, sites: SiteDuration[]): Promise<void> {
  return apiFetch<void>(BROWSER_TRACKING_URL, {
    method: 'POST',
    body: JSON.stringify({ date, sites }),
  });
}
