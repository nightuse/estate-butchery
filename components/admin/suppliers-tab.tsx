"use client"

import { useState } from "react"
import { Plus, Trash2, Loader as Loader2, Truck, Phone } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatKES, formatDateTime } from "@/lib/format"
import { createSupplierOrder, updateSupplierStatus, deleteSupplierOrder } from "@/app/actions/admin"
import type { SupplierOrder } from "@/lib/types"

const SUPPLY_STATUSES = ["expected", "received", "cancelled"]

export function SuppliersTab({ suppliers }: { suppliers: SupplierOrder[] }) {
  const [creating, setCreating] = useState(false)

  const expected = suppliers.filter((s) => s.status === "expected")
  const received = suppliers.filter((s) => s.status === "received")
  const totalCost = received.reduce((s, x) => s + Number(x.totalCost || 0), 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Track supply orders from your suppliers. {expected.length} expected, {received.length} received this period.
        </p>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Add supply order
              </Button>
            }
          />
          <SupplierDialog onDone={() => setCreating(false)} key={creating ? "new" : "closed"} />
        </Dialog>
      </div>

      {received.length > 0 && (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total received supply cost</p>
          <p className="font-display text-2xl font-bold text-primary">{formatKES(totalCost)}</p>
        </Card>
      )}

      {suppliers.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No supply orders yet. Add one when you need to restock.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {suppliers.map((s) => (
            <SupplierRow key={s.id} supplier={s} />
          ))}
        </div>
      )}
    </div>
  )
}

function SupplierRow({ supplier }: { supplier: SupplierOrder }) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 font-display text-base font-bold">
              <Truck className="h-4 w-4 text-primary" /> {supplier.supplierName}
            </span>
            <Badge variant={supplier.status === "received" ? "default" : supplier.status === "cancelled" ? "outline" : "secondary"}>
              {supplier.status}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{supplier.item} · {supplier.quantityKg ? `${supplier.quantityKg} kg` : "—"}</span>
            {supplier.supplierPhone && (
              <a href={`tel:${supplier.supplierPhone}`} className="flex items-center gap-1 hover:text-foreground">
                <Phone className="h-3 w-3" /> {supplier.supplierPhone}
              </a>
            )}
            <span>Added {formatDateTime(supplier.createdAt)}</span>
            {supplier.expectedAt && <span>Expected {formatDateTime(supplier.expectedAt)}</span>}
          </div>
          {supplier.notes && (
            <p className="mt-2 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
              {supplier.notes}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {supplier.totalCost && (
            <span className="font-display text-sm font-bold">{formatKES(Number(supplier.totalCost))}</span>
          )}
          <Select
            value={supplier.status}
            onValueChange={async (v) => {
              const res = await updateSupplierStatus(supplier.id, v)
              if (res.ok) toast.success(`Marked ${v}`)
            }}
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPLY_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={async () => {
              const res = await deleteSupplierOrder(supplier.id)
              if (res.ok) toast.success("Supply order deleted")
            }}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function SupplierDialog({ onDone }: { onDone: () => void }) {
  const [supplierName, setSupplierName] = useState("")
  const [supplierPhone, setSupplierPhone] = useState("")
  const [item, setItem] = useState("")
  const [quantityKg, setQuantityKg] = useState("")
  const [unitCost, setUnitCost] = useState("")
  const [totalCost, setTotalCost] = useState("")
  const [status, setStatus] = useState("expected")
  const [expectedAt, setExpectedAt] = useState("")
  const [notes, setNotes] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!supplierName.trim()) {
      toast.error("Enter supplier name")
      return
    }
    if (!item.trim()) {
      toast.error("Enter what you're ordering")
      return
    }
    setBusy(true)
    const res = await createSupplierOrder({
      supplierName: supplierName.trim(),
      supplierPhone: supplierPhone || null,
      item: item.trim(),
      quantityKg: quantityKg || null,
      unitCost: unitCost || null,
      totalCost: totalCost || null,
      status,
      expectedAt: expectedAt || null,
      notes: notes || null,
    })
    setBusy(false)
    if (res.ok) {
      toast.success("Supply order added")
      onDone()
    }
  }

  return (
    <DialogContent className="max-h-[90svh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Truck className="h-4 w-4" /> Add supply order
        </DialogTitle>
        <DialogDescription>
          Record an order to a supplier when stock is running low.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <div className="grid gap-2">
          <Label htmlFor="sup-name">Supplier name</Label>
          <Input id="sup-name" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="e.g. Farmer Joe" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sup-phone">Supplier phone</Label>
          <Input id="sup-phone" value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)} placeholder="07XX XXX XXX" inputMode="tel" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sup-item">Item / product</Label>
          <Input id="sup-item" value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Beef (mixed cuts)" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="sup-qty">Quantity (kg)</Label>
            <Input id="sup-qty" value={quantityKg} onChange={(e) => setQuantityKg(e.target.value)} inputMode="decimal" placeholder="50" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sup-unit">Unit cost (KSh)</Label>
            <Input id="sup-unit" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} inputMode="decimal" placeholder="500" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sup-total">Total cost (KSh)</Label>
            <Input id="sup-total" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} inputMode="decimal" placeholder="25000" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPLY_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sup-expected">Expected date</Label>
            <Input id="sup-expected" type="date" value={expectedAt} onChange={(e) => setExpectedAt(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sup-notes">Notes</Label>
          <Textarea id="sup-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Delivery instructions, etc." />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
        <Button onClick={submit} disabled={busy} className="gap-1.5">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Add supply order
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
