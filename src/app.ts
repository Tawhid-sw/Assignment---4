import express, { type Application } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import cors from "cors";
import { config } from "./config";
import categoryRouter from "./modules/category/category.routes";
import gearRouter from "./modules/gear/gear.routes";
import rentalRouter from "./modules/rental/rental.routes";
import providerOrderRouter from "./modules/rental/provider-order.routes";
import paymentRouter from "./modules/payment/payment.routes";
import reviewRouter from "./modules/review/review.routes";
import adminRouter from "./modules/admin/admin.routes";

const app: Application = express();

app.use(
  cors({
    origin: config.APP_URL,
    credentials: true,
  }),
);

app.use("/api/payments/confirm", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRouter);
app.use("/api/categorys", categoryRouter);
app.use("/api/gear", gearRouter);
app.use("/api/rentals", rentalRouter);
app.use("/api/provider/orders", providerOrderRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
