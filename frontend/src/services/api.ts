const API_BASE = import.meta.env.VITE_BACKEND_URL;

export async function fetchRisk(address: string) {
  const res = await fetch(`${API_BASE}/risk/${address}`);
  return await res.json();
}
