import { getSettings, getActivePartners } from "@/lib/queries"
import { SiteHeader } from "@/components/storefront/site-header"
import { SiteFooter } from "@/components/storefront/site-footer"
import { PartnersGrid } from "@/components/storefront/partners-grid"

export const dynamic = "force-dynamic"

export default async function PartnersPage() {
  const [settings, partners] = await Promise.all([
    getSettings(),
    getActivePartners(),
  ])

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <PartnersGrid partners={partners} settings={settings} />
      </main>
      <SiteFooter settings={settings} />
    </div>
  )
}
