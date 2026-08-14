import Image from "next/image"
import { MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ShopSettings } from "@/lib/queries"

export function Hero({ settings }: { settings: ShopSettings }) {
  const areas = settings.locationAreas?.split(",").map((a) => a.trim()) ?? []

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={settings.heroImage || "/images/hero-butchery.png"}
          alt="Fresh meat at Estate Butchery counter"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
        <div className="max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {settings.isOpen ? "We are open — fresh stock in!" : "Currently closed — see hours below"}
          </div>

          <h1 className="text-balance font-display text-4xl font-bold uppercase leading-[1.05] tracking-wide md:text-6xl">
            {settings.shopName}
          </h1>
          <p className="mt-4 max-w-md text-pretty text-lg text-muted-foreground">
            {settings.tagline || "Fresh meat, fair prices, your neighborhood butchery."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button render={<a href="#shop" />} size="lg">
              Browse the counter
            </Button>
            <Button
              render={<a href="#pay" />}
              size="lg"
              variant="outline"
              className="bg-card/60 backdrop-blur"
            >
              See payment details
            </Button>
          </div>

          <div className="mt-8 flex flex-col gap-2 text-sm">
            {areas.length > 0 && (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">
                  Serving <span className="font-medium text-foreground">{areas.join(" · ")}</span>
                </span>
              </p>
            )}
            {settings.openingHours && (
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{settings.openingHours}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
