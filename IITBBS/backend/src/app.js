import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouter from "./router/auth.routes.js";
import asteroidRouter from "./router/asteroid.routes.js";
import historyRouter from "./router/history.routes.js";
import { getAlerts } from "./controllers/asteroid.controller.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

app.use("/api/auth", authRouter);
app.use("/api/asteroids", asteroidRouter);
app.use("/api/history", historyRouter);
app.get("/api/alerts", getAlerts);

export default app;
