import axios from "axios";
import { API_URL } from "@/utils/config";
import { clearSession, getToken } from "@/utils/auth";

/**
 * Single place that knows how we talk to the backend.
 *  - `api`: preconfigured instance for new code: api.get("/api/...")
 *  - installAxiosInterceptors(): retrofits the same behaviour onto the global
 *    axios used by existing pages (adds the token, handles expired sessions).
 * Moving to cookie auth later only requires changing this file.
 */
export const api = axios.create({ baseURL: API_URL });

const isBackendUrl = (config) => {
  const url = config.url || "";
  return Boolean(config.baseURL) || (API_URL && url.startsWith(API_URL)) || url.startsWith("/api/");
};

// Endpoints where 401 means "wrong credentials", not "session expired".
const AUTH_PATHS = ["/login", "login", "verify-otp", "verifyotp", "signup"];
const isAuthCall = (url = "") => AUTH_PATHS.some((p) => url.includes(p));

const attachToken = (config) => {
  if (!isBackendUrl(config)) return config;
  const token = getToken();
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

let redirecting = false;
const handleExpiredSession = (error) => {
  const { config, response } = error;
  if (
    typeof window !== "undefined" &&
    response?.status === 401 &&
    config &&
    isBackendUrl(config) &&
    !isAuthCall(config.url) &&
    getToken() &&
    !redirecting
  ) {
    redirecting = true;
    clearSession();
    window.location.href = "/login?error=Your session has expired. Please log in again.";
  }
  return Promise.reject(error);
};

for (const instance of [api]) {
  instance.interceptors.request.use(attachToken);
  instance.interceptors.response.use((r) => r, handleExpiredSession);
}

let installed = false;
export const installAxiosInterceptors = () => {
  if (installed) return;
  installed = true;
  axios.interceptors.request.use(attachToken);
  axios.interceptors.response.use((r) => r, handleExpiredSession);
};
