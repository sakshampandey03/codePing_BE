import { computeCohortAverage } from "../services/cohort.js";

export const updateCohort = async (req, res) => {
  const { label } = req.params;
  try {
    const result = await computeCohortAverage(label);
    if (!result) return res.status(404).json({ error: "No members found" });
    res.json({ success: true, stats: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
