import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

interface ConfirmDeletePanelProps {
  message: string;
  detail?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  /** Override for contexts that aren't the always-dark glass modals (e.g. theme-adaptive widgets). */
  messageClassName?: string;
  detailClassName?: string;
  cancelClassName?: string;
}

function ConfirmDeletePanel({
  message,
  detail,
  confirmLabel,
  onConfirm,
  onCancel,
  messageClassName,
  detailClassName,
  cancelClassName,
}: ConfirmDeletePanelProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className={messageClassName ?? "text-sm font-medium text-white/90"}>{message}</p>
        {detail && <p className={detailClassName ?? "text-xs text-white/50"}>{detail}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          className={
            cancelClassName ?? "cursor-pointer text-white/70 active:scale-[0.98] hover:bg-white/10 hover:text-white"
          }
          onClick={onCancel}
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="cursor-pointer active:scale-[0.98]"
          onClick={onConfirm}
        >
          {confirmLabel ?? t("common.delete")}
        </Button>
      </div>
    </div>
  );
}

export default ConfirmDeletePanel;
