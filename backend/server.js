import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";
import deployRoutes from "./routes/deploy.js";

const app = express();

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "daniel-ai-studio-backend" }));

app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/deploy", deployRoutes);

// Central error handler — never leak stack traces to the client.
app.use((err, _req, res, _next) => {
  console.error("[unhandled]", err);
  res.status(500).json({ error: "Something went wrong on our end." });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Daniel AI Studio backend listening on port ${PORT}`);
});
