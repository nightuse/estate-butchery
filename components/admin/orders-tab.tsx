"use client"

import { useMemo, useState } from "react"
import { Check, Loader as Loader2, Phone, Package, Network } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatKES, formatDateTime, statusLabel } from "@/lib/format"
import { confirmPayment, updateOrderStatus, getOrderItems, redirectOrderToPartner } from "@/app/actions/admin"
import type { Order, OrderItem, PartnerShop } from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUSES = ["pending", "preparing", "ready", "completed", "cancelled"]

export function OrdersTab({ orders, partners }: { orders: Order[]; partners: PartnerShop[] }) {
  const [filter, setFilter] = useState<"all" | "pending" | "pickup" | "unpaid">("all")

  const filtered = useMemo(() => {
    switch (filter) {
      case "pending":
        return orders.filter((o) => o.status === "pending")
      case "pickup":
        return orders.filter((o) => o.orderType === "pickup" && o.status !== "completed")
      case "unpaid":
        return orders.filter((o) => o.paymentStatus !== "paid")
      default:
        return orders
    }
  }, [filter, orders])

  const filters: { id: typeof filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "pickup", label: "Pickups" },
    { id: "unpaid", label: "Unpaid" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">No orders here.</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((o) => (
            <OrderRow key={o.id} order={o} partners={partners} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderRow({ order, partners }: { order: Order; partners: PartnerShop[] }) {
  const [busy, setBusy] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [itemsOpen, setItemsOpen] = useState(false)
  const [items, setItems] = useState<OrderItem[] | null>(null)
  const [redirectOpen, setRedirectOpen] = useState(false)

  async function changeStatus(status: string) {
    setBusy(true)
    const res = await updateOrderStatus(order.id, status)
    setBusy(false)
    if (res.ok) toast.success(`Order marked ${statusLabel(status).toLowerCase()}`)
  }

  async function loadItems() {
    setItemsOpen(true)
    if (!items) {
      const data = await getOrderItems(order.id)
      setItems(data)
    }
  }

  const paid = order.paymentStatus === "paid"

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-base font-bold">{order.customerName}</span>
            <span className="font-mono text-xs text-muted-foreground">{order.orderCode}</span>
            <Badge variant={order.orderType === "pickup" ? "secondary" : "default"}>
              {order.orderType === "pickup" ? "Pickup" : "Instant"}
            </Badge>
            <Badge variant={paid ? "default" : "outline"}>
              {paid ? "Paid" : "Unpaid"}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 hover:text-foreground">
              <Phone className="h-3 w-3" /> {order.customerPhone}
            </a>
            <span>Placed {formatDateTime(order.createdAt)}</span>
            {order.pickupAt && <span>Pickup {formatDateTime(order.pickupAt)}</span>}
          </div>
          {order.notes && (
            <p className="mt-2 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
              Note: {order.notes}
            </p>
          )}
          {paid && order.paymentRef && (
            <p className="mt-2 text-xs text-primary">
              Paid via {order.paymentMethod} · Ref {order.paymentRef} · {order.paidTo} ·{" "}
              {formatDateTime(order.paymentConfirmedAt)}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold">{formatKES(Number(order.total))}</p>
          <button onClick={loadItems} className="text-xs text-primary hover:underline">
            View items
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
        <Select value={order.status} onValueChange={changeStatus}>
          <SelectTrigger className="h-8 w-40" disabled={busy}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!paid && (
          <Button size="sm" onClick={() => setPayOpen(true)} className="gap-1.5">
            <Check className="h-3.5 w-3.5" /> Confirm payment
          </Button>
        )}
        {partners.length > 0 && order.status !== "redirected" && (
          <Button size="sm" variant="outline" onClick={() => setRedirectOpen(true)} className="gap-1.5">
            <Network className="h-3.5 w-3.5" /> Redirect to partner
          </Button>
        )}
        {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <ConfirmPaymentDialog
        order={order}
        open={payOpen}
        onOpenChange={setPayOpen}
      />

      <RedirectDialog
        order={order}
        partners={partners}
        open={redirectOpen}
        onOpenChange={setRedirectOpen}
      />

      <Dialog open={itemsOpen} onOpenChange={setItemsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" /> {order.orderCode}
            </DialogTitle>
            <DialogDescription>Items in this order</DialogDescription>
          </DialogHeader>
          {!items ? (
            <div className="py-6 text-center">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((it) => (
                <li key={it.id} className="flex justify-between py-2 text-sm">
                  <span>
                    {it.productName}{" "}
                    <span className="text-muted-foreground">
                      × {Number(it.quantity)} {it.unit}
                    </span>
                  </span>
                  <span className="font-medium">{formatKES(Number(it.lineTotal))}</span>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function ConfirmPaymentDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [method, setMethod] = useState("M-Pesa Till")
  const [ref, setRef] = useState("")
  const [paidTo, setPaidTo] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!ref.trim()) {
      toast.error("Enter the M-Pesa confirmation code")
      return
    }
    setBusy(true)
    const res = await confirmPayment(order.id, {
      paymentMethod: method,
      paymentRef: ref.trim().toUpperCase(),
      paidTo: paidTo.trim(),
    })
    setBusy(false)
    if (res.ok) {
      toast.success("Payment confirmed")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm payment received</DialogTitle>
          <DialogDescription>
            Record the M-Pesa payment for {order.orderCode} ({formatKES(Number(order.total))}).
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label>Payment method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M-Pesa Till">M-Pesa Till (Buy Goods)</SelectItem>
                <SelectItem value="M-Pesa Paybill">M-Pesa Paybill</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pay-ref">M-Pesa code / reference</Label>
            <Input
              id="pay-ref"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="e.g. SLK7XY2ABC"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="paid-to">Received on (Till / Paybill no.)</Label>
            <Input
              id="paid-to"
              value={paidTo}
              onChange={(e) => setPaidTo(e.target.value)}
              placeholder="e.g. Till 5678901"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy} className="gap-1.5">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RedirectDialog({
  order,
  partners,
  open,
  onOpenChange,
}: {
  order: Order
  partners: PartnerShop[]
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [partnerId, setPartnerId] = useState("")
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!partnerId) {
      toast.error("Select a partner butchery")
      return
    }
    setBusy(true)
    const res = await redirectOrderToPartner(order.id, Number(partnerId), reason.trim() || undefined)
    setBusy(false)
    if (res.ok) {
      toast.success("Order redirected to partner")
      onOpenChange(false)
    } else {
      toast.error(res.error || "Failed to redirect")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-4 w-4" /> Redirect order to partner
          </DialogTitle>
          <DialogDescription>
            Send {order.orderCode} ({order.customerName}) to a partner butchery for fulfilment.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label>Partner butchery</Label>
            <Select value={partnerId} onValueChange={setPartnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a partner..." />
              </SelectTrigger>
              <SelectContent>
                {partners.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}{p.location ? ` — ${p.location}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="redirect-reason">Reason (optional)</Label>
            <Input
              id="redirect-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Out of stock, customer closer to partner"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy} className="gap-1.5">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Network className="h-4 w-4" />}
            Redirect order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
