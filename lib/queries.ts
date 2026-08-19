import "server-only"
import { db } from "@/lib/db"
import { categories, partnerShops, products, shopSettings } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"

export type ShopSettings = typeof shopSettings.$inferSelect
export type Category = typeof categories.$inferSelect
export type Product = typeof products.$inferSelect
export type PartnerShop = typeof partnerShops.$inferSelect

const DEFAULT_SETTINGS: ShopSettings = {
  id: 1,
  shopName: "Estate Butchery",
  tagline: "Fresh meat, fair prices, your neighborhood butchery",
  isOpen: true,
  dailyUpdate: null,
  news: null,
  phone: null,
  whatsapp: null,
  tillNumber: null,
  paybillNumber: null,
  paybillAccount: null,
  lipaNaPochi: null,
  heroImage: null,
  logoImage: null,
  locationAreas: "Njathaini, Zimmerman, Mirema, Marurui, Githurai, Kasarani",
  openingHours: "Mon-Sun: 7:00 AM - 8:00 PM",
  notifyNumbers: null,
  updatedAt: new Date(),
}

export async function getSettings(): Promise<ShopSettings> {
  const rows = await db.select().from(shopSettings).where(eq(shopSettings.id, 1)).limit(1)
  return rows[0] ?? DEFAULT_SETTINGS
}

export async function getCategories(): Promise<Category[]> {
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name))
}

export async function getProducts(): Promise<Product[]> {
  return db.select().from(products).orderBy(asc(products.sortOrder), asc(products.name))
}

export async function getActivePartners(): Promise<PartnerShop[]> {
  return db
    .select()
    .from(partnerShops)
    .where(eq(partnerShops.isActive, true))
    .orderBy(asc(partnerShops.sortOrder), asc(partnerShops.name))
}
