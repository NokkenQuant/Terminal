import dotenv from "dotenv";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { getAnalysis, getHistorical, getMarketData } from "./lib/supabase-data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000);

  app.use(express.json());

  app.get("/api/market-data", async (_req, res) => {
    try {
      const data = await getMarketData();
      res.json(data);
    } catch (error) {
      console.error("Market data error:", error);
      res.status(500).json({ error: "Failed to fetch market data from Supabase" });
    }
  });

  app.get("/api/analysis/:symbol", async (req, res) => {
    try {
      const data = await getAnalysis(req.params.symbol);
      res.json(data);
    } catch (error) {
      console.error("Analysis data error:", error);
      res.status(500).json({ error: "Failed to fetch analysis data from Supabase" });
    }
  });

  app.get("/api/historical/:symbol", async (req, res) => {
    try {
      const startDate = (req.query.startDate as string) || "2000-01-01";
      const endDate = (req.query.endDate as string) || "2100-01-01";
      const data = await getHistorical(req.params.symbol, startDate, endDate);
      res.json(data);
    } catch (error) {
      console.error("Historical data error:", error);
      res.status(500).json({ error: "Failed to fetch historical data from Supabase" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
