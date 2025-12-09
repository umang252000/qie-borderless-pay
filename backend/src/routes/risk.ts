import { Router } from "express";
import { getRiskScore } from "../riskEngine/score";

const router = Router();

// Example: http://localhost:4000/risk/score?wallet=0x123...
router.get("/score", async (req, res) => {
  try {
    const wallet = req.query.wallet as string;
    
    if (!wallet) {
      return res.status(400).json({ error: "wallet query param required" });
    }

    const risk = await getRiskScore(wallet);
    res.json({ wallet, risk });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;