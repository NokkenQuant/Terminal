import { getPhysicalMarketHistory } from "../../lib/supabase-data.js";

export default async function handler(req: any, res: any) {
  try {
    const commodity = String(req.query.commodity || "");
    const variable = String(req.query.variable || "");
    const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
    if (!commodity || !variable) {
      res.status(400).json({ error: "commodity and variable are required" });
      return;
    }
    const data = await getPhysicalMarketHistory(commodity, variable, startDate);
    res.status(200).json(data);
  } catch (error) {
    console.error("Physical market history error:", error);
    res.status(500).json({ error: "Failed to fetch physical market history from Supabase" });
  }
}

