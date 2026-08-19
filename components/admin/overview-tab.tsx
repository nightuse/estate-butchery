"use client"

import { TrendingUp, ShoppingBag, Clock, MessageSquare, Truck, Wallet, CircleCheck as CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { formatKES } from "@/lib/format"
import { statusLabel } from "@/lib/format"
import type { DashboardStats } from "@/lib/admin-data"
import type { Order, ShopSettings } from "@/lib/types"
import { cn } from "@/lib/utils"

type Tab =
  | "overview"
  | "orders"
  | "catalog"
  | "suppliers"
  | "messages"
  | "partners"
  | "chat"
  | "settings"

export function OverviewTab({
  stats,
  orders,
  settings,
  onNavigate,
}: {
  stats: DashboardStats
  orders: Order[]
  settings: ShopSettings
  onNavigate: (tab: Tab) => void
}) {
  const recent = orders.slice(0, 6)

  const cards = [
    {
      label: "Today's income",
      value: formatKES(stats.todayRevenue),
      hint: `${stats.todayPaid} paid orders`,
      icon: Wallet,
      accent: true,
    },
    {
      label: "Est. profit today",
      value: formatKES(stats.estimatedProfit),
      hint: `After ${formatKES(stats.todaySupplyCost)} supplies`,
      icon: TrendingUp,
    },
    {
      label: "Orders today",
      value: String(stats.todayOrders),
      hint: `${stats.pendingOrders} pending`,
      icon: ShoppingBag,
    },
    {
      label: "Upcoming pickups",
      value: String(stats.upcomingPickups),
      hint: "Booked for later",
      icon: Clock,
    },
    {
      label: "Expected supplies",
      value: String(stats.expectedSupplies),
      hint: "From suppliers",
      icon: Truck,
    },
    {
      label: "Unread messages",
      value: String(stats.unreadMessages),
      hint: "From customers",
      icon: MessageSquare,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {!settings.isOpen && (
        <div className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          Your shop is currently marked <strong>closed</strong>. Customers can browse but see a closed
          banner. Toggle it open in Settings when you&apos;re ready.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Card
              key={c.label}
              className={cn(
                "flex flex-col gap-1 p-4",
                c.accent && "bg-primary text-primary-foreground",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-medium",
                    c.accent ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {c.label}
                </span>
                <Icon
                  className={cn(
                    "h-4 w-4",
                    c.accent ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                />
              </div>
              <span className="font-display text-2xl font-bold tabular-nums">{c.value}</span>
              <span
                className={cn(
                  "text-xs",
                  c.accent ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {c.hint}
              </span>
            </Card>
          )
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide">Recent orders</h2>
          <button
            onClick={() => onNavigate("orders")}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="divide-y">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {o.paymentStatus === "paid" ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {o.customerName}{" "}
                    <span className="font-mono text-xs text-muted-foreground">{o.orderCode}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.orderType === "pickup" ? "Pickup" : "Instant"} · {statusLabel(o.status)}
                  </p>
                </div>
                <span className="font-display text-sm font-bold">{formatKES(Number(o.total))}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
