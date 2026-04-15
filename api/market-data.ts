import { getMarketData } from "../lib/supabase-data";

export default async function handler(_req: any, res: any) {
  try {
    const data = await getMarketData();
    res.status(200).json(data);
  } catch (error) {
    console.error("Market data error:", error);
    res.status(500).json({ error: "Failed to fetch market data from Supabase" });
  }
}

