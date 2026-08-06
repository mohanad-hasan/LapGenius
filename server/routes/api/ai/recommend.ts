// Nitro server route: /api/ai/recommend
// Proxies POST /recommend to Railway server-side (no CORS).
import { defineEventHandler, readBody } from "h3";

const AI_BASE = "https://lapgeniusai-production.up.railway.app";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const upstream = await fetch(`${AI_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  return data;
});
