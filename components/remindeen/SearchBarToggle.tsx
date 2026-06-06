import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function SearchBarToggle() {
  const { system, updateSystem } = useSettings();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Search className="h-4 w-4" />
          {t("settings.searchbar")}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t("settings.searchbar.description")}
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <Label
          htmlFor="searchbar-toggle"
          className="text-sm font-medium cursor-pointer flex-1"
        >
          {t("settings.searchbar.toggle")}
        </Label>
        <Switch
          id="searchbar-toggle"
          checked={system.showSearchBar}
          onCheckedChange={(checked) =>
            updateSystem({ showSearchBar: checked })
          }
        />
      </div>
    </div>
  );
}
