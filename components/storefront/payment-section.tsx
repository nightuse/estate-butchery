"use client"

import { useState } from "react"
import { Check, Copy, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import type { ShopSettings } from "@/lib/queries"

export function PaymentSection({ settings }: { settings: ShopSettings }) {
  const [copied, setCopied] = useState<string | null>(null)

  function copy(label: string, value: string) {
    navigator.clipboard.writeText(value)
    setCopied(label)
    toast.success(`${label} copied`)
    setTimeout(() => setCopied(null), 1500)
  }

  const hasTill = !!settings.tillNumber
  const hasPaybill = !!settings.paybillNumber
  const hasPochi = !!settings.lipaNaPochi
  if (!hasTill && !hasPaybill && !hasPochi) return null

  return (
    <section id="pay" className="border-y bg-secondary/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-6 flex items-center gap-3">
          <Smartphone className="h-6 w-6 text-primary" />
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">
              Lipa na M-Pesa
            </h2>
            <p className="text-sm text-muted-foreground">
              Pay quickly and securely. Tap any number to copy it.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {hasTill && (
            <Card className="p-6">
              <p className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Buy Goods (Till)
              </p>
              <button
                type="button"
                onClick={() => copy("Till number", settings.tillNumber!)}
                className="mt-2 flex items-center gap-3"
              >
                <span className="font-display text-4xl font-bold tracking-wider text-primary">
                  {settings.tillNumber}
                </span>
                {copied === "Till number" ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : (
                  <Copy className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <p className="mt-2 text-sm text-muted-foreground">
                M-Pesa → Lipa na M-Pesa → Buy Goods and Services
              </p>
            </Card>
          )}

          {hasPaybill && (
            <Card className="p-6">
              <p className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Paybill
              </p>
              <button
                type="button"
                onClick={() => copy("Paybill number", settings.paybillNumber!)}
                className="mt-2 flex items-center gap-3"
              >
                <span className="font-display text-4xl font-bold tracking-wider text-primary">
                  {settings.paybillNumber}
                </span>
                {copied === "Paybill number" ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : (
                  <Copy className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              {settings.paybillAccount && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Account: <span className="font-semibold text-foreground">{settings.paybillAccount}</span>
                </p>
              )}
            </Card>
          )}

          {hasPochi && (
            <Card className="p-6">
              <p className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Lipa na Pochi / Send Money
              </p>
              <button
                type="button"
                onClick={() => copy("Pochi number", settings.lipaNaPochi!)}
                className="mt-2 flex items-center gap-3"
              >
                <span className="font-display text-3xl font-bold tracking-wider text-primary">
                  {settings.lipaNaPochi}
                </span>
                {copied === "Pochi number" ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : (
                  <Copy className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <p className="mt-2 text-sm text-muted-foreground">
                M-Pesa → Send Money → Enter phone number
              </p>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
