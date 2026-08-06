import { api } from "@/lib/api";

function isNetworkError(err) {
  const m = (err?.message || "").toLowerCase();
  return (
    m.includes("fetch") ||
    m.includes("network") ||
    m.includes("connection") ||
    m.includes("503") ||
    m.includes("502")
  );
}

/*
  adminService — متصل بـ Laravel API الحقيقي
  Endpoints:
    GET    /api/v1/admin/dashboard/quick-stats → إحصائيات سريعة
    GET    /api/v1/admin/customers             → قائمة المستخدمين
    DELETE /api/v1/admin/customers/:id         → حذف مستخدم
    GET    /api/v1/admin/sellers               → قائمة البائعين
    DELETE /api/v1/admin/sellers/:id           → حذف بائع
    GET    /api/v1/admin/orders                → جميع الطلبات
    PUT    /api/v1/admin/orders/:id/status     → تغيير حالة طلب
    GET    /api/v1/admin/dashboard/stats       → إحصائيات مفصلة
*/

function normalizeUser(u) {
  return {
    id: String(u.id),
    name: u.full_name || u.name || "",
    email: u.email || "",
    phone: u.phone || "",
    location: u.location || "",
    role: u.role || "customer",
    joined: u.created_at ? u.created_at.slice(0, 10) : "",
    image: u.image || null,
    isActive: u.is_active ?? true,
    totalSpent: parseFloat(u.total_spent) || 0,
    ordersCount: parseInt(u.orders_count) || 0,
    totalSales: parseInt(u.total_sales || u.products_count) || 0,
    totalRevenue: parseFloat(u.total_revenue) || 0,
  };
}

export const adminService = {
  /** قائمة كل المستخدمين (customers + sellers) */
  async users() {
    try {
      const [cRes, sRes] = await Promise.allSettled([
        api.get("/admin/customers"),
        api.get("/admin/sellers"),
      ]);
      const customers =
        cRes.status === "fulfilled"
          ? (cRes.value?.data?.data?.data || cRes.value?.data?.data || cRes.value?.data || []).map(
              (u) => ({
                ...normalizeUser(u),
                role: "customer",
              }),
            )
          : [];
      const sellers =
        sRes.status === "fulfilled"
          ? (sRes.value?.data?.data?.data || sRes.value?.data?.data || sRes.value?.data || []).map(
              (u) => ({
                ...normalizeUser(u),
                role: "seller",
              }),
            )
          : [];
      return [...customers, ...sellers];
    } catch (err) {
      if (isNetworkError(err)) {
        const { USERS } = await import("@/data/users");
        return USERS.map(({ password: _pw, ...u }) => u);
      }
      throw err;
    }
  },

  async addCustomer(payload) {
    return api.post("/admin/customers", payload);
  },

  async updateCustomer(id, payload) {
    return api.put(`/admin/customers/${id}`, payload);
  },

  async toggleBlockCustomer(id) {
    return api.put(`/admin/customers/${id}/toggle-block`);
  },

  async addSeller(payload) {
    return api.post("/admin/sellers", payload);
  },

  async updateSeller(id, payload) {
    return api.put(`/admin/sellers/${id}`, payload);
  },

  async toggleActiveSeller(id) {
    return api.put(`/admin/sellers/${id}/toggle-active`);
  },

  async deleteUser(id, role = "customer") {
    const path = role === "seller" ? `/admin/sellers/${id}` : `/admin/customers/${id}`;
    return api.delete(path);
  },

  async getFavorites() {
    const res = await api.get("/admin/favorites");
    return res?.data || { customers: [], sellers: [] };
  },

  async addFavoriteCustomer(id) {
    return api.post(`/admin/favorites/customer/${id}`);
  },

  async addFavoriteSeller(id) {
    return api.post(`/admin/favorites/seller/${id}`);
  },

  async removeFavorite(type, id) {
    return api.delete(`/admin/favorites/${type}/${id}`);
  },

  async stats() {
    try {
      const data = await api.get("/admin/dashboard/quick-stats");
      const d = data?.data || {};
      return {
        users: d.total_users ?? 0,
        sellers: 0,
        customers: d.total_users ?? 0,
        products: d.total_products ?? 0,
        orders: d.total_orders ?? 0,
        revenue: d.total_revenue ?? 0,
        pendingOrders: d.pending_orders ?? 0,
      };
    } catch {
      return {
        users: 0,
        sellers: 0,
        customers: 0,
        products: 0,
        orders: 0,
        revenue: 0,
        pendingOrders: 0,
      };
    }
  },

  async userGrowth() {
    const data = await api.get("/admin/dashboard/stats");
    return (data?.data?.monthly_sales || []).map((m) => ({
      month: m.month?.slice(0, 3) || "",
      users: m.orders_count || 0,
    }));
  },

  async activity() {
    return [
      { day: "Mon", logins: 0, orders: 0 },
      { day: "Tue", logins: 0, orders: 0 },
      { day: "Wed", logins: 0, orders: 0 },
      { day: "Thu", logins: 0, orders: 0 },
      { day: "Fri", logins: 0, orders: 0 },
      { day: "Sat", logins: 0, orders: 0 },
      { day: "Sun", logins: 0, orders: 0 },
    ];
  },

  async orders() {
    const data = await api.get("/admin/orders");
    return data?.data?.data || data?.data || [];
  },

  async updateOrderStatus(id, status) {
    return api.put(`/admin/orders/${id}/status`, { status });
  },

  // Categories management
  async categories() {
    const res = await api.get("/admin/categories");
    return res || { data: [], flat: [] };
  },

  async addCategory(payload) {
    return api.post("/admin/categories", payload);
  },

  async updateCategory(id, payload) {
    return api.put(`/admin/categories/${id}`, payload);
  },

  async deleteCategory(id) {
    return api.delete(`/admin/categories/${id}`);
  },

  // Products management
  async products(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        qs.append(k, String(v));
      }
    });
    const qString = qs.toString();
    const res = await api.get(`/admin/products${qString ? "?" + qString : ""}`);
    return res || { data: { data: [], last_page: 1 } };
  },

  async toggleProductActive(id, reason = null) {
    const body = reason ? { reason } : {};
    return api.put(`/admin/products/${id}/toggle-active`, body);
  },

  async updateProductStock(id, stock) {
    return api.put(`/admin/products/${id}/stock`, { stock_quantity: stock });
  },

  async deleteProduct(id, reason = "Deleted by admin") {
    return api.delete(`/admin/products/${id}`, { data: { reason } });
  },
};
