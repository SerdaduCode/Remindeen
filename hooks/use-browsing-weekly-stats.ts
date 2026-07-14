import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchBrowsingWeeklyStats, type DailyStatRow } from '@/lib/browser-tracking';

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface DayTotal {
  date: string;
  totalDuration: number;
}

export function useBrowsingWeeklyStats(enabled: boolean) {
  const [rows, setRows] = useState<DailyStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchBrowsingWeeklyStats(getLocalDateString(new Date()));
      setRows(data);
      setError(null);
    } catch {
      setError('failed');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dayTotals = useMemo<DayTotal[]>(() => {
    const totalsByDate = new Map<string, number>();
    for (const row of rows) {
      totalsByDate.set(row.date, (totalsByDate.get(row.date) ?? 0) + row.duration);
    }
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const date = getLocalDateString(d);
      return { date, totalDuration: totalsByDate.get(date) ?? 0 };
    });
  }, [rows]);

  const getDomainsForDate = useCallback(
    (date: string) =>
      rows
        .filter((row) => row.date === date)
        .sort((a, b) => b.duration - a.duration),
    [rows]
  );

  return { rows, dayTotals, getDomainsForDate, loading, error };
}
