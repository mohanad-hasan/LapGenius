import { api } from "@/lib/api";

const KEY = "lg_wishlist";

export const wishlistService = {
  load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  },
  save(ids) {
    localStorage.setItem(KEY, JSON.stringify(ids));
  },
  async getWishlist() {
    const data = await api.get("/customer/wishlist");
    // The backend returns an array of items, where each item contains product_id
    return data?.data?.map(item => item.product_id) || [];
  },
  async add(productId) {
    return await api.post(`/customer/wishlist/${productId}`);
  },
  async remove(productId) {
    return await api.delete(`/customer/wishlist/${productId}`);
  }
};
