"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Loader as Loader2, Network, Phone, ExternalLink, MapPin } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createPartner, updatePartner, deletePartner } from "@/app/actions/admin"
import type { PartnerShop } from "@/lib/types"

export function PartnersTab({ partners }: { partners: PartnerShop[] }) {
  const [creating, setCreating] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage partner butcheries in your network. Active partners appear on your public Partners page.
        </p>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Add partner
              </Button>
            }
          />
          <PartnerDialog onDone={() => setCreating(false)} key={creating ? "new" : "closed"} />
        </Dialog>
      </div>

      {partners.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No partner butcheries yet. Add one to start building your network.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {partners.map((p) => (
            <PartnerRow key={p.id} partner={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function PartnerRow({ partner }: { partner: PartnerShop }) {
  const [editing, setEditing] = useState(false)

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-base font-bold">{partner.name}</span>
            <Badge variant={partner.isActive ? "default" : "outline"}>
              {partner.isActive ? "Active" : "Hidden"}
            </Badge>
          </div>
          {partner.tagline && <p className="mt-1 text-sm text-muted-foreground">{partner.tagline}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {partner.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {partner.location}
              </span>
            )}
            {partner.phone && (
              <a href={`tel:${partner.phone}`} className="flex items-center gap-1 hover:text-foreground">
                <Phone className="h-3 w-3" /> {partner.phone}
              </a>
            )}
            {partner.domain && (
              <a
                href={partner.domain.startsWith("http") ? partner.domain : `https://${partner.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" /> {partner.domain}
              </a>
            )}
          </div>
          {(partner.tillNumber || partner.paybillNumber) && (
            <div className="mt-2 text-xs text-muted-foreground">
              {partner.tillNumber && <span>Till: <span className="font-medium text-foreground">{partner.tillNumber}</span></span>}
              {partner.tillNumber && partner.paybillNumber && <span> · </span>}
              {partner.paybillNumber && <span>Paybill: <span className="font-medium text-foreground">{partner.paybillNumber}</span></span>}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Switch
            checked={partner.isActive}
            onCheckedChange={async (v) => {
              const res = await updatePartner(partner.id, {
                name: partner.name,
                tagline: partner.tagline,
                location: partner.location,
                phone: partner.phone,
                whatsapp: partner.whatsapp,
                tillNumber: partner.tillNumber,
                paybillNumber: partner.paybillNumber,
                paybillAccount: partner.paybillAccount,
                domain: partner.domain,
                isActive: v,
              })
              if (res.ok) toast.success(v ? "Partner activated" : "Partner hidden")
            }}
          />
          <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={async () => {
              const res = await deletePartner(partner.id)
              if (res.ok) toast.success("Partner removed")
            }}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <Dialog open={editing} onOpenChange={(v) => !v && setEditing(false)}>
        {editing && (
          <PartnerDialog
            partner={partner}
            onDone={() => setEditing(false)}
          />
        )}
      </Dialog>
    </Card>
  )
}

function PartnerDialog({
  partner,
  onDone,
}: {
  partner?: PartnerShop
  onDone: () => void
}) {
  const [name, setName] = useState(partner?.name ?? "")
  const [tagline, setTagline] = useState(partner?.tagline ?? "")
  const [location, setLocation] = useState(partner?.location ?? "")
  const [phone, setPhone] = useState(partner?.phone ?? "")
  const [whatsapp, setWhatsapp] = useState(partner?.whatsapp ?? "")
  const [tillNumber, setTillNumber] = useState(partner?.tillNumber ?? "")
  const [paybillNumber, setPaybillNumber] = useState(partner?.paybillNumber ?? "")
  const [paybillAccount, setPaybillAccount] = useState(partner?.paybillAccount ?? "")
  const [domain, setDomain] = useState(partner?.domain ?? "")
  const [isActive, setIsActive] = useState(partner?.isActive ?? true)
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!name.trim()) {
      toast.error("Partner needs a name")
      return
    }
    setBusy(true)
    const payload = {
      name: name.trim(),
      tagline: tagline || null,
      location: location || null,
      phone: phone || null,
      whatsapp: whatsapp || null,
      tillNumber: tillNumber || null,
      paybillNumber: paybillNumber || null,
      paybillAccount: paybillAccount || null,
      domain: domain || null,
      isActive,
    }
    const res = partner ? await updatePartner(partner.id, payload) : await createPartner(payload)
    setBusy(false)
    if (res.ok) {
      toast.success(partner ? "Partner updated" : "Partner added")
      onDone()
    }
  }

  return (
    <DialogContent className="max-h-[90svh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Network className="h-4 w-4" /> {partner ? "Edit partner" : "Add partner butchery"}
        </DialogTitle>
        <DialogDescription>
          Partner butcheries appear on your public Partners page and can receive redirected orders.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <div className="grid gap-2">
          <Label htmlFor="p-name">Name</Label>
          <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jamii Butchery" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="p-tagline">Tagline</Label>
          <Input id="p-tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Your community butcher" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="p-location">Location / area</Label>
          <Input id="p-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Zimmerman" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="p-phone">Phone</Label>
            <Input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" inputMode="tel" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-wa">WhatsApp</Label>
            <Input id="p-wa" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="2547XXXXXXXX" inputMode="tel" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="p-till">Till number</Label>
            <Input id="p-till" value={tillNumber} onChange={(e) => setTillNumber(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-paybill">Paybill number</Label>
            <Input id="p-paybill" value={paybillNumber} onChange={(e) => setPaybillNumber(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="p-paybill-acc">Paybill account</Label>
          <Input id="p-paybill-acc" value={paybillAccount} onChange={(e) => setPaybillAccount(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="p-domain">Website (optional)</Label>
          <Input id="p-domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Show on public Partners page</p>
            <p className="text-xs text-muted-foreground">Hide if temporarily unavailable</p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
        <Button onClick={submit} disabled={busy} className="gap-1.5">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {partner ? "Save changes" : "Add partner"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
