import { getSettings, getActivePartners } from "@/lib/queries"
import { SiteHeader } from "@/components/storefront/site-header"
import { SiteFooter } from "@/components/storefront/site-footer"
import { FunPanel } from "@/components/storefront/fun-panel"
import { PartnersGrid } from "@/components/storefront/partners-grid"
import { CartProvider } from "@/components/storefront/cart-provider"
import { CartSheet } from "@/components/storefront/cart-sheet"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Partner Butcheries — Estate Butchery",
  description:
    "Browse partner butcheries across Kenya serving fresh meat and merchandise in your area.",
}

export default async function PartnersPage() {
  const [settings, partners] = await Promise.all([getSettings(), getActivePartners()])

  return (
    <CartProvider>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader settings={settings} />
        <main className="flex-1">
          <section className="border-b bg-card">
            <div className="mx-auto w-full max-w-6xl px-4 py-12">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Our network
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide sm:text-4xl">
                Partner Butcheries
              </h1>
              <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
                We partner with trusted butcheries across Kenya so you can always find fresh meat
                and quality service near you. If we&apos;re closed or out of stock, visit one of our
                partners below.
              </p>
            </div>
          </section>
          <PartnersGrid partners={partners} />
        </main>
        <SiteFooter settings={settings} />
        <FunPanel />
        <CartSheet settings={settings} />
      </div>
    </CartProvider>
  )
}
