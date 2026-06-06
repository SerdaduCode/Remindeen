import { storage } from '#imports';
import { useEffect, useState } from 'react';
import { Globe, RefreshCw, X } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface TopWebsite {
  domain: string;
  duration: number; // in seconds
}

interface ActivityLog {
  id: string;
  domain: string;
  title?: string;
  timestamp: number; // ms
  duration: number; // seconds
  count: number;
}

const topWebsitesStorage = storage.defineItem<TopWebsite[]>('local:topWebsites', {
  fallback: [],
});

const recentActivityStorage = storage.defineItem<ActivityLog[]>('local:recentActivity', {
  fallback: [],
});

const LIMIT_TODAY_WEBSITES = 3;

function WebsiteIcon({ domain }: { domain: string }) {
  const [error, setError] = useState(false);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  if (error) {
    return <Globe className="h-3.5 w-3.5 text-neutral-400" />;
  }

  return (
    <img
      src={faviconUrl}
      alt={domain}
      className="h-3.5 w-3.5 rounded flex-shrink-0 object-contain bg-neutral-800/30 p-0.5"
      onError={() => setError(true)}
    />
  );
}

function LargeWebsiteIcon({ domain }: { domain: string }) {
  const [error, setError] = useState(false);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  if (error) {
    return <Globe className="h-5 w-5 text-neutral-400" />;
  }

  return (
    <img
      src={faviconUrl}
      alt={domain}
      className="h-5 w-5 rounded flex-shrink-0 object-contain bg-neutral-800/30 p-0.5"
      onError={() => setError(true)}
    />
  );
}

export default function Today() {
  const { t } = useTranslation();
  const [topWebsites, setTopWebsites] = useState<TopWebsite[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [showAllTop, setShowAllTop] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const top = await topWebsitesStorage.getValue();
      const recent = await recentActivityStorage.getValue();
      setTopWebsites(top);
      setRecentActivity(recent);
    };
    fetchData();

    const unwatchTop = storage.watch<TopWebsite[]>('local:topWebsites', (newVal) => {
      setTopWebsites(newVal || []);
    });

    const unwatchRecent = storage.watch<ActivityLog[]>('local:recentActivity', (newVal) => {
      setRecentActivity(newVal || []);
    });

    return () => {
      unwatchTop();
      unwatchRecent();
    };
  }, []);

  // Escape key handler to close modal
  useEffect(() => {
    if (!selectedDomain) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDomain(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDomain]);

  const resetStats = async () => {
    if (confirm('Are you sure you want to reset your activity logs?')) {
      await Promise.all([
        topWebsitesStorage.setValue([]),
        recentActivityStorage.setValue([]),
        storage.setItem('local:currentSession', null)
      ]);
    }
  };

  const displayedTopWebsites = showAllTop ? topWebsites : topWebsites.slice(0, LIMIT_TODAY_WEBSITES);

  // Modal stats calculation
  const selectedSite = topWebsites.find(s => s.domain === selectedDomain);
  const totalTimeSec = selectedSite ? selectedSite.duration : 0;

  // Filter logs for this domain
  const matchingLogs = recentActivity.filter(log => log.domain === selectedDomain);

  // Filter today's logs specifically (fallback to all matching logs if none today)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayMs = startOfToday.getTime();
  const todayMatchingLogs = matchingLogs.filter(log => log.timestamp >= startOfTodayMs);
  const logsToUse = todayMatchingLogs.length > 0 ? todayMatchingLogs : matchingLogs;

  // Metrics
  const totalVisits = logsToUse.reduce((acc, log) => acc + log.count, 0);
  const avgSessionSec = totalVisits > 0 ? Math.round(totalTimeSec / totalVisits) : 0;

  const totalTrackedTodaySec = topWebsites.reduce((acc, item) => acc + item.duration, 0);
  const percentage = totalTrackedTodaySec > 0 ? Math.round((totalTimeSec / totalTrackedTodaySec) * 100) : 0;

  const timestamps = logsToUse.map(log => log.timestamp).filter(Boolean);
  const firstVisit = timestamps.length > 0 ? Math.min(...timestamps) : 0;
  const lastVisit = timestamps.length > 0 ? Math.max(...timestamps) : 0;

  const formatTotalTime = (seconds: number): string => {
    if (seconds < 60) return '<1m';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remMins = minutes % 60;
    if (remMins === 0) return `${hours}h`;
    return `${hours}h ${remMins}m`;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '0s';
    if (seconds < 60) return '<1m';
    return `${Math.round(seconds / 60)}m`;
  };

  const formatTime = (ts: number): string => {
    if (!ts) return '';
    const date = new Date(ts);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="rounded-2xl border border-neutral-200/10 dark:border-neutral-800/60 bg-neutral-100/40 dark:bg-[#1e1b18] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="text-base">🐥</span>
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
            {t('widgets.today')}
          </h3>
        </div>
        {topWebsites.length > 0 && (
          <button
            onClick={resetStats}
            title="Reset Stats"
            className="text-neutral-400 hover:text-red-400 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {topWebsites.length === 0 ? (
        <div className="text-center py-6 text-xs text-neutral-400">
          No activity tracked yet today.
        </div>
      ) : (
        <div className="divide-y divide-neutral-200/5 dark:divide-neutral-800/40">
          {displayedTopWebsites.map((site, index) => {
            const minutes = Math.max(1, Math.round(site.duration / 60));
            const isGreenDot = index < 4;
            return (
              <div
                key={site.domain}
                className="flex items-center justify-between py-2.5 text-xs first:pt-0 last:pb-0 cursor-pointer hover:bg-neutral-200/40 dark:hover:bg-neutral-800/30 px-2 -mx-2 rounded-xl transition"
                onClick={() => setSelectedDomain(site.domain)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <WebsiteIcon domain={site.domain} />
                  <span className="font-medium text-neutral-700 dark:text-neutral-200 truncate">
                    {site.domain}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isGreenDot ? 'bg-emerald-500' : 'bg-amber-600'
                    }`}
                  />
                  <span className="font-semibold text-neutral-600 dark:text-neutral-400">
                    {minutes}m
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {topWebsites.length > LIMIT_TODAY_WEBSITES && (
        <button
          onClick={() => setShowAllTop(!showAllTop)}
          className="w-full text-center text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition py-2 mt-2 border-t border-neutral-200/10 dark:border-neutral-800/40 cursor-pointer"
        >
          {showAllTop
            ? t('widgets.show_less')
            : `${t('widgets.show_all')} (${topWebsites.length})`}
        </button>
      )}

      {/* Detail Modal */}
      {selectedDomain && (
        <div
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDomain(null)}
        >
          <div
            className="bg-[#1a1614] border border-neutral-800/80 text-neutral-100 w-full max-w-[340px] rounded-[24px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-3 border-b border-neutral-800/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <LargeWebsiteIcon domain={selectedDomain} />
                <span className="font-bold text-base text-neutral-100 tracking-wide truncate max-w-[190px]" title={selectedDomain}>
                  {selectedDomain}
                </span>
              </div>
              <button
                onClick={() => setSelectedDomain(null)}
                className="text-neutral-400 hover:text-white rounded-full p-1.5 hover:bg-white/5 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Metrics Info */}
            <div className="p-4 space-y-4">
              {/* Big metrics row */}
              <div className="grid grid-cols-3 gap-2 pb-3 border-b border-neutral-800/40 text-center">
                <div>
                  <div className="text-xl font-bold text-neutral-100">{totalVisits}</div>
                  <div className="text-[10px] text-neutral-400 font-semibold tracking-wide uppercase mt-0.5">Visits</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-neutral-100">{formatDuration(avgSessionSec)}</div>
                  <div className="text-[10px] text-neutral-400 font-semibold tracking-wide uppercase mt-0.5">Avg Session</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-neutral-100">{percentage}%</div>
                  <div className="text-[10px] text-neutral-400 font-semibold tracking-wide uppercase mt-0.5">Of Today</div>
                </div>
              </div>

              {/* Small row: First and Last visit */}
              <div className="flex justify-between text-[11px] text-neutral-400 px-0.5">
                <span>First: {formatTime(firstVisit)}</span>
                <span>Last: {formatTime(lastVisit)}</span>
              </div>
            </div>

            {/* Visit History Section */}
            <div className="px-4 pb-4 flex-1 flex flex-col min-h-0">
              <h4 className="text-xs font-semibold text-neutral-300 tracking-wider mb-2 px-0.5">
                Visit History
              </h4>

              {logsToUse.length === 0 ? (
                <div className="text-center py-8 text-xs text-neutral-500 bg-neutral-900/20 rounded-xl border border-neutral-800/20">
                  No visit history logs found.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-[220px] custom-scrollbar">
                  {logsToUse.map((log) => (
                    <div
                      key={log.id}
                      className="grid grid-cols-[55px_1fr_auto] items-center gap-2.5 py-2 px-2.5 rounded-xl bg-neutral-900/30 hover:bg-neutral-900/60 border border-neutral-800/20 text-xs transition"
                    >
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {formatTime(log.timestamp)}
                      </span>
                      <span className="font-semibold text-neutral-300 truncate pr-1" title={log.title || selectedDomain}>
                        {log.title || selectedDomain}
                      </span>
                      <span className="font-bold text-neutral-400">
                        {formatDuration(log.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
