import { useMemo, useState } from 'react';
import { Globe, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { useBrowsingWeeklyStats } from '@/hooks/use-browsing-weekly-stats';

function WebsiteIcon({ domain }: { domain: string }) {
  const [error, setError] = useState(false);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  if (error) {
    return <Globe className="h-3.5 w-3.5 text-white/40" />;
  }

  return (
    <img
      src={faviconUrl}
      alt={domain}
      className="h-3.5 w-3.5 rounded flex-shrink-0 object-contain bg-white/10 p-0.5"
      onError={() => setError(true)}
    />
  );
}

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const todayString = getLocalDateString(new Date());

export default function BrowsingTimeChart() {
  const { t, lang } = useTranslation();
  const { isSignedIn, loading: authLoading } = useAuth();
  const { dayTotals, getDomainsForDate } = useBrowsingWeeklyStats(isSignedIn);
  const [selectedDate, setSelectedDate] = useState(todayString);

  const maxDuration = Math.max(1, ...dayTotals.map((d) => d.totalDuration));
  const selectedDomains = getDomainsForDate(selectedDate);
  const hasAnyData = dayTotals.some((d) => d.totalDuration > 0);

  const dayLabels = useMemo(() => {
    const locale = lang === 'id' ? 'id-ID' : 'en-US';
    return dayTotals.map((d) => {
      const [year, month, day] = d.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString(locale, { weekday: 'short' });
    });
  }, [dayTotals, lang]);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white/90">
          {t('widgets.browsing_time')}
        </h3>
      </div>

      {authLoading ? null : !isSignedIn ? (
        <div className="text-center py-6 text-xs text-white/40">
          {t('widgets.browsing_time.sign_in_prompt')}
        </div>
      ) : (
        <>
          <div className="flex items-end justify-between gap-2 h-24 px-1">
            {dayTotals.map((day, index) => {
              const heightPct = Math.max(4, Math.round((day.totalDuration / maxDuration) * 100));
              const isSelected = day.date === selectedDate;
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className="flex flex-1 flex-col items-center gap-1.5 cursor-pointer group"
                >
                  <div className="flex h-16 w-full items-end justify-center">
                    <div
                      className={`w-full max-w-[18px] rounded-full transition-colors ${
                        isSelected ? 'bg-blue-400' : 'bg-white/25 group-hover:bg-white/40'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      isSelected ? 'text-white/90' : 'text-white/40'
                    }`}
                  >
                    {dayLabels[index]}
                  </span>
                </button>
              );
            })}
          </div>

          {!hasAnyData ? (
            <div className="text-center py-6 text-xs text-white/40">
              {t('widgets.browsing_time.empty')}
            </div>
          ) : (
            <div className="mt-3 divide-y divide-white/10 overflow-y-auto max-h-[200px] overflow-x-hidden glass-scrollbar">
              {selectedDomains.length === 0 ? (
                <div className="text-center py-6 text-xs text-white/40">
                  {t('widgets.browsing_time.empty')}
                </div>
              ) : (
                selectedDomains.map((site) => {
                  const minutes = Math.max(1, Math.round(site.duration / 60));
                  return (
                    <div
                      key={site.domain}
                      className="flex items-center justify-between py-2 text-xs first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <WebsiteIcon domain={site.domain} />
                        <span className="font-medium text-white/80 truncate max-w-[200px]">
                          {site.domain}
                        </span>
                      </div>
                      <span className="font-semibold text-white/60">{minutes}m</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
