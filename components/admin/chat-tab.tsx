"use client"

import { useState } from "react"
import { Send, Loader as Loader2, MessageSquare, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDateTime } from "@/lib/format"
import { sendAdminMessage, markAdminMessageRead } from "@/app/actions/admin"
import type { AdminMessage, PartnerShop, ShopSettings } from "@/lib/types"
import { cn } from "@/lib/utils"

export function ChatTab({
  adminMessages,
  partners,
  settings,
  adminName,
}: {
  adminMessages: AdminMessage[]
  partners: PartnerShop[]
  settings: ShopSettings
  adminName: string
}) {
  const [recipient, setRecipient] = useState("")
  const [body, setBody] = useState("")
  const [busy, setBusy] = useState(false)

  async function send() {
    if (!recipient) {
      toast.error("Select a recipient shop")
      return
    }
    if (!body.trim()) {
      toast.error("Type a message")
      return
    }
    setBusy(true)
    const res = await sendAdminMessage({
      senderName: adminName,
      senderShop: settings.shopName,
      recipientShop: recipient,
      body: body.trim(),
    })
    setBusy(false)
    if (res.ok) {
      toast.success("Message sent")
      setBody("")
    } else {
      toast.error(res.error || "Failed to send")
    }
  }

  const incoming = adminMessages.filter((m) => m.recipientShop === settings.shopName)
  const outgoing = adminMessages.filter((m) => m.senderShop === settings.shopName)
  const all = [...adminMessages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Send messages to partner butcheries to coordinate orders, stock, and more.
        </p>
        <Badge variant="secondary">{incoming.filter((m) => !m.isRead).length} unread</Badge>
      </div>

      {/* Compose */}
      <Card className="p-4">
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
          <Send className="h-4 w-4 text-primary" /> New message
        </h2>
        <div className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label>To</Label>
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Select a partner butchery..." />
              </SelectTrigger>
              <SelectContent>
                {partners.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}{p.location ? ` — ${p.location}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="chat-body">Message</Label>
            <Textarea
              id="chat-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="e.g. Can you fulfil order EB-240101-3847? Customer is near your area."
            />
          </div>
          <Button onClick={send} disabled={busy} className="w-fit gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send message
          </Button>
        </div>
      </Card>

      {/* Message list */}
      <Card className="overflow-hidden">
        <div className="border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
            <MessageSquare className="h-4 w-4" /> All messages ({all.length})
          </h2>
        </div>
        {all.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          <ul className="divide-y">
            {all.map((m) => {
              const isIncoming = m.recipientShop === settings.shopName
              return (
                <li
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-1 px-4 py-3",
                    isIncoming && !m.isRead && "bg-primary/5",
                  )}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 font-medium">
                      {isIncoming ? (
                        <>
                          <ArrowRight className="h-3 w-3 text-primary" /> From {m.senderName} ({m.senderShop})
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-3 w-3 text-muted-foreground rotate-180" /> To {m.recipientShop}
                        </>
                      )}
                    </span>
                    {!m.isRead && isIncoming && <Badge variant="default">New</Badge>}
                    <span className="ml-auto text-muted-foreground">{formatDateTime(m.createdAt)}</span>
                  </div>
                  <p className="text-sm">{m.body}</p>
                  {isIncoming && !m.isRead && (
                    <button
                      onClick={async () => {
                        await markAdminMessageRead(m.id, true)
                        toast.success("Marked read")
                      }}
                      className="w-fit text-xs text-primary hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
