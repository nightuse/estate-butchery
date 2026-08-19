"use client"

import { useState } from "react"
import { Phone, Trash2, Mail, MailOpen } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/format"
import { markMessageRead, deleteMessage, updateSettings } from "@/app/actions/admin"
import type { Message, ShopSettings } from "@/lib/types"

export function MessagesTab({
  messages,
  settings,
}: {
  messages: Message[]
  settings: ShopSettings
}) {
  const [reply, setReply] = useState<Record<number, string>>({})

  const sorted = [...messages].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Messages from customers via the contact form. Reply on WhatsApp or mark them handled.
        </p>
        <Badge variant="secondary">{messages.filter((m) => !m.isRead).length} unread</Badge>
      </div>

      {sorted.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No messages yet.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((m) => (
            <MessageRow
              key={m.id}
              message={m}
              settings={settings}
              replyText={reply[m.id] ?? ""}
              onReplyChange={(v) => setReply((prev) => ({ ...prev, [m.id]: v }))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MessageRow({
  message,
  settings,
  replyText,
  onReplyChange,
}: {
  message: Message
  settings: ShopSettings
  replyText: string
  onReplyChange: (v: string) => void
}) {
  async function toggleRead() {
    const res = await markMessageRead(message.id, !message.isRead)
    if (res.ok) toast.success(message.isRead ? "Marked unread" : "Marked read")
  }

  async function remove() {
    const res = await deleteMessage(message.id)
    if (res.ok) toast.success("Message deleted")
  }

  const waNumber = (message.customerPhone || settings.whatsapp || "").replace(/\D/g, "")

  async function saveReply() {
    if (!replyText.trim()) return
    await updateSettings({} as Record<string, string | boolean | null>)
    toast.success("Reply saved — send it on WhatsApp below")
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {message.isRead ? (
              <MailOpen className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Mail className="h-4 w-4 text-primary" />
            )}
            <span className="font-medium">{message.customerName}</span>
            {!message.isRead && <Badge variant="default">New</Badge>}
          </div>
          <p className="mt-2 text-sm">{message.body}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {message.customerPhone && (
              <a href={`tel:${message.customerPhone}`} className="flex items-center gap-1 hover:text-foreground">
                <Phone className="h-3 w-3" /> {message.customerPhone}
              </a>
            )}
            <span>{formatDateTime(message.createdAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={toggleRead} title={message.isRead ? "Mark unread" : "Mark read"}>
            {message.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={remove} title="Delete">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {waNumber && (
        <div className="mt-3 border-t pt-3">
          <div className="flex flex-col gap-2">
            <Textarea
              value={replyText}
              onChange={(e) => onReplyChange(e.target.value)}
              rows={2}
              placeholder="Type a reply..."
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                render={
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                      `Hi ${message.customerName}, ${replyText || "thank you for your message."}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                className="gap-1.5"
              >
                Send on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
