import { Megaphone, Sparkles } from "lucide-react"
import type { ShopSettings } from "@/lib/queries"

export function Announcement({ settings }: { settings: ShopSettings }) {
  if (!settings.dailyUpdate && !settings.news) return null

  return (
    <div className="border-b bg-primary text-primary-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:gap-6">
        {settings.dailyUpdate && (
          <p className="flex items-start gap-2 text-sm">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <span className="font-semibold">Today: </span>
              {settings.dailyUpdate}
            </span>
          </p>
        )}
        {settings.news && (
          <p className="flex items-start gap-2 text-sm md:ml-auto">
            <Megaphone className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{settings.news}</span>
          </p>
        )}
      </div>
    </div>
  )
}
