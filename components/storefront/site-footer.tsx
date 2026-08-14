import Link from "next/link"
import { MapPin, Clock, Phone } from "lucide-react"
import type { ShopSettings } from "@/lib/queries"

export function SiteFooter({ settings }: { settings: ShopSettings }) {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold uppercase tracking-wide text-primary">
            {settings.shopName}
          </p>
          <p className="mt-2 max-w-xs text-pretty text-sm text-muted-foreground">
            {settings.tagline}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>Serving {settings.locationAreas}</span>
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            <span>{settings.openingHours}</span>
          </p>
          {settings.phone ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <a href={`tel:${settings.phone}`} className="hover:text-foreground">
                {settings.phone}
              </a>
            </p>
          ) : null}
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium text-foreground">Quick links</p>
          <nav className="flex flex-col gap-1.5 text-muted-foreground">
            <Link href="#catalog" className="w-fit hover:text-foreground">
              Browse meat
            </Link>
            <Link href="#pay" className="w-fit hover:text-foreground">
              Payment details
            </Link>
            <Link href="#contact" className="w-fit hover:text-foreground">
              Contact us
            </Link>
            <Link href="/admin" className="w-fit hover:text-foreground">
              Staff login
            </Link>
          </nav>
        </div>
      </div>
      <div className="border-t py-4">
        <p className="text-center text-xs text-muted-foreground">
          {"\u00A9"} {new Date().getFullYear()} {settings.shopName}. Fresh from our block to your table.
        </p>
      </div>
    </footer>
  )
}
