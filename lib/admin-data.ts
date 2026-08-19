import "server-only"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { messages, orders, supplierOrders } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { headers } from "next/headers"

export async function getAdminSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function getOrders() {
  return db.select().from(orders).orderBy(desc(orders.createdAt))
}

export async function getSupplierOrders() {
  return db.select().from(supplierOrders).orderBy(desc(supplierOrders.createdAt))
}

export async function getMessages() {
  return db.select().from(messages).orderBy(desc(messages.createdAt))
}

export type DashboardStats = {
  todayRevenue: number
  todayOrders: number
  todayPaid: number
  pendingOrders: number
  upcomingPickups: number
  unreadMessages: number
  expectedSupplies: number
  todaySupplyCost: number
  estimatedProfit: number
}

export function computeStats(
  ordersList: (typeof orders.$inferSelect)[],
  suppliers: (typeof supplierOrders.$inferSelect)[],
  msgs: (typeof messages.$inferSelect)[],
): DashboardStats {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const todays = ordersList.filter((o) => o.createdAt && new Date(o.createdAt) >= startOfDay)
  const todayPaidOrders = todays.filter((o) => o.paymentStatus === "paid")
  const todayRevenue = todayPaidOrders.reduce((s, o) => s + Number(o.total || 0), 0)

  const todaySupplies = suppliers.filter(
    (x) => x.createdAt && new Date(x.createdAt) >= startOfDay,
  )
  const todaySupplyCost = todaySupplies.reduce((s, x) => s + Number(x.totalCost || 0), 0)

  return {
    todayRevenue,
    todayOrders: todays.length,
    todayPaid: todayPaidOrders.length,
    pendingOrders: ordersList.filter((o) => o.status === "pending").length,
    upcomingPickups: ordersList.filter(
      (o) => o.orderType === "pickup" && o.pickupAt && new Date(o.pickupAt) >= now && o.status !== "completed" && o.status !== "cancelled",
    ).length,
    unreadMessages: msgs.filter((m) => !m.isRead).length,
    expectedSupplies: suppliers.filter((x) => x.status === "expected").length,
    todaySupplyCost,
    estimatedProfit: todayRevenue - todaySupplyCost,
  }
}
