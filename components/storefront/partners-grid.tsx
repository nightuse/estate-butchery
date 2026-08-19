import { MapPin, Phone, ExternalLink, MessageCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PartnerShop } from "@/lib/types"

export function PartnersGrid({ partners }: { partners: PartnerShop[] }) {
  if (partners.length === 0) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <Card className="p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No partner butcheries listed yet. Check back soon as we grow our network.
          </p>
        </Card>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((p) => {
          const href = p.domain
            ? p.domain.startsWith("http")
              ? p.domain
              : `https://${p.domain}`
            : null

          return (
            <Card key={p.id} className="flex flex-col gap-3 p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                    {p.name}
                  </h2>
                  {p.tagline && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{p.tagline}</p>
                  )}
                </div>
                {p.logoImage ? (
                  <img
                    src={p.logoImage}
                    alt={p.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {p.location && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" /> {p.location}
                </p>
              )}

              {(p.tillNumber || p.paybillNumber) && (
                <div className="flex flex-wrap gap-2">
                  {p.tillNumber && (
                    <Badge variant="secondary">Till {p.tillNumber}</Badge>
                  )}
                  {p.paybillNumber && (
                    <Badge variant="secondary">Paybill {p.paybillNumber}</Badge>
                  )}
                </div>
              )}

              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                {p.phone && (
                  <a
                    href={`tel:${p.phone}`}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" /> Call
                  </a>
                )}
                {p.whatsapp && (
                  <a
                    href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> Visit site
                  </a>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
