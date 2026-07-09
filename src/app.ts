import express, { type Application } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import cors from "cors";
import { config } from "./config";
import categoryRouter from "./modules/category/category.routes";

const app: Application = express();

app.use(
  cors({
    origin: config.APP_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRouter);
app.use("/api/category", categoryRouter);

app.use(notFound);

app.use(globalErrorHandler);

export default app;
