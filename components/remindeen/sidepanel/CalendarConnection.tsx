import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendarConnection } from "@/hooks/use-calendar-connection";
import { useTranslation } from "@/hooks/use-translation";

export default function CalendarConnection() {
  const { status, loading, connecting, error, connect, disconnect } = useCalendarConnection();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {t("settings.calendar")}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t("settings.calendar.description")}
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <span className="text-sm font-medium flex-1">
          {!loading && status.connected ? t("settings.calendar.connected") : t("settings.calendar.connect")}
        </span>
        {status.connected ? (
          <Button variant="outline" size="sm" onClick={disconnect} disabled={loading}>
            {t("settings.calendar.disconnect")}
          </Button>
        ) : (
          <Button size="sm" onClick={connect} disabled={loading || connecting}>
            {connecting ? t("settings.calendar.connecting") : t("settings.calendar.connect")}
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
