import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

// ---------- Better Auth tables ----------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// ---------- App tables ----------
export const shopSettings = pgTable("shop_settings", {
  id: integer("id").primaryKey().default(1),
  shopName: text("shop_name").notNull().default("Estate Butchery"),
  tagline: text("tagline"),
  isOpen: boolean("is_open").notNull().default(true),
  dailyUpdate: text("daily_update"),
  news: text("news"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  tillNumber: text("till_number"),
  paybillNumber: text("paybill_number"),
  paybillAccount: text("paybill_account"),
  heroImage: text("hero_image"),
  logoImage: text("logo_image"),
  locationAreas: text("location_areas"),
  openingHours: text("opening_hours"),
  notifyNumbers: text("notify_numbers"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id"),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  pricePerKg: numeric("price_per_kg"),
  wholesalePricePerKg: numeric("wholesale_price_per_kg"),
  retailPrice: numeric("retail_price"),
  retailUnit: text("retail_unit"),
  isAvailable: boolean("is_available").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: text("order_code").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  orderType: text("order_type").notNull().default("pickup"),
  pickupAt: timestamp("pickup_at"),
  notes: text("notes"),
  total: numeric("total").notNull().default("0"),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  paymentMethod: text("payment_method"),
  paymentRef: text("payment_ref"),
  paymentConfirmedAt: timestamp("payment_confirmed_at"),
  paidTo: text("paid_to"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id"),
  productName: text("product_name").notNull(),
  unit: text("unit").notNull(),
  quantity: numeric("quantity").notNull(),
  unitPrice: numeric("unit_price").notNull(),
  lineTotal: numeric("line_total").notNull(),
})

export const supplierOrders = pgTable("supplier_orders", {
  id: serial("id").primaryKey(),
  supplierName: text("supplier_name").notNull(),
  supplierPhone: text("supplier_phone"),
  item: text("item").notNull(),
  quantityKg: numeric("quantity_kg"),
  unitCost: numeric("unit_cost"),
  totalCost: numeric("total_cost"),
  status: text("status").notNull().default("expected"),
  expectedAt: timestamp("expected_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  body: text("body").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
