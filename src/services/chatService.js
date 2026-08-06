import { api, WS_HTTP_BASE } from "@/lib/api";

const WS_HTTP = WS_HTTP_BASE;

export const chatService = {
  // ── Customer ──────────────────────────────────────────────────────────────

  /** Get all sellers (with unread counts & last message) */
  async getSellers() {
    const res = await api.get("/customer/chat/sellers");
    return res?.data || res || [];
  },

  /** Start or get conversation with a seller */
  async startConversation(sellerId) {
    const res = await api.post("/customer/chat/conversations", { seller_id: sellerId });
    return res?.data || res;
  },

  /** List customer's conversation inbox */
  async getCustomerConversations() {
    const res = await api.get("/customer/chat/conversations");
    return res?.data || res || [];
  },

  /** Get full conversation (with messages) for customer */
  async getCustomerConversation(conversationId) {
    const res = await api.get(`/customer/chat/conversations/${conversationId}`);
    return res?.data || res;
  },

  /** Customer sends a message */
  async customerSend(conversationId, body) {
    const res = await api.post(`/customer/chat/conversations/${conversationId}/messages`, { body });
    return res?.data || res;
  },

  // ── Seller ────────────────────────────────────────────────────────────────

  /** List seller's conversation inbox */
  async getSellerConversations() {
    const res = await api.get("/seller/chat/conversations");
    return res?.data || res || [];
  },

  /** Get full conversation (with messages) for seller */
  async getSellerConversation(conversationId) {
    const res = await api.get(`/seller/chat/conversations/${conversationId}`);
    return res?.data || res;
  },

  /** Seller sends a message */
  async sellerSend(conversationId, body) {
    const res = await api.post(`/seller/chat/conversations/${conversationId}/messages`, { body });
    return res?.data || res;
  },

  // ── Presence ──────────────────────────────────────────────────────────────

  /** Returns array of user-ID strings that are currently connected to the WS server */
  async getOnlineUsers() {
    try {
      const r = await fetch(`${WS_HTTP}/online-users`);
      const json = await r.json();
      return json.online_users || [];
    } catch {
      return [];
    }
  },
};
