"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  adminMessages,
  categories,
  messages,
  orderItems,
  orders,
  partnerShops,
  products,
  shopSettings,
  supplierOrders,
} from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}

function refresh() {
  revalidatePath("/admin")
  revalidatePath("/")
}

// ---------------- Settings ----------------
export async function updateSettings(data: Record<string, string | boolean | null>) {
  await requireAdmin()
  await db
    .update(shopSettings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(shopSettings.id, 1))
  refresh()
  return { ok: true as const }
}

export async function toggleOpen(isOpen: boolean) {
  await requireAdmin()
  await db.update(shopSettings).set({ isOpen, updatedAt: new Date() }).where(eq(shopSettings.id, 1))
  refresh()
  return { ok: true as const }
}

// ---------------- Categories ----------------
export async function createCategory(data: { name: string; description?: string; sortOrder?: number }) {
  await requireAdmin()
  await db.insert(categories).values({
    name: data.name,
    description: data.description || null,
    sortOrder: data.sortOrder ?? 0,
  })
  refresh()
  return { ok: true as const }
}

export async function updateCategory(id: number, data: { name: string; description?: string; sortOrder?: number }) {
  await requireAdmin()
  await db
    .update(categories)
    .set({ name: data.name, description: data.description || null, sortOrder: data.sortOrder ?? 0 })
    .where(eq(categories.id, id))
  refresh()
  return { ok: true as const }
}

export async function deleteCategory(id: number) {
  await requireAdmin()
  await db.delete(categories).where(eq(categories.id, id))
  refresh()
  return { ok: true as const }
}

// ---------------- Products ----------------
type ProductInput = {
  categoryId: number | null
  name: string
  description?: string | null
  image?: string | null
  pricePerKg?: string | null
  wholesalePricePerKg?: string | null
  retailPrice?: string | null
  retailUnit?: string | null
  isAvailable: boolean
  sortOrder?: number
}

export async function createProduct(data: ProductInput) {
  await requireAdmin()
  await db.insert(products).values({
    categoryId: data.categoryId,
    name: data.name,
    description: data.description || null,
    image: data.image || null,
    pricePerKg: data.pricePerKg || null,
    wholesalePricePerKg: data.wholesalePricePerKg || null,
    retailPrice: data.retailPrice || null,
    retailUnit: data.retailUnit || null,
    isAvailable: data.isAvailable,
    sortOrder: data.sortOrder ?? 0,
  })
  refresh()
  return { ok: true as const }
}

export async function updateProduct(id: number, data: ProductInput) {
  await requireAdmin()
  await db
    .update(products)
    .set({
      categoryId: data.categoryId,
      name: data.name,
      description: data.description || null,
      image: data.image || null,
      pricePerKg: data.pricePerKg || null,
      wholesalePricePerKg: data.wholesalePricePerKg || null,
      retailPrice: data.retailPrice || null,
      retailUnit: data.retailUnit || null,
      isAvailable: data.isAvailable,
      sortOrder: data.sortOrder ?? 0,
    })
    .where(eq(products.id, id))
  refresh()
  return { ok: true as const }
}

export async function setProductAvailability(id: number, isAvailable: boolean) {
  await requireAdmin()
  await db.update(products).set({ isAvailable }).where(eq(products.id, id))
  refresh()
  return { ok: true as const }
}

export async function deleteProduct(id: number) {
  await requireAdmin()
  await db.delete(products).where(eq(products.id, id))
  refresh()
  return { ok: true as const }
}

// ---------------- Orders ----------------
export async function updateOrderStatus(id: number, status: string) {
  await requireAdmin()
  await db.update(orders).set({ status }).where(eq(orders.id, id))
  refresh()
  return { ok: true as const }
}

export async function confirmPayment(
  id: number,
  data: { paymentMethod: string; paymentRef: string; paidTo: string },
) {
  await requireAdmin()
  await db
    .update(orders)
    .set({
      paymentStatus: "paid",
      paymentMethod: data.paymentMethod,
      paymentRef: data.paymentRef,
      paidTo: data.paidTo,
      paymentConfirmedAt: new Date(),
    })
    .where(eq(orders.id, id))
  refresh()
  return { ok: true as const }
}

export async function getOrderItems(orderId: number) {
  await requireAdmin()
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId))
}

// ---------------- Suppliers ----------------
type SupplierInput = {
  supplierName: string
  supplierPhone?: string | null
  item: string
  quantityKg?: string | null
  unitCost?: string | null
  totalCost?: string | null
  status: string
  expectedAt?: string | null
  notes?: string | null
}

export async function createSupplierOrder(data: SupplierInput) {
  await requireAdmin()
  await db.insert(supplierOrders).values({
    supplierName: data.supplierName,
    supplierPhone: data.supplierPhone || null,
    item: data.item,
    quantityKg: data.quantityKg || null,
    unitCost: data.unitCost || null,
    totalCost: data.totalCost || null,
    status: data.status,
    expectedAt: data.expectedAt ? new Date(data.expectedAt) : null,
    notes: data.notes || null,
  })
  refresh()
  return { ok: true as const }
}

export async function updateSupplierStatus(id: number, status: string) {
  await requireAdmin()
  await db.update(supplierOrders).set({ status }).where(eq(supplierOrders.id, id))
  refresh()
  return { ok: true as const }
}

export async function deleteSupplierOrder(id: number) {
  await requireAdmin()
  await db.delete(supplierOrders).where(eq(supplierOrders.id, id))
  refresh()
  return { ok: true as const }
}

// ---------------- Messages ----------------
export async function markMessageRead(id: number, isRead: boolean) {
  await requireAdmin()
  await db.update(messages).set({ isRead }).where(eq(messages.id, id))
  refresh()
  return { ok: true as const }
}

export async function deleteMessage(id: number) {
  await requireAdmin()
  await db.delete(messages).where(eq(messages.id, id))
  refresh()
  return { ok: true as const }
}

// ---------------- Password ----------------
export async function changePassword(newPassword: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { ok: false as const, error: "Unauthorized" }
  if (newPassword.length < 8) return { ok: false as const, error: "Password must be at least 8 characters." }

  await auth.api.changePassword({
    headers: await headers(),
    body: { newPassword, currentPassword: newPassword },
  })
  return { ok: true as const }
}

// ---------------- Partner Shops ----------------
type PartnerInput = {
  name: string
  tagline?: string | null
  location?: string | null
  phone?: string | null
  whatsapp?: string | null
  tillNumber?: string | null
  paybillNumber?: string | null
  paybillAccount?: string | null
  domain?: string | null
  isActive: boolean
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

export async function createPartner(data: PartnerInput) {
  await requireAdmin()
  const slug = slugify(data.name) + "-" + Math.floor(Math.random() * 1000)
  await db.insert(partnerShops).values({
    slug,
    name: data.name,
    tagline: data.tagline || null,
    location: data.location || null,
    phone: data.phone || null,
    whatsapp: data.whatsapp || null,
    tillNumber: data.tillNumber || null,
    paybillNumber: data.paybillNumber || null,
    paybillAccount: data.paybillAccount || null,
    domain: data.domain || null,
    isActive: data.isActive,
    sortOrder: 0,
  })
  refresh()
  return { ok: true as const }
}

export async function updatePartner(id: number, data: PartnerInput) {
  await requireAdmin()
  await db
    .update(partnerShops)
    .set({
      name: data.name,
      tagline: data.tagline || null,
      location: data.location || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      tillNumber: data.tillNumber || null,
      paybillNumber: data.paybillNumber || null,
      paybillAccount: data.paybillAccount || null,
      domain: data.domain || null,
      isActive: data.isActive,
    })
    .where(eq(partnerShops.id, id))
  refresh()
  return { ok: true as const }
}

export async function deletePartner(id: number) {
  await requireAdmin()
  await db.delete(partnerShops).where(eq(partnerShops.id, id))
  refresh()
  return { ok: true as const }
}

// ---------------- Order Redirect ----------------
export async function redirectOrderToPartner(orderId: number, partnerId: number, reason?: string) {
  await requireAdmin()
  const [partner] = await db.select().from(partnerShops).where(eq(partnerShops.id, partnerId)).limit(1)
  if (!partner) return { ok: false as const, error: "Partner not found." }

  const note = reason ? `Redirected to ${partner.name}: ${reason}` : `Redirected to ${partner.name}`
  await db
    .update(orders)
    .set({ status: "redirected", notes: note })
    .where(eq(orders.id, orderId))
  refresh()
  return { ok: true as const }
}

// ---------------- Admin Chat ----------------
export async function sendAdminMessage(data: {
  senderName: string
  senderShop: string
  recipientShop: string
  body: string
}) {
  await requireAdmin()
  const body = data.body?.trim()
  if (!body || body.length < 1) return { ok: false as const, error: "Message is empty." }
  if (!data.recipientShop) return { ok: false as const, error: "Select a recipient shop." }

  await db.insert(adminMessages).values({
    senderName: data.senderName,
    senderShop: data.senderShop,
    recipientShop: data.recipientShop,
    body,
  })
  refresh()
  return { ok: true as const }
}

export async function markAdminMessageRead(id: number, isRead: boolean) {
  await requireAdmin()
  await db.update(adminMessages).set({ isRead }).where(eq(adminMessages.id, id))
  refresh()
  return { ok: true as const }
}
