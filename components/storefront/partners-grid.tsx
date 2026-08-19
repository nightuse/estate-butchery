import { MapPin, Phone, ExternalLink, MessageCircle, Network } from "lucide-react"
import type { PartnerShop, ShopSettings } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PartnersGrid({
  partners,
  settings,
}: {
  partners: PartnerShop[]
  settings: ShopSettings
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-8 flex items-center gap-3">
        <Network className="h-8 w-8 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">
            Partner Butcheries
          </h1>
          <p className="text-sm text-muted-foreground">
            Other butcheries in the {settings.shopName} network. Find one near you.
          </p>
        </div>
      </div>

      {partners.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No partner butcheries listed yet. Check back soon!
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => (
            <Card key={p.id} className="flex flex-col p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold">{p.name}</h3>
                  {p.tagline && (
                    <p className="text-sm text-muted-foreground">{p.tagline}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                {p.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" /> {p.location}
                  </span>
                )}
                {p.phone && (
                  <a href={`tel:${p.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
                    <Phone className="h-4 w-4 shrink-0 text-primary" /> {p.phone}
                  </a>
                )}
              </div>

              {(p.tillNumber || p.paybillNumber) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tillNumber && <Badge variant="secondary">Till: {p.tillNumber}</Badge>}
                  {p.paybillNumber && <Badge variant="secondary">Paybill: {p.paybillNumber}</Badge>}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                {p.whatsapp && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    render={
                      <a
                        href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </Button>
                )}
                {p.domain && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5"
                    render={
                      <a
                        href={p.domain.startsWith("http") ? p.domain : `https://${p.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Visit site
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
