import { getAnalysisByMacroGroup } from "../lib/supabase-data.js";

export default async function handler(req: any, res: any) {
  try {
    const macroGroup = (req.query.macro_group || req.query.macroGroup || "SOJA") as string;
    const selectedDate = req.query.date as string | undefined;
    const data = await getAnalysisByMacroGroup(macroGroup, selectedDate);
    res.status(200).json(data);
  } catch (error) {
    console.error("Macro analysis data error:", error);
    res.status(500).json({ error: "Failed to fetch macro analysis data from Supabase" });
  }
}
