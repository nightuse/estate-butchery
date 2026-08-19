import { redirect } from "next/navigation"
import {
  getAdminSession,
  getOrders,
  getSupplierOrders,
  getMessages,
  getAllPartners,
  getAdminMessages,
  computeStats,
} from "@/lib/admin-data"
import { getSettings, getCategories, getProducts } from "@/lib/queries"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await getAdminSession()
  if (!session?.user) redirect("/admin/login")

  const [
    settings,
    categories,
    products,
    orders,
    suppliers,
    messages,
    partners,
    adminMessages,
  ] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts(),
    getOrders(),
    getSupplierOrders(),
    getMessages(),
    getAllPartners(),
    getAdminMessages(),
  ])

  const stats = computeStats(orders, suppliers, messages)

  return (
    <AdminDashboard
      adminName={session.user.name || session.user.email}
      settings={settings}
      categories={categories}
      products={products}
      orders={orders}
      suppliers={suppliers}
      messages={messages}
      partners={partners}
      adminMessages={adminMessages}
      stats={stats}
    />
  )
}
