export async function fetchRisk(wallet: string) {
  const res = await fetch(`http://localhost:4000/api/risk/score?wallet=${wallet}`);
  return res.json();
}