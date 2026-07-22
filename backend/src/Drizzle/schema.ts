import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  uniqueIndex,
  index,
  integer,
  decimal,
  pgEnum,
  jsonb
} from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded"
]);

export const paymentMethodEnum = pgEnum("payment_method", ["mpesa"]);

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "admin",
  "staff"
]);

export const adminRoleEnum = pgEnum("admin_role", [
  "super_admin",
  "admin",
  "manager",
  "support"
]);

export const adminStatusEnum = pgEnum("admin_status", [
  "active",
  "inactive",
  "suspended"
]);

export const staffRoleEnum = pgEnum("staff_role", [
  "manager",
  "support",
  "finance"
]);

export const staffStatusEnum = pgEnum("staff_status", [
  "active",
  "inactive",
  "suspended"
]);

export const productStatusEnum = pgEnum("product_status", [
  "in_stock",
  "low_stock",
  "out_of_stock",
  "discontinued"
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "approved",
  "rejected"
]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "unread",
  "read",
  "replied",
  "resolved"
]);

export const users = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("customer").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationCode: varchar("verification_code", { length: 10 }),
  verificationCodeExpiresAt: timestamp("verification_code_expires_at"),
  avatarPhoto: text("avatar_photo").default("https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128"),
  lastLogin: timestamp("last_login"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const admins = pgTable("admins", {
  adminId: serial("admin_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "set null" }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const staff = pgTable("staff", {
  staffId: serial("staff_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "set null" }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const adminActivityLogs = pgTable("admin_activity_logs", {
  logId: serial("log_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const categories = pgTable("categories", {
  categoryId: serial("category_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  photo: text("photo"),
  parentId: integer("parent_id"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const products = pgTable("products", {
  productId: serial("product_id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: decimal("compare_price", { precision: 10, scale: 2 }),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  status: productStatusEnum("status").default("in_stock").notNull(),
  categoryId: integer("category_id").references(() => categories.categoryId, { onDelete: "set null" }),
  featuredPhoto: text("featured_photo"),
  sku: varchar("sku", { length: 100 }).unique(),
  brand: varchar("brand", { length: 100 }),
  brandPhoto: text("brand_photo"),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  dimensions: jsonb("dimensions"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isBestSeller: boolean("is_best_seller").default(false).notNull(),
  views: integer("views").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0).notNull(),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  galleryPhotos: jsonb("gallery_photos").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => ({
  categoryIdx: index("category_idx").on(table.categoryId),
  statusIdx: index("status_idx").on(table.status),
  skuIdx: index("sku_idx").on(table.sku)
}));

export const productVariants = pgTable("product_variants", {
  variantId: serial("variant_id").primaryKey(),
  productId: integer("product_id").references(() => products.productId, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0).notNull(),
  attributes: jsonb("attributes").default({}).notNull(),
  featuredPhoto: text("featured_photo"),
  galleryPhotos: jsonb("gallery_photos").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const cart = pgTable("cart", {
  cartId: serial("cart_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.productId, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const wishlist = pgTable("wishlist", {
  wishlistId: serial("wishlist_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.productId, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const addresses = pgTable("addresses", {
  addressId: serial("address_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phonePrefix: varchar("phone_prefix", { length: 10 }).default("+254"),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  additionalPhone: varchar("additional_phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  county: varchar("county", { length: 100 }).notNull(),
  town: varchar("town", { length: 100 }).notNull(),
  area: varchar("area", { length: 100 }),
  landmark: varchar("landmark", { length: 255 }),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  postalCode: varchar("postal_code", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  googleMapsLink: text("google_maps_link"),
  deliveryInstructions: text("delivery_instructions"),
  isDefault: boolean("is_default").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const pickupStations = pgTable("pickup_stations", {
  stationId: serial("station_id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  county: varchar("county", { length: 100 }).notNull(),
  town: varchar("town", { length: 100 }).notNull(),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const pickupLocations = pgTable("pickup_locations", {
  locationId: serial("location_id").primaryKey(),
  stationId: integer("station_id").references(() => pickupStations.stationId, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  landmark: varchar("landmark", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const orders = pgTable("orders", {
  orderId: serial("order_id").primaryKey(),
  orderRef: varchar("order_ref", { length: 50 }).notNull().unique(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "set null" }),
  guestEmail: varchar("guest_email", { length: 255 }),
  guestPhone: varchar("guest_phone", { length: 20 }),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0").notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  billingAddress: jsonb("billing_address").notNull(),
  deliveryNotes: text("delivery_notes"),
  deliveryDate: timestamp("delivery_date"),
  adminNotes: text("admin_notes"),
  processedBy: integer("processed_by").references(() => users.userId, { onDelete: "set null" }),
  pickupStationId: integer("pickup_station_id").references(() => pickupStations.stationId, { onDelete: "set null" }),
  pickupLocationId: integer("pickup_location_id").references(() => pickupLocations.locationId, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const payments = pgTable("payments", {
  paymentId: serial("payment_id").primaryKey(),
  orderId: integer("order_id").references(() => orders.orderId, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "set null" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
  transactionReference: varchar("transaction_reference", { length: 255 }),
  mpesaReceiptNumber: varchar("mpesa_receipt_number", { length: 50 }),
  mpesaPhoneNumber: varchar("mpesa_phone_number", { length: 20 }),
  mpesaTillNumber: varchar("mpesa_till_number", { length: 20 }),
  paymentDate: timestamp("payment_date"),
  paymentResponse: jsonb("payment_response"),
  notes: text("notes"),
  processedBy: integer("processed_by").references(() => users.userId, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => ({
  orderIdx: index("order_idx").on(table.orderId),
  userIdx: index("user_idx").on(table.userId),
  transactionIdx: index("transaction_idx").on(table.transactionReference),
  mpesaReceiptIdx: index("mpesa_receipt_idx").on(table.mpesaReceiptNumber)
}));

export const orderItems = pgTable("order_items", {
  orderItemId: serial("order_item_id").primaryKey(),
  orderId: integer("order_id").references(() => orders.orderId, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.productId, { onDelete: "set null" }),
  variantId: integer("variant_id").references(() => productVariants.variantId, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productSku: varchar("product_sku", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  attributes: jsonb("attributes").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const reviews = pgTable("reviews", {
  reviewId: serial("review_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.productId, { onDelete: "cascade" }).notNull(),
  orderId: integer("order_id").references(() => orders.orderId, { onDelete: "set null" }),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 255 }),
  comment: text("comment").notNull(),
  status: reviewStatusEnum("status").default("pending").notNull(),
  photos: jsonb("photos").default([]).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  helpfulCount: integer("helpful_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const inquiries = pgTable("inquiries", {
  inquiryId: serial("inquiry_id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  status: inquiryStatusEnum("status").default("unread").notNull(),
  productId: integer("product_id").references(() => products.productId, { onDelete: "set null" }),
  userId: integer("user_id").references(() => users.userId, { onDelete: "set null" }),
  adminResponse: text("admin_response"),
  respondedBy: integer("responded_by").references(() => users.userId, { onDelete: "set null" }),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const subscribers = pgTable("subscribers", {
  subscriberId: serial("subscriber_id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const coupons = pgTable("coupons", {
  couponId: serial("coupon_id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0).notNull(),
  perUserLimit: integer("per_user_limit").default(1),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  appliesTo: jsonb("applies_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const sessions = pgTable("sessions", {
  sessionId: serial("session_id").primaryKey(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});