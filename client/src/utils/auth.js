import { toast } from "react-toastify";

export const AUTH_KEYS = ["token", "role", "email", "name", "id"];

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getRole() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role");
}

export function clearSession() {
  if (typeof window === "undefined") return;
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}

// Full reload rather than router.replace: SocketProvider reads the token once on
// mount, so crossing an auth boundary must re-mount it to drop the stale socket auth.
export function logout({ redirectTo = "/login", delay = 1200 } = {}) {
  clearSession();
  toast.success("You have been logged out");
  setTimeout(() => {
    window.location.href = redirectTo;
  }, delay);
}
