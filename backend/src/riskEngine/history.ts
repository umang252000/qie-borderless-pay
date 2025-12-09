import { ReputationScore } from "../blockchain/contracts";

export async function getLoanHistory(address: string) {
  // For now use on-chain reputation + random data
  const rep = await ReputationScore.getScore(address);

  return {
    totalLoans: Math.floor(Math.random() * 5),
    onTimeRepayments: rep > 50 ? 3 : 1,
    lateRepayments: rep < 20 ? 2 : 0,
    avgLoanSize: 0.05 + Math.random() * 1.5,
  };
}