import { api, makeAbsoluteUrl } from "@/lib/api";
import { getProductStockOverride } from "@/services/orderStockManager";

/*
  productService — متصل بـ Laravel API الحقيقي
  Endpoints:
    GET /api/v1/products        → جميع المنتجات
    GET /api/v1/products/:id    → منتج محدد
    GET /api/v1/products/search → بحث
    GET /api/v1/products/filter → فلترة
    GET /api/v1/products/latest → أحدث المنتجات
*/

function normalizeCategory(cat) {
  if (!cat) return "";
  const name = (typeof cat === "object" ? cat.name : cat) || "";
  const lower = name.toLowerCase();
  if (lower.includes("gaming") || lower.includes("ألعاب")) return "Gaming";
  if (lower.includes("office") || lower.includes("business") || lower.includes("عمل مكتبي"))
    return "Business";
  if (lower.includes("programming") || lower.includes("برمجة")) return "Programming";
  if (lower.includes("design") || lower.includes("تصميم")) return "Design";
  if (lower.includes("study") || lower.includes("دراسة")) return "Study";
  if (lower.includes("general") || lower.includes("عام")) return "General";
  if (lower.includes("lightweight")) return "Lightweight";
  return name;
}

function normalizeCondition(cond) {
  if (!cond) return "New";
  const c = cond.toLowerCase();
  if (c === "new") return "New";
  if (c === "used") return "Used";
  if (c === "refurbished") return "Refurbished";
  return cond;
}

function normalizeProduct(p) {
  // Backend returns relationship as product_images with field image_path
  const imgs = p.product_images || p.images || [];
  const primaryImg = imgs.find((i) => i.is_primary) || imgs[0];
  const primaryImageUrl = primaryImg
    ? makeAbsoluteUrl(primaryImg.image_path || primaryImg.url || primaryImg.path)
    : p.primary_image_url ||
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80";

  const allImages = imgs.length
    ? imgs.map((i) => makeAbsoluteUrl(i.image_path || i.url || i.path))
    : [primaryImageUrl];

  return {
    id: p.id,
    name: p.name || "",
    brand: p.brand || "",
    category: normalizeCategory(p.category),
    condition: normalizeCondition(p.condition),
    price: parseFloat(p.price) || 0,
    discountPercent: parseFloat(p.discount_percent) || 0,
    discountedPrice: parseFloat(p.discounted_price) || parseFloat(p.price) || 0,
    aiPrice: parseFloat(p.ai_estimated_price || p.price) || 0,
    stock: getProductStockOverride(p.id) ?? (p.stock_quantity ?? p.stock ?? 0),
    description: p.description || "",
    cpu: p.cpu_type || p.specifications?.cpu || "",
    gpu: p.gpu_type || p.specifications?.gpu || null,
    igpu: p.igpu || p.specifications?.igpu || null,
    ram: p.ram_size || p.specifications?.ram || "",
    storage: p.storage_size || p.specifications?.storage || "",
    os: p.os || p.specifications?.os || "Windows 11",
    screen: p.screen_size || p.specifications?.screen || "",
    battery: p.battery_capacity || p.specifications?.battery || "",
    deviceType: p.device_type || "",
    recommendedUsage: p.recommended_usage || p.category?.name || "",
    rating: parseFloat(p.average_rating) || 0,
    reviewsCount: p.reviews_count || 0,
    sales: parseInt(p.total_sold) || 0,
    is_active: p.is_active !== false, // default true if not specified
    seller: {
      id: String(p.seller_id || p.seller?.id || ""),
      name: p.seller?.full_name || p.seller?.name || "",
      rating: parseFloat(p.seller?.rating) || 4.5,
    },
    colors: [
      {
        name: "Default",
        hex: "#222",
        images: allImages,
      },
    ],
  };
}

export const productService = {
  async all(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const data = await api.get(`/products${qs ? "?" + qs : ""}`);
    return (data?.data?.data || data?.data || []).map(normalizeProduct);
  },

  async get(id) {
    const data = await api.get(`/products/${id}`);
    return normalizeProduct(data?.data || data);
  },

  async search(q) {
    const data = await api.get(`/products/search?q=${encodeURIComponent(q)}`);
    return (data?.data?.data || data?.data || []).map(normalizeProduct);
  },

  async filter(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const data = await api.get(`/products/filter?${qs}`);
    return (data?.data?.data || data?.data || []).map(normalizeProduct);
  },

  async latest() {
    const data = await api.get("/products/latest");
    return (data?.data || []).map(normalizeProduct);
  },

  async popular() {
    const data = await api.get("/products/popular");
    return (data?.data || []).map(normalizeProduct);
  },

  async reviews(productId) {
    const data = await api.get(`/products/${productId}/reviews`);
    return data?.data?.data || data?.data || [];
  },

  async categories() {
    const data = await api.get("/categories");
    return data?.data || [];
  },
};
