import { getAnalysis } from "../../lib/supabase-data.js";

export default async function handler(req: any, res: any) {
  try {
    const symbol = req.query.symbol as string;
    const data = await getAnalysis(symbol);
    res.status(200).json(data);
  } catch (error) {
    console.error("Analysis data error:", error);
    res.status(500).json({ error: "Failed to fetch analysis data from Supabase" });
  }
}
