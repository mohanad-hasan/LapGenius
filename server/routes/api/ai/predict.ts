// Nitro server route: /api/ai/predict
// Proxies POST /predict server-side (no CORS).
import { defineEventHandler, readBody } from "h3";

const AI_BASE = "https://lapgenius-ai.onrender.com";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const upstream = await fetch(`${AI_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  return data;
});
