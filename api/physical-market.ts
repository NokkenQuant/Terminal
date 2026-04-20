import { getPhysicalMarketData } from "../lib/supabase-data.js";

export default async function handler(_req: any, res: any) {
  try {
    const data = await getPhysicalMarketData();
    res.status(200).json(data);
  } catch (error) {
    console.error("Physical market data error:", error);
    res.status(500).json({ error: "Failed to fetch physical market data from Supabase" });
  }
}

