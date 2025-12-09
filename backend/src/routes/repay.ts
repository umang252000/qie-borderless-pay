import express from "express";
import { ReputationScore } from "../blockchain/contracts";

const router = express.Router();

router.post("/update-reputation", async (req, res) => {
  try {
    const { address, delta } = req.body;

    const tx = await ReputationScore.increaseScore(address, delta);
    await tx.wait();

    res.json({ success: true, tx: tx.hash });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;