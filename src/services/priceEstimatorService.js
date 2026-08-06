// Price estimator — POST /predict via Vite dev proxy /ai-api
// Response: { predicted_price: number }
export const priceEstimatorService = {
  async estimate({ brand = "", cpu, gpu, ram, storage, condition }) {
    const body = {
      brand: brand || "",
      cpu: cpu || "",
      ram: ram || "",
      hard: storage || "",
      gpu: gpu || "",
      new: condition === "New",
    };

    const res = await fetch("/ai-api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Predict failed (${res.status})`);
    return await res.json(); // { predicted_price: number }
  },
};
