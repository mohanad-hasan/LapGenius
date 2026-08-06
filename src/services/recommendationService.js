// Recommendation service — POST /recommend via Vite dev proxy /ai-api
// Response: { best_performance, best_value, top_k, meta }
// NOTE: use_case must be lowercase. "business" and "study" cause 500 on the API — mapped to safe values.
const USE_CASE_MAP = {
  Gaming: "gaming",
  Programming: "programming",
  Design: "design",
  Business: "general",  // "business" causes 500 on the API — fallback to "general"
  Study: "general",     // "study" causes 500 on the API — fallback to "general"
};

export const recommendationService = {
  async recommend({ budget, usage }) {
    const body = {
      use_case: USE_CASE_MAP[usage] ?? usage.toLowerCase(),
      budget: Number(budget),
    };

    const res = await fetch("/ai-api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Recommend failed (${res.status})`);
    return await res.json(); // { best_performance, best_value, top_k, meta }
  },
};
