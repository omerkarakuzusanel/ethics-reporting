"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/translation"

export default function LanguageToggle() {
  const { language, setLanguage } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <Button variant={language === "tr" ? "default" : "outline"} size="sm" onClick={() => setLanguage("tr")}>
        TR
      </Button>
      <Button variant={language === "en" ? "default" : "outline"} size="sm" onClick={() => setLanguage("en")}>
        EN
      </Button>
    </div>
  )
}

