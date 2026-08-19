"use client"

import { Trash2, MessageSquare, Phone, Mail, Check } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/format"
import { markMessageRead, deleteMessage } from "@/app/actions/admin"
import type { Message, ShopSettings } from "@/lib/types"
import { cn } from "@/lib/utils"

export function MessagesTab({
  messages,
  settings,
}: {
  messages: Message[]
  settings: ShopSettings
}) {
  const unread = messages.filter((m) => !m.isRead)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Messages from customers via your website contact form.
        </p>
        {unread.length > 0 && <Badge variant="default">{unread.length} unread</Badge>}
      </div>

      {messages.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No messages yet. Customer messages from the contact form will appear here.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}
        </div>
      )}
    </div>
  )
}

function MessageRow({ message }: { message: Message }) {
  const waNumber = message.customerPhone?.replace(/\D/g, "")

  return (
    <Card className={cn("p-4", !message.isRead && "border-primary/30 bg-primary/5")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 font-display text-base font-bold">
              <Mail className="h-4 w-4 text-primary" /> {message.customerName}
            </span>
            {!message.isRead && <Badge variant="default">New</Badge>}
          </div>
          {message.customerPhone && (
            <a href={`tel:${message.customerPhone}`} className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Phone className="h-3 w-3" /> {message.customerPhone}
            </a>
          )}
          <p className="mt-2 text-sm">{message.body}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(message.createdAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!message.isRead && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={async () => {
                await markMessageRead(message.id, true)
                toast.success("Marked read")
              }}
              aria-label="Mark read"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          {waNumber && (
            <Button
              variant="ghost"
              size="icon-sm"
              render={
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              aria-label="Reply on WhatsApp"
            >
              <MessageSquare className="h-4 w-4 text-primary" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={async () => {
              await deleteMessage(message.id)
              toast.success("Message deleted")
            }}
            aria-label="Delete message"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
