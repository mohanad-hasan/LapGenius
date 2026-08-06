import { api, makeAbsoluteUrl } from "@/lib/api";

/*
  authService — يتصل بـ Laravel API، ويرجع إلى Mock data عند انقطاع الاتصال
  Endpoints:
    POST /api/v1/auth/login           → { user, token }
    POST /api/v1/auth/register        → { user, token }
    POST /api/v1/auth/logout          → { message }
    POST /api/v1/auth/change-password → { message }
    GET  /api/v1/auth/me              → { user }
*/

function normalizeUser(raw) {
  let imageUrl = raw.image || null;
  if (imageUrl) {
    imageUrl = makeAbsoluteUrl(imageUrl);
  }

  return {
    id: String(raw.id || ""),
    name: raw.full_name || raw.name || "",
    email: raw.email || "",
    phone: raw.phone || "",
    role: raw.role || "customer",
    joined: raw.created_at ? String(raw.created_at).slice(0, 10) : "",
    image: imageUrl,
  };
}

// ---- Mock Fallback (للتطوير المحلي بدون باك-إند) ----
async function mockLogin(email, password) {
  const { USERS } = await import("@/data/users");
  const found = USERS.find((u) => u.email === email && u.password === password);
  if (!found) throw new Error("Invalid credentials");
  const { password: _pw, ...user } = found;
  const token = "mock-token-" + user.id;
  return { user: { ...user, joined: user.joined || "" }, token };
}

async function mockRegister({ name, email, phone, password, role = "customer" }) {
  const { USERS } = await import("@/data/users");
  const exists = USERS.find((u) => u.email === email);
  if (exists) throw new Error("Email already exists");
  const id = "u" + (USERS.length + 1);
  const user = { id, name, email, phone, role, joined: new Date().toISOString().slice(0, 10) };
  USERS.push({ ...user, password });
  const token = "mock-token-" + id;
  return { user, token };
}

// ---- API Calls with Fallback ----

export const authService = {
  async login(email, password) {
    try {
      const data = await api.post("/auth/login", { email, password });
      const token = data.token || data.access_token || data.data?.token || data.data?.access_token;
      const raw = data.user || data.data?.user || data.data || {};
      const user = normalizeUser(raw);
      if (token) localStorage.setItem("lg_token", token);
      return { user, token };
    } catch (err) {
      console.error("[authService] Login failed:", err);
      // fallback عند انقطاع الاتصال
      if (isNetworkError(err)) {
        console.warn("[authService] API unavailable, using mock data");
        return mockLogin(email, password);
      }
      throw err;
    }
  },

  async register({ name, email, phone, password, role = "customer" }) {
    try {
      const data = await api.post("/auth/register", {
        full_name: name,
        email,
        phone,
        password,
        password_confirmation: password,
        role,
        terms_accepted: true,
      });
      const token = data.token || data.access_token || data.data?.token || data.data?.access_token;
      const raw = data.user || data.data?.user || data.data || {};
      const user = normalizeUser(raw);
      if (token) localStorage.setItem("lg_token", token);
      return { user, token };
    } catch (err) {
      console.error("[authService] Register failed:", err);
      if (isNetworkError(err)) {
        console.warn("[authService] API unavailable, using mock data");
        return mockRegister({ name, email, phone, password, role });
      }
      throw err;
    }
  },

  async logout() {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // تجاهل الأخطاء عند تسجيل الخروج
    } finally {
      localStorage.removeItem("lg_token");
    }
    return { ok: true };
  },

  async me() {
    try {
      const data = await api.get("/auth/me");
      return normalizeUser(data.user || data.data || data);
    } catch {
      return null;
    }
  },

  async forgotPassword(email) {
    return api.post("/auth/forgot-password", { email });
  },

  async verifyCode(email, token) {
    return api.get(
      `/auth/reset-password/check?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
    );
  },

  async resetPassword(email, password, token) {
    return api.post("/auth/reset-password", {
      email,
      password,
      password_confirmation: password,
      token,
    });
  },

  async changePassword(current, next) {
    return api.post("/auth/change-password", {
      current_password: current,
      new_password: next,
      new_password_confirmation: next,
    });
  },
};

/** هل الخطأ بسبب انقطاع الاتصال بالسيرفر؟ */
function isNetworkError(err) {
  const msg = (err?.message || "").toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("connection") ||
    msg.includes("err_connection_refused") ||
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("504")
  );
}
