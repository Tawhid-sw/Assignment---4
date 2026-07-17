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

import swaggerUi from "swagger-ui-express";
import { load } from "js-yaml";
import fs from "fs";
import path from "path";

const app: Application = express();

app.use(
  cors({
    origin: config.APP_URL,
    credentials: true,
  }),
);

app.use("/api/payments/confirm", express.raw({ type: "application/json" }));

const swaggerDocument = load(
  fs.readFileSync(path.join(process.cwd(), "api-docs.yaml"), "utf8"),
) as object;

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/gear", gearRouter);
app.use("/api/rentals", rentalRouter);
app.use("/api/provider/orders", providerOrderRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
