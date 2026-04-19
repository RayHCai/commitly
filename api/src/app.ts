import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { router } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
  skip: (req) => {
    // Exempt internal worker requests authenticated via service token
    return req.headers["x-service-token"] === env.SERVICE_TOKEN;
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again later" },
});

app.use("/auth", authLimiter);
app.use(apiLimiter);

app.use(router);

app.use(errorHandler);

export { app };
