import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import riskRoute from "./routes/risk";
import repayRoute from "./routes/repay";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/risk", riskRoute);
app.use("/api", riskRoute);
app.use("/api", repayRoute);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = 4000;
app.listen(PORT, () => console.log("Risk Engine API running on port", PORT));