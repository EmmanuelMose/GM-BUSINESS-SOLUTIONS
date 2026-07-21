import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./auth/auth.router";
import categoriesRouter from "./categories/categories.router";
import productsRouter from "./products/products.router";
import productVariantsRouter from "./productvariants/product-variants.router";
import subscribersRouter from "./subscribers/subscribers.router";
import inquiriesRouter from "./inquiries/inquiries.router";
import addressesRouter from "./addresses/addresses.router";
import wishlistRouter from "./wishlist/wishlist.router";
import cartRouter from "./cart/cart.router";
import couponsRouter from "./coupons/coupons.router";
import ordersRouter from "./orders/orders.router";
import reviewsRouter from "./reviews/reviews.router";
import paymentsRouter from "./payments/payment.router";
import usersRouter from "./users/users.router";
import adminsRouter from "./admins/admins.router";
import staffRouter from "./staff/staff.router";

dotenv.config();

const app = express();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/product-variants", productVariantsRouter);
app.use("/api/subscribers", subscribersRouter);
app.use("/api/inquiries", inquiriesRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/cart", cartRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/users", usersRouter);
app.use("/api/admins", adminsRouter);
app.use("/api/staff", staffRouter);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "E-commerce API is running",
  });
});

export default app;