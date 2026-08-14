"use client"

import { useState } from "react"
import { Check, Copy, Loader2, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatKES } from "@/lib/format"
import { placeOrder } from "@/app/actions/public"
import type { ShopSettings } from "@/lib/queries"
import { useCart } from "./cart-provider"
import { cn } from "@/lib/utils"

type Step = "cart" | "details" | "success"

export function CartSheet({ settings }: { settings: ShopSettings }) {
  const { lines, total, open, setOpen, updateQuantity, removeLine, clear } = useCart()
  const [step, setStep] = useState<Step>("cart")
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [orderType, setOrderType] = useState<"pickup" | "instant">("pickup")
  const [pickupAt, setPickupAt] = useState("")
  const [notes, setNotes] = useState("")
  const [result, setResult] = useState<{ orderCode: string; total: number; orderType: string } | null>(
    null,
  )

  function resetAndClose() {
    setOpen(false)
    setTimeout(() => {
      setStep("cart")
      setResult(null)
      setName("")
      setPhone("")
      setPickupAt("")
      setNotes("")
      setOrderType("pickup")
    }, 250)
  }

  async function handleSubmit() {
    setSubmitting(true)
    const res = await placeOrder({
      customerName: name,
      customerPhone: phone,
      orderType,
      pickupAt: orderType === "pickup" && pickupAt ? pickupAt : null,
      notes,
      items: lines.map((l) => ({ productId: l.productId, mode: l.mode, quantity: l.quantity })),
    })
    setSubmitting(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    setResult({ orderCode: res.orderCode, total: res.total, orderType: res.orderType })
    setStep("success")
    clear()
  }

  const step2Label = orderType === "pickup" ? "pay on pickup" : "pay now via M-Pesa"

  return (
    <Sheet open={open} onOpenChange={(v) => (v ? setOpen(true) : resetAndClose())}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="font-display uppercase tracking-wide">
            {step === "success" ? "Order Received!" : "Your Basket"}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review your items and place your order.
          </SheetDescription>
        </SheetHeader>

        {/* CART STEP */}
        {step === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                  <ShoppingBasket className="h-12 w-12" />
                  <p>Your basket is empty.</p>
                  <p className="text-sm">Add some fresh cuts from the counter.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {lines.map((l) => (
                    <li key={l.key} className="flex gap-3 rounded-lg border p-2">
                      <div className="flex-1">
                        <p className="font-medium leading-tight">{l.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatKES(l.unitPrice)} / {l.unit}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center rounded-md border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-r-none"
                              onClick={() =>
                                updateQuantity(
                                  l.key,
                                  Math.round((l.quantity - (l.unit.includes("kg") ? 0.5 : 1)) * 100) / 100,
                                )
                              }
                              aria-label="Decrease"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center text-xs tabular-nums">
                              {l.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-l-none"
                              onClick={() =>
                                updateQuantity(
                                  l.key,
                                  Math.round((l.quantity + (l.unit.includes("kg") ? 0.5 : 1)) * 100) / 100,
                                )
                              }
                              aria-label="Increase"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-semibold">
                            {formatKES(l.unitPrice * l.quantity)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => removeLine(l.key)}
                        aria-label={`Remove ${l.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {lines.length > 0 && (
              <SheetFooter className="border-t">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl font-bold">{formatKES(total)}</span>
                </div>
                <Button size="lg" className="w-full" onClick={() => setStep("details")}>
                  Continue to Checkout
                </Button>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  Final weight confirmed at the shop. Prices may vary slightly by cut.
                </p>
              </SheetFooter>
            )}
          </>
        )}

        {/* DETAILS STEP */}
        {step === "details" && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cust-name">Your name</Label>
                  <Input
                    id="cust-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Wanjiru"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cust-phone">Phone number</Label>
                  <Input
                    id="cust-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XX XXX XXX"
                    inputMode="tel"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>How would you like to order?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType("pickup")}
                      className={cn(
                        "rounded-lg border p-3 text-left text-sm transition-colors",
                        orderType === "pickup"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className="font-semibold">Book pickup</span>
                      <span className="block text-xs text-muted-foreground">
                        Reserve now, pay when you collect
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType("instant")}
                      className={cn(
                        "rounded-lg border p-3 text-left text-sm transition-colors",
                        orderType === "instant"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className="font-semibold">Order &amp; pay now</span>
                      <span className="block text-xs text-muted-foreground">
                        Pay via M-Pesa Till/Paybill
                      </span>
                    </button>
                  </div>
                </div>

                {orderType === "pickup" && (
                  <div className="grid gap-2">
                    <Label htmlFor="pickup-at">Pickup date &amp; time (optional)</Label>
                    <Input
                      id="pickup-at"
                      type="datetime-local"
                      value={pickupAt}
                      onChange={(e) => setPickupAt(e.target.value)}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Cut into small pieces, remove excess fat"
                    rows={2}
                  />
                </div>

                <div className="rounded-lg bg-muted p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Estimated total</span>
                    <span className="font-display text-lg font-bold">{formatKES(total)}</span>
                  </div>
                </div>
              </div>
            </div>
            <SheetFooter className="border-t">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("cart")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Placing...
                    </>
                  ) : (
                    <>Place order &amp; {step2Label}</>
                  )}
                </Button>
              </div>
            </SheetFooter>
          </>
        )}

        {/* SUCCESS STEP */}
        {step === "success" && result && (
          <SuccessView result={result} settings={settings} onClose={resetAndClose} />
        )}
      </SheetContent>
    </Sheet>
  )
}

function SuccessView({
  result,
  settings,
  onClose,
}: {
  result: { orderCode: string; total: number; orderType: string }
  settings: ShopSettings
  onClose: () => void
}) {
  const [copied, setCopied] = useState<string | null>(null)

  function copy(label: string, value: string) {
    navigator.clipboard.writeText(value)
    setCopied(label)
    toast.success(`${label} copied`)
    setTimeout(() => setCopied(null), 1500)
  }

  const waNumber = settings.whatsapp?.replace(/\D/g, "")
  const waText = encodeURIComponent(
    `Hi ${settings.shopName}, I just placed order ${result.orderCode} (${formatKES(result.total)}).`,
  )

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="h-7 w-7" />
        </div>
        <h3 className="font-display text-xl font-bold uppercase tracking-wide">Asante sana!</h3>
        <p className="text-sm text-muted-foreground">
          Your order has been received. Show this code at the shop.
        </p>
        <div className="mt-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 px-6 py-3">
          <p className="font-display text-2xl font-bold tracking-widest text-primary">
            {result.orderCode}
          </p>
        </div>
        <p className="mt-1 text-sm">
          Total: <span className="font-semibold">{formatKES(result.total)}</span>
        </p>
      </div>

      {result.orderType === "instant" && (
        <div className="mt-6 rounded-lg border bg-card p-4">
          <p className="mb-3 font-display text-sm font-semibold uppercase tracking-wide">
            Pay with M-Pesa
          </p>
          <div className="flex flex-col gap-2 text-sm">
            {settings.tillNumber && (
              <PayRow
                label="Buy Goods Till"
                value={settings.tillNumber}
                copied={copied === "Till"}
                onCopy={() => copy("Till", settings.tillNumber!)}
              />
            )}
            {settings.paybillNumber && (
              <>
                <PayRow
                  label="Paybill"
                  value={settings.paybillNumber}
                  copied={copied === "Paybill"}
                  onCopy={() => copy("Paybill", settings.paybillNumber!)}
                />
                {settings.paybillAccount && (
                  <PayRow
                    label="Account"
                    value={settings.paybillAccount}
                    copied={copied === "Account"}
                    onCopy={() => copy("Account", settings.paybillAccount!)}
                  />
                )}
              </>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            After paying, keep your M-Pesa message. We&apos;ll confirm receipt and prepare your order.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {waNumber && (
          <Button asChild variant="outline" className="w-full bg-transparent">
            <a
              href={`https://wa.me/${waNumber}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Send order on WhatsApp
            </a>
          </Button>
        )}
        <Button className="w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  )
}

function PayRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string
  value: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <button
        type="button"
        onClick={onCopy}
        className="flex items-center gap-2 font-display text-base font-bold tracking-wide"
      >
        {value}
        {copied ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
    </div>
  )
}
