import express, { type Application } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRouter);

export default app;
