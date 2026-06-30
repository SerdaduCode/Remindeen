import { storage } from '#imports';
import { useEffect, useState } from 'react';
import { Globe, History } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface ActivityLog {
  id: string;
  domain: string;
  timestamp: number; // ms
  duration: number; // seconds
  count: number;
}

const recentActivityStorage = storage.defineItem<ActivityLog[]>('local:recentActivity', {
  fallback: [],
});

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

export default function RecentActivity() {
  const { t } = useTranslation();
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const recent = await recentActivityStorage.getValue();
      setRecentActivity(recent);
    };
    fetchData();

    const unwatchRecent = storage.watch<ActivityLog[]>('local:recentActivity', (newVal) => {
      setRecentActivity(newVal || []);
    });

    return () => {
      unwatchRecent();
    };
  }, []);

  const formatRecentDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    return `${Math.round(seconds / 60)}m`;
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes}${ampm}`;
  };

  const getDurationColorClass = (index: number): string => {
    if (index < 3) return 'text-red-400';
    if (index < 6) return 'text-amber-500';
    return 'text-emerald-400';
  };

  const displayedRecentActivity = recentActivity.slice(0, 10);

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white/90">
          {t('widgets.recent_activity')}
        </h3>
      </div>

      {recentActivity.length === 0 ? (
        <div className="text-center py-6 text-xs text-white/40">
          No recent activity recorded.
        </div>
      ) : (
        <div className="space-y-1 overflow-y-auto max-h-[400px] glass-scrollbar">
          {displayedRecentActivity.map((log, index) => (
            <div
              key={log.id}
              className="grid grid-cols-[55px_1fr_auto] items-center py-2 text-xs border-b border-white/5 last:border-0"
            >
              <span className="text-[10px] text-white/40">
                {formatTime(log.timestamp)}
              </span>
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <WebsiteIcon domain={log.domain} />
                <span className="font-medium text-white/80 truncate">
                  {log.domain}
                </span>
                {log.count > 1 && (
                  <span className="text-[10px] text-white/40 font-normal">
                    ×{log.count}
                  </span>
                )}
              </div>
              <span className={`font-semibold ${getDurationColorClass(index)}`}>
                {formatRecentDuration(log.duration)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
