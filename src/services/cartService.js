import { api, makeAbsoluteUrl } from "@/lib/api";

const KEY = "lg_cart";

export const cartService = {
  // Local storage helpers for guest users
  load() {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  },

  save(items) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(items));
  },

  // Backend API calls for authenticated customer users
  async getCart() {
    const res = await api.get("/customer/cart");
    if (res?.success && res?.data) {
      const items = res.data.items || [];
      return items.map((item) => ({
        id: item.product_id,
        name: item.product_name,
        price: item.price_after_discount,
        aiPrice: item.price_after_discount,
        image: item.image
          ? makeAbsoluteUrl(item.image)
          : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        color: null, // Backend does not persist color in cart_items table
        qty: item.quantity,
        cartItemId: item.id,
      }));
    }
    return [];
  },

  async add(productId, quantity = 1) {
    return api.post("/customer/cart", { product_id: productId, quantity });
  },

  async update(cartItemId, quantity) {
    return api.put(`/customer/cart/${cartItemId}`, { quantity });
  },

  async remove(cartItemId) {
    return api.delete(`/customer/cart/${cartItemId}`);
  },

  async clear() {
    return api.delete("/customer/cart/clear");
  },
};
