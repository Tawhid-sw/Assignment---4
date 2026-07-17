import express, {
  type Application,
  type Request,
  type Response,
} from "express";
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

// Load API spec
const swaggerDocument = load(
  fs.readFileSync(path.join(process.cwd(), "api-docs.yaml"), "utf8"),
) as object;

// Serve spec as JSON endpoint
app.get("/api-docs.json", (req: Request, res: Response) => {
  res.json(swaggerDocument);
});

// Serve Swagger UI with CDN assets
app.get("/api-docs", (req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GearUp API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/api-docs.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [SwaggerUIBundle.plugins.DownloadUrl],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
  `);
});

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
