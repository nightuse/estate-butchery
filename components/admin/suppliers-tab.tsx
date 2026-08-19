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
import {
  createSupplierOrder,
  deleteSupplierOrder,
  updateSupplierStatus,
} from "@/app/actions/admin"
import type { SupplierOrder } from "@/lib/types"

const STATUSES = ["expected", "received", "cancelled"]

export function SuppliersTab({ suppliers }: { suppliers: SupplierOrder[] }) {
  const [creating, setCreating] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Track meat supplies from your suppliers. Record orders, costs, and delivery status.
        </p>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Add supply
              </Button>
            }
          />
          <SupplierDialog onDone={() => setCreating(false)} key={creating ? "new" : "closed"} />
        </Dialog>
      </div>

      {suppliers.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No supply orders recorded yet.
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
  const [busy, setBusy] = useState(false)

  async function changeStatus(status: string) {
    setBusy(true)
    const res = await updateSupplierStatus(supplier.id, status)
    setBusy(false)
    if (res.ok) toast.success(`Supply marked ${status}`)
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-base font-bold">{supplier.supplierName}</span>
            <Badge variant={supplier.status === "received" ? "default" : supplier.status === "cancelled" ? "outline" : "secondary"}>
              {supplier.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm font-medium">{supplier.item}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {supplier.supplierPhone && (
              <a href={`tel:${supplier.supplierPhone}`} className="flex items-center gap-1 hover:text-foreground">
                <Phone className="h-3 w-3" /> {supplier.supplierPhone}
              </a>
            )}
            <span>Ordered {formatDateTime(supplier.createdAt)}</span>
            {supplier.expectedAt && <span>Expected {formatDateTime(supplier.expectedAt)}</span>}
          </div>
          {supplier.notes && (
            <p className="mt-2 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
              {supplier.notes}
            </p>
          )}
        </div>
        <div className="text-right">
          {supplier.totalCost && (
            <p className="font-display text-lg font-bold">{formatKES(Number(supplier.totalCost))}</p>
          )}
          {supplier.quantityKg && (
            <p className="text-xs text-muted-foreground">{supplier.quantityKg} kg</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
        <Select value={supplier.status} onValueChange={changeStatus}>
          <SelectTrigger className="h-8 w-36" disabled={busy}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={async () => {
            const res = await deleteSupplierOrder(supplier.id)
            if (res.ok) toast.success("Supply deleted")
          }}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
        {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
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
  const [status, setStatus] = useState("expected")
  const [expectedAt, setExpectedAt] = useState("")
  const [notes, setNotes] = useState("")
  const [busy, setBusy] = useState(false)

  const totalCost = quantityKg && unitCost
    ? (Number(quantityKg) * Number(unitCost)).toFixed(2)
    : ""

  async function submit() {
    if (!supplierName.trim() || !item.trim()) {
      toast.error("Supplier name and item are required")
      return
    }
    setBusy(true)
    const res = await createSupplierOrder({
      supplierName: supplierName.trim(),
      supplierPhone: supplierPhone.trim() || null,
      item: item.trim(),
      quantityKg: quantityKg || null,
      unitCost: unitCost || null,
      totalCost: totalCost || null,
      status,
      expectedAt: expectedAt || null,
      notes: notes.trim() || null,
    })
    setBusy(false)
    if (res.ok) {
      toast.success("Supply order recorded")
      onDone()
    }
  }

  return (
    <DialogContent className="max-h-[90svh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Truck className="h-4 w-4" /> Record supply order
        </DialogTitle>
        <DialogDescription>Track a meat purchase from a supplier.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <div className="grid gap-2">
          <Label htmlFor="sup-name">Supplier name</Label>
          <Input id="sup-name" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="e.g. Farmers Choice" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sup-phone">Supplier phone (optional)</Label>
          <Input id="sup-phone" value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)} placeholder="07XX XXX XXX" inputMode="tel" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sup-item">Item</Label>
          <Input id="sup-item" value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Beef carcass, 50kg" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="sup-qty">Quantity (kg)</Label>
            <Input id="sup-qty" value={quantityKg} onChange={(e) => setQuantityKg(e.target.value)} inputMode="decimal" placeholder="50" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sup-cost">Unit cost (KSh/kg)</Label>
            <Input id="sup-cost" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} inputMode="decimal" placeholder="480" />
          </div>
        </div>
        {totalCost && (
          <p className="text-sm text-muted-foreground">
            Total cost: <span className="font-semibold text-foreground">{formatKES(Number(totalCost))}</span>
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
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
          <Label htmlFor="sup-notes">Notes (optional)</Label>
          <Textarea id="sup-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Delivery details, quality notes" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
        <Button onClick={submit} disabled={busy} className="gap-1.5">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Record supply
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
