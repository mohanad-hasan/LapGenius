/**
 * api.js — مركز اتصال الـ Frontend بـ Laravel REST API
 * Base URL: http://localhost:8000/api/v1
 */

const API_BASE_VALUE =
  import.meta.env.VITE_API_BASE || "https://cheerful-beauty-production.up.railway.app/api/v1";
export const API_BASE = API_BASE_VALUE;
export const BACKEND_BASE =
  import.meta.env.VITE_BACKEND_BASE || API_BASE_VALUE.replace(/\/api\/v1\/?$/, "");
export const WS_HTTP_BASE = import.meta.env.VITE_WS_HTTP_BASE || "http://localhost:8085";
export const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8085";

export function makeAbsoluteUrl(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;
  if (/^https?:\/\//i.test(str) || /^data:/i.test(str)) return str;
  const base = BACKEND_BASE.replace(/\/+$/, "");
  const path = str.replace(/^\/+/, "");
  return `${base}/${path}`;
}

/** رأس التوثيق من localStorage */
function authHeaders(extra = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("lg_token") : null;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/** طلب عادي JSON */
async function req(method, path, body, formData = false) {
  const token = typeof window !== "undefined" ? localStorage.getItem("lg_token") : null;
  const headers = formData
    ? {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    : authHeaders();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (formData ? body : JSON.stringify(body)) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && !path.includes("/auth/login")) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lg_token");
      localStorage.removeItem("lg_user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
  }

  if (!res.ok) {
    let msg = data?.message || data?.error || `HTTP ${res.status}`;
    if (data?.errors && typeof data.errors === "object") {
      const firstError = Object.values(data.errors)[0];
      if (Array.isArray(firstError)) msg = firstError[0];
      else if (typeof firstError === "string") msg = firstError;
    }
    throw new Error(msg);
  }

  return data;
}

export const api = {
  get: (path) => req("GET", path),
  post: (path, body) => req("POST", path, body),
  put: (path, body) => req("PUT", path, body),
  delete: (path) => req("DELETE", path),
  postForm: (path, formData) => req("POST", path, formData, true),
  putForm: (path, formData) => req("PUT", path, formData, true),
};
