"use client"

import { useState } from "react"
import { Loader2, MessageCircle, Phone, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { sendMessage } from "@/app/actions/public"
import type { ShopSettings } from "@/lib/queries"

export function ContactSection({ settings }: { settings: ShopSettings }) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const waNumber = settings.whatsapp?.replace(/\D/g, "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await sendMessage({ customerName: name, customerPhone: phone, body })
    setSubmitting(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success("Message sent! We'll get back to you shortly.")
    setName("")
    setPhone("")
    setBody("")
  }

  return (
    <section id="contact" className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Talk to us
          </p>
          <h2 className="mt-2 text-balance font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Questions? We&apos;re here
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Ask about cuts, confirm your order, or request something special. Reach us on WhatsApp for
            the fastest reply, or drop a message and we&apos;ll respond soon.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {waNumber && (
              <Button asChild size="lg" className="w-full justify-start gap-3 sm:w-auto">
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                    `Hi ${settings.shopName}, I have a question.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </a>
              </Button>
            )}
            {settings.phone && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full justify-start gap-3 bg-transparent sm:w-auto"
              >
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>
                  <Phone className="h-5 w-5" />
                  {settings.phone}
                </a>
              </Button>
            )}
          </div>
        </div>

        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold uppercase tracking-wide">
            Send a message
          </h3>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-phone">Phone (optional)</Label>
              <Input
                id="c-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="07XX XXX XXX"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-body">Message</Label>
              <Textarea
                id="c-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                required
                placeholder="How can we help?"
              />
            </div>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send message
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  )
}
