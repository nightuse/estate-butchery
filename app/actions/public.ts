"use server"

import { db } from "@/lib/db"
import { messages, orderItems, orders, products } from "@/lib/db/schema"
import { generateOrderCode } from "@/lib/format"
import { inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"

type PricingMode = "retail" | "perKg" | "wholesale"

export type CartLineInput = {
  productId: number
  mode: PricingMode
  quantity: number
}

export type PlaceOrderInput = {
  customerName: string
  customerPhone: string
  orderType: "pickup" | "instant"
  pickupAt?: string | null
  notes?: string | null
  items: CartLineInput[]
}

const MAX_QTY_PER_LINE = 500

export async function placeOrder(input: PlaceOrderInput) {
  const name = input.customerName?.trim()
  const phone = input.customerPhone?.trim()

  if (!name || name.length < 2) return { ok: false as const, error: "Please enter your name." }
  if (!phone || phone.replace(/\D/g, "").length < 9)
    return { ok: false as const, error: "Please enter a valid phone number." }
  if (!input.items?.length) return { ok: false as const, error: "Your basket is empty." }

  const ids = [...new Set(input.items.map((i) => i.productId))]
  const dbProducts = await db.select().from(products).where(inArray(products.id, ids))
  const byId = new Map(dbProducts.map((p) => [p.id, p]))

  const resolved: {
    productId: number
    productName: string
    unit: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }[] = []

  for (const line of input.items) {
    const p = byId.get(line.productId)
    if (!p) return { ok: false as const, error: "One of the items is no longer available." }
    if (!p.isAvailable)
      return { ok: false as const, error: `${p.name} is currently out of stock.` }

    const qty = Number(line.quantity)
    if (!Number.isFinite(qty) || qty <= 0)
      return { ok: false as const, error: "Invalid quantity in your basket." }
    if (qty > MAX_QTY_PER_LINE)
      return { ok: false as const, error: "That quantity is too large. Please contact us for bulk orders." }

    // Server-side price selection — never trust client prices
    let unitPrice = 0
    let unit = ""
    if (line.mode === "wholesale" && p.wholesalePricePerKg) {
      unitPrice = Number(p.wholesalePricePerKg)
      unit = "kg (wholesale)"
    } else if (line.mode === "retail" && p.retailPrice) {
      unitPrice = Number(p.retailPrice)
      unit = p.retailUnit ?? "each"
    } else if (p.pricePerKg) {
      unitPrice = Number(p.pricePerKg)
      unit = "kg"
    } else if (p.retailPrice) {
      unitPrice = Number(p.retailPrice)
      unit = p.retailUnit ?? "each"
    } else {
      return { ok: false as const, error: `${p.name} has no price set.` }
    }

    const lineTotal = Math.round(unitPrice * qty * 100) / 100
    resolved.push({
      productId: p.id,
      productName: p.name,
      unit,
      quantity: qty,
      unitPrice,
      lineTotal,
    })
  }

  const total = resolved.reduce((sum, l) => sum + l.lineTotal, 0)
  const orderCode = generateOrderCode()

  const [order] = await db
    .insert(orders)
    .values({
      orderCode,
      customerName: name,
      customerPhone: phone,
      orderType: input.orderType,
      pickupAt: input.pickupAt ? new Date(input.pickupAt) : null,
      notes: input.notes?.trim() || null,
      total: total.toFixed(2),
      status: "pending",
      paymentStatus: "unpaid",
    })
    .returning()

  await db.insert(orderItems).values(
    resolved.map((l) => ({
      orderId: order.id,
      productId: l.productId,
      productName: l.productName,
      unit: l.unit,
      quantity: l.quantity.toString(),
      unitPrice: l.unitPrice.toFixed(2),
      lineTotal: l.lineTotal.toFixed(2),
    })),
  )

  revalidatePath("/admin")
  return {
    ok: true as const,
    orderCode,
    total,
    orderType: input.orderType,
  }
}

export async function sendMessage(input: {
  customerName: string
  customerPhone?: string
  body: string
}) {
  const name = input.customerName?.trim()
  const body = input.body?.trim()
  if (!name || name.length < 2) return { ok: false as const, error: "Please enter your name." }
  if (!body || body.length < 3) return { ok: false as const, error: "Please enter a message." }

  await db.insert(messages).values({
    customerName: name,
    customerPhone: input.customerPhone?.trim() || null,
    body,
  })
  revalidatePath("/admin")
  return { ok: true as const }
}
