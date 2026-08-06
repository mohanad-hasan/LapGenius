import { api } from "@/lib/api";

export const notificationService = {
  async list(role) {
    const path =
      role === "admin"
        ? "/admin/notifications"
        : role === "seller"
          ? "/seller/notifications"
          : "/customer/notifications";
    const res = await api.get(path);
    return {
      notifications: res?.data?.data || res?.data || [],
      unreadCount: res?.unread_count || res?.data?.unread_count || 0,
    };
  },

  async markAsRead(role, id) {
    const path =
      role === "admin"
        ? `/admin/notifications/${id}/read`
        : role === "seller"
          ? `/seller/notifications/${id}/read`
          : `/customer/notifications/${id}/read`;
    return api.put(path, {});
  },

  async markAllAsRead(role) {
    const path =
      role === "admin"
        ? "/admin/notifications/read-all"
        : role === "seller"
          ? "/seller/notifications/read-all"
          : "/customer/notifications/read-all";
    return api.put(path, {});
  },

  async send(payload) {
    // Only available to admin
    return api.post("/admin/notifications/send", payload);
  },
};
