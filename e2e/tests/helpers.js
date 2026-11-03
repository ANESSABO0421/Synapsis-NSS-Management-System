import { expect } from "@playwright/test";

export const API = "http://localhost:3000";
export const PASSWORD = "Demo@1234";
export const EMAIL = {
  admin: "superadmin@demo.synapsis.test",
  coordinator: "coordinator@demo.synapsis.test",
  teacher: "teacher@demo.synapsis.test",
  student: "volunteer1@demo.synapsis.test",
  alumni: "alumni@demo.synapsis.test",
};

const sessions = new Map();

/** Log in through the API (once per role) and store the session like the login page does. */
export async function loginAs(page, role) {
  let body = sessions.get(role);
  if (!body) {
    const res = await page.request.post(`${API}/api/auth/login`, {
      data: { email: EMAIL[role], password: PASSWORD },
    });
    expect(res.ok(), `login ${role}`).toBeTruthy();
    body = await res.json();
    sessions.set(role, body);
  }
  await page.addInitScript((s) => {
    localStorage.setItem("token", s.token);
    localStorage.setItem("role", s.role);
    localStorage.setItem("email", s.email);
  }, { token: body.token, role: body.role, email: body.user.email });
  return body;
}

/** Collect uncaught page errors and console errors for later assertion. */
export function trackErrors(page) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    // Expected noise: missing optional images, and the browser's own log of 4xx responses.
    if (/Failed to load resource|favicon|net::ERR_/i.test(text)) return;
    errors.push(`console: ${text}`);
  });
  return errors;
}
