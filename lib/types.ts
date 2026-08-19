import type {
  categories,
  messages,
  orderItems,
  orders,
  products,
  shopSettings,
  supplierOrders,
} from "@/lib/db/schema"

export type ShopSettings = typeof shopSettings.$inferSelect
export type Category = typeof categories.$inferSelect
export type Product = typeof products.$inferSelect
export type Order = typeof orders.$inferSelect
export type OrderItem = typeof orderItems.$inferSelect
export type SupplierOrder = typeof supplierOrders.$inferSelect
export type Message = typeof messages.$inferSelect
