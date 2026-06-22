import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

interface SignInPromptProps {
  signingIn: boolean;
  error: string | null;
  onSignIn: () => void;
}

function SignInPrompt({ signingIn, error, onSignIn }: SignInPromptProps) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex w-full max-w-[340px] flex-col items-center gap-4 rounded-3xl bg-white/10 px-8 py-10 text-center ring-1 ring-white/15 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
          <LogIn className="h-5 w-5 text-white/70" strokeWidth={1.5} />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-sm font-semibold text-white/90">{t("auth.sign_in_prompt_title")}</h2>
          <p className="max-w-[260px] text-sm text-white/60">
            {t("auth.sign_in_prompt_description")}
          </p>
        </div>
        <Button
          type="button"
          onClick={onSignIn}
          disabled={signingIn}
          className="cursor-pointer active:scale-[0.98]"
        >
          {signingIn ? t("auth.signing_in") : t("auth.sign_in_with_google")}
        </Button>
        {error && <p className="text-xs text-red-400">{t("auth.sign_in_failed")}</p>}
      </div>
    </div>
  );
}

export default SignInPrompt;
