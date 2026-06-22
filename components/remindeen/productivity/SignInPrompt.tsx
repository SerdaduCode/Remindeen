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
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
      <LogIn className="h-8 w-8 text-white/25" strokeWidth={1.5} />
      <div className="space-y-1.5">
        <h2 className="text-sm font-semibold text-white/90">{t("auth.sign_in_prompt_title")}</h2>
        <p className="max-w-[260px] text-sm text-white/50">{t("auth.sign_in_prompt_description")}</p>
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
  );
}

export default SignInPrompt;
