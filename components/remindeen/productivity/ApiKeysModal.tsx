import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ConfirmDeletePanel from "@/components/ui/confirm-delete-panel";
import { useTranslation } from "@/hooks/use-translation";
import { useApiKeys, type GeneratedApiKey } from "@/hooks/use-api-keys";

interface ApiKeysModalProps {
  onClose: () => void;
}

function ApiKeysModal({ onClose }: ApiKeysModalProps) {
  const { t } = useTranslation();
  const { keys, loading, error, generateKey, revokeKey } = useApiKeys();
  const [label, setLabel] = useState("");
  const [generating, setGenerating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<GeneratedApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRevokeKey, setConfirmRevokeKey] = useState<{ id: number; label: string } | null>(null);

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    setGenerating(true);
    try {
      const created = await generateKey(label.trim() || undefined);
      setRevealedKey(created);
      setLabel("");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!revealedKey) return;
    await navigator.clipboard.writeText(revealedKey.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = (id: number, keyLabel: string | null) => {
    const name = keyLabel || t("mcp.keys.unlabeled");
    setConfirmRevokeKey({ id, label: name });
  };

  const handleDoneRevealing = () => {
    setRevealedKey(null);
    setCopied(false);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-2xl bg-zinc-900/70 p-5 text-white ring-1 ring-white/15 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-white/90">
          <KeyRound className="h-4 w-4" />
          {t("mcp.keys.title")}
        </h2>

        {confirmRevokeKey ? (
          <ConfirmDeletePanel
            message={t("mcp.keys.revoke_confirm").replace("{label}", confirmRevokeKey.label)}
            onConfirm={async () => {
              await revokeKey(confirmRevokeKey.id);
              setConfirmRevokeKey(null);
            }}
            onCancel={() => setConfirmRevokeKey(null)}
          />
        ) : revealedKey ? (
          <div className="space-y-4">
            <p className="text-xs text-amber-300/90">{t("mcp.keys.reveal_warning")}</p>
            <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 p-2">
              <code className="flex-1 overflow-x-auto whitespace-nowrap text-xs text-white/90 glass-scrollbar">
                {revealedKey.token}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer shrink-0 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button type="button" className="cursor-pointer active:scale-[0.98]" onClick={handleDoneRevealing}>
                {t("mcp.keys.done")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handleGenerate} className="space-y-1.5">
              <Label htmlFor="mcp-key-label" className="text-white/70">
                {t("mcp.keys.label_input")}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="mcp-key-label"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder={t("mcp.keys.label_placeholder")}
                  className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
                />
                <Button
                  type="submit"
                  disabled={generating}
                  className="cursor-pointer shrink-0 active:scale-[0.98]"
                >
                  {t("mcp.keys.generate")}
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              {loading && <p className="text-xs text-white/50">{t("mcp.keys.loading")}</p>}
              {error && <p className="text-xs text-red-400">{t("mcp.keys.load_error")}</p>}
              {!loading && !error && keys.length === 0 && (
                <p className="text-xs text-white/50">{t("mcp.keys.empty")}</p>
              )}
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-white/90">
                      {key.label || t("mcp.keys.unlabeled")}
                    </p>
                    <p className="text-[11px] text-white/50">
                      {t("mcp.keys.created")}: {new Date(key.createdAt).toLocaleDateString()}
                      {" · "}
                      {t("mcp.keys.last_used")}:{" "}
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : t("mcp.keys.never")}
                    </p>
                    <p className="text-[11px] text-white/50">
                      {t("mcp.keys.expires")}: {new Date(key.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer shrink-0 text-white/60 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => handleRevoke(key.id, key.label)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer text-white/70 hover:bg-white/10 hover:text-white"
                onClick={onClose}
              >
                {t("mcp.keys.close")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default ApiKeysModal;
