import { getSettings, getCategories, getProducts } from "@/lib/queries"
import { CartProvider } from "@/components/storefront/cart-provider"
import { SiteHeader } from "@/components/storefront/site-header"
import { Hero } from "@/components/storefront/hero"
import { Announcement } from "@/components/storefront/announcement"
import { Catalog } from "@/components/storefront/catalog"
import { PaymentSection } from "@/components/storefront/payment-section"
import { ContactSection } from "@/components/storefront/contact-section"
import { SiteFooter } from "@/components/storefront/site-footer"
import { FunPanel } from "@/components/storefront/fun-panel"
import { CartSheet } from "@/components/storefront/cart-sheet"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [settings, categories, products] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts(),
  ])

  return (
    <CartProvider>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader settings={settings} />
        <main className="flex-1">
          <Hero settings={settings} />
          <Announcement settings={settings} />
          <Catalog categories={categories} products={products} />
          <PaymentSection settings={settings} />
          <ContactSection settings={settings} />
        </main>
        <SiteFooter settings={settings} />
        <FunPanel />
        <CartSheet settings={settings} />
      </div>
    </CartProvider>
  )
}
