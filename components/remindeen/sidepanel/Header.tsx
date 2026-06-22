import { useTranslation } from "@/hooks/use-translation"

const Header = () => {
  const { t } = useTranslation()
  
  return (
    <div className="border-b px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-24 rounded-lg bg-primary flex items-center justify-center">
          <img src="/icon/logo.png" className="cursor-pointer rounded-md hover:drop-shadow-[0_0_2em_#3c9934e0] transition duration-300 ease-in-out" loading="lazy" />
        </div>
        <div>
          <h1 className="font-semibold text-lg">Remindeen</h1>
          <p className="text-sm text-muted-foreground">{t('header.description')}</p>
        </div>
      </div>
    </div>
  )
}

export default Header
