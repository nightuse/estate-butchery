"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  ClipboardList,
  Beef,
  Truck,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type {
  Category,
  Message,
  Order,
  Product,
  ShopSettings,
  SupplierOrder,
} from "@/lib/types"
import type { DashboardStats } from "@/lib/admin-data"
import { OverviewTab } from "./overview-tab"
import { OrdersTab } from "./orders-tab"
import { CatalogTab } from "./catalog-tab"
import { SuppliersTab } from "./suppliers-tab"
import { MessagesTab } from "./messages-tab"
import { SettingsTab } from "./settings-tab"

type Tab = "overview" | "orders" | "catalog" | "suppliers" | "messages" | "settings"

export function AdminDashboard({
  adminName,
  settings,
  categories,
  products,
  orders,
  suppliers,
  messages,
  stats,
}: {
  adminName: string
  settings: ShopSettings
  categories: Category[]
  products: Product[]
  orders: Order[]
  suppliers: SupplierOrder[]
  messages: Message[]
  stats: DashboardStats
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("overview")

  const nav: { id: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ClipboardList, badge: stats.pendingOrders },
    { id: "catalog", label: "Catalog", icon: Beef },
    { id: "suppliers", label: "Suppliers", icon: Truck, badge: stats.expectedSupplies },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: stats.unreadMessages },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  async function signOut() {
    await authClient.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="flex min-h-svh flex-col bg-muted/30 lg:flex-row">
      {/* Sidebar */}
      <aside className="flex flex-col border-b bg-card lg:w-60 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-display text-lg font-bold text-primary-foreground">
            EB
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm font-bold uppercase tracking-wide">Estate</span>
            <span className="text-xs text-muted-foreground">Admin Portal</span>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
          {nav.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.badge ? (
                  <span
                    className={cn(
                      "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold",
                      active ? "bg-primary-foreground text-primary" : "bg-accent text-accent-foreground",
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto hidden flex-col gap-1 border-t p-2 lg:flex">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/" target="_blank" />}
            className="justify-start gap-2 text-muted-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            View shop
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="justify-start gap-2 text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b bg-card px-4 py-3 lg:px-6">
          <div>
            <h1 className="font-display text-lg font-bold uppercase tracking-wide">
              {nav.find((n) => n.id === tab)?.label}
            </h1>
            <p className="text-xs text-muted-foreground">Welcome back, {adminName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                settings.isOpen ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  settings.isOpen ? "bg-primary" : "bg-muted-foreground",
                )}
              />
              {settings.isOpen ? "Shop open" : "Shop closed"}
            </span>
            <Button variant="ghost" size="icon-sm" onClick={signOut} className="lg:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          {tab === "overview" && (
            <OverviewTab stats={stats} orders={orders} settings={settings} onNavigate={setTab} />
          )}
          {tab === "orders" && <OrdersTab orders={orders} />}
          {tab === "catalog" && <CatalogTab categories={categories} products={products} />}
          {tab === "suppliers" && <SuppliersTab suppliers={suppliers} />}
          {tab === "messages" && <MessagesTab messages={messages} settings={settings} />}
          {tab === "settings" && <SettingsTab settings={settings} />}
        </main>
      </div>
    </div>
  )
}
