"use client"

import { useState } from "react"
import { Save, Loader as Loader2, Lock, Power } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { updateSettings, toggleOpen, changePassword } from "@/app/actions/admin"
import { authClient } from "@/lib/auth-client"
import type { ShopSettings } from "@/lib/types"

export function SettingsTab({ settings }: { settings: ShopSettings }) {
  const [form, setForm] = useState({
    shopName: settings.shopName ?? "",
    tagline: settings.tagline ?? "",
    phone: settings.phone ?? "",
    whatsapp: settings.whatsapp ?? "",
    tillNumber: settings.tillNumber ?? "",
    paybillNumber: settings.paybillNumber ?? "",
    paybillAccount: settings.paybillAccount ?? "",
    locationAreas: settings.locationAreas ?? "",
    openingHours: settings.openingHours ?? "",
    dailyUpdate: settings.dailyUpdate ?? "",
    news: settings.news ?? "",
    heroImage: settings.heroImage ?? "",
    notifyNumbers: settings.notifyNumbers ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(settings.isOpen)

  async function save() {
    setSaving(true)
    const res = await updateSettings(form)
    setSaving(false)
    if (res.ok) toast.success("Settings saved")
  }

  async function toggleShopOpen(value: boolean) {
    setIsOpen(value)
    const res = await toggleOpen(value)
    if (res.ok) toast.success(value ? "Shop opened" : "Shop closed")
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Shop status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 font-medium">
              <Power className="h-4 w-4 text-primary" /> Shop status
            </p>
            <p className="text-xs text-muted-foreground">
              When closed, customers see a closed banner but can still browse.
            </p>
          </div>
          <Switch checked={isOpen} onCheckedChange={toggleShopOpen} />
        </div>
      </Card>

      {/* Shop info */}
      <Card className="p-4">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Shop information</h2>
        <div className="flex flex-col gap-3">
          <Field label="Shop name" value={form.shopName} onChange={(v) => update("shopName", v)} id="s-name" />
          <Field label="Tagline" value={form.tagline} onChange={(v) => update("tagline", v)} id="s-tagline" />
          <Field label="Hero image URL" value={form.heroImage} onChange={(v) => update("heroImage", v)} id="s-hero" placeholder="/images/hero-butchery.png" />
          <Field label="Location areas (comma separated)" value={form.locationAreas} onChange={(v) => update("locationAreas", v)} id="s-areas" />
          <Field label="Opening hours" value={form.openingHours} onChange={(v) => update("openingHours", v)} id="s-hours" />
        </div>
      </Card>

      {/* Contact */}
      <Card className="p-4">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Contact &amp; payment</h2>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} id="s-phone" />
            <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => update("whatsapp", v)} id="s-wa" />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Till number (Buy Goods)" value={form.tillNumber} onChange={(v) => update("tillNumber", v)} id="s-till" />
            <Field label="Paybill number" value={form.paybillNumber} onChange={(v) => update("paybillNumber", v)} id="s-paybill" />
          </div>
          <Field label="Paybill account" value={form.paybillAccount} onChange={(v) => update("paybillAccount", v)} id="s-paybill-acc" />
        </div>
      </Card>

      {/* Announcements */}
      <Card className="p-4">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Announcements</h2>
        <div className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label htmlFor="s-daily">Daily update (shown in top banner)</Label>
            <Textarea id="s-daily" value={form.dailyUpdate} onChange={(e) => update("dailyUpdate", e.target.value)} rows={2} placeholder="Fresh stock arrived — goat and chicken available today!" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-news">News / special notice</Label>
            <Textarea id="s-news" value={form.news} onChange={(e) => update("news", e.target.value)} rows={2} placeholder="Closed on Sunday 25th for public holiday" />
          </div>
          <Field label="SMS notify numbers (comma separated, for order alerts)" value={form.notifyNumbers} onChange={(v) => update("notifyNumbers", v)} id="s-notify" />
        </div>
      </Card>

      <Button onClick={save} disabled={saving} className="w-fit gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save settings
      </Button>

      {/* Password */}
      <Separator />
      <PasswordSection />
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  id,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  id: string
  placeholder?: string
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function PasswordSection() {
  const [newPassword, setNewPassword] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setBusy(true)
    const res = await changePassword(newPassword)
    setBusy(false)
    if (res.ok) {
      toast.success("Password changed")
      setNewPassword("")
    } else {
      toast.error(res.error || "Failed to change password")
    }
  }

  return (
    <Card className="p-4">
      <h2 className="mb-1 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
        <Lock className="h-4 w-4 text-primary" /> Change password
      </h2>
      <p className="mb-3 text-xs text-muted-foreground">Set a new password for your admin account.</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="new-pass">New password</Label>
          <Input
            id="new-pass"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
          />
        </div>
        <Button onClick={submit} disabled={busy} className="gap-2">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Update password
        </Button>
      </div>
    </Card>
  )
}
