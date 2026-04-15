import { getHistorical } from "../../lib/supabase-data.js";

export default async function handler(req: any, res: any) {
  try {
    const symbol = req.query.symbol as string;
    const startDate = (req.query.startDate as string) || "2000-01-01";
    const endDate = (req.query.endDate as string) || "2100-01-01";
    const data = await getHistorical(symbol, startDate, endDate);
    res.status(200).json(data);
  } catch (error) {
    console.error("Historical data error:", error);
    res.status(500).json({ error: "Failed to fetch historical data from Supabase" });
  }
}
