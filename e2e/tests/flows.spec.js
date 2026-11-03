import { test, expect } from "@playwright/test";
import { API, EMAIL, PASSWORD, loginAs, trackErrors } from "./helpers.js";

test("login form: wrong password shows a message, right password lands on the dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', EMAIL.coordinator);
  await page.fill('input[name="password"]', "wrong-password");
  await page.locator('form button[type="submit"]').click();
  await expect(page.getByText("Invalid email or password")).toBeVisible();

  await page.fill('input[name="password"]', PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/coordinatorlayout/, { timeout: 10_000 });
  expect(await page.evaluate(() => localStorage.getItem("role"))).toBe("coordinator");
});

test("protected pages redirect to login without a session", async ({ page }) => {
  await page.goto("/studentlayout/nssprogress");
  await expect(page).toHaveURL(/\/login/);
});

test("QR check-in: teacher shows a code, volunteer scans it and is checked in", async ({ page, browser }) => {
  const teacher = await loginAs(page, "teacher");
  const headers = { Authorization: `Bearer ${teacher.token}` };

  // Find the seeded running event and fetch the code the teacher's screen would show.
  const events = await (await page.request.get(`${API}/api/teacher/teachermyevents`, { headers })).json();
  const ongoing = events.data.find((e) => e.status === "Ongoing");
  const qr = await (await page.request.get(`${API}/api/events/${ongoing._id}/qr`, { headers })).json();
  const before = qr.stats.checkedIn;

  // The teacher's QR page renders the code.
  await page.goto("/teacherLayout/qrattendance");
  await expect(page.getByRole("heading", { name: ongoing.title })).toBeVisible();
  await expect(page.locator("svg[aria-label='Check-in QR code']")).toBeVisible();

  // A volunteer opens the scanned link on their phone.
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = trackErrors(phone);
  const vol = await phone.request.post(`${API}/api/auth/login`, {
    data: { email: "volunteer2@demo.synapsis.test", password: PASSWORD },
  });
  const session = await vol.json();
  await phone.addInitScript((s) => {
    localStorage.setItem("token", s.token);
    localStorage.setItem("role", s.role);
  }, session);
  await phone.goto(new URL(qr.url).pathname + new URL(qr.url).search);
  await expect(phone.getByRole("heading", { name: "Checked in" })).toBeVisible();
  await expect(phone.getByText(ongoing.title)).toBeVisible();
  await phone.screenshot({ path: "screenshots/flows/checkin_phone.png" });
  expect(errors).toEqual([]);

  const after = await (await page.request.get(`${API}/api/events/${ongoing._id}/qr`, { headers })).json();
  expect(after.stats.checkedIn).toBe(before + 1);
  await phone.close();
});

test("certificate: volunteer downloads it, anyone can verify the code", async ({ page, browser }) => {
  const student = await loginAs(page, "student");
  const headers = { Authorization: `Bearer ${student.token}` };
  const { events } = await (await page.request.get(`${API}/api/students/my-events`, { headers })).json();
  const done = events.find((e) => e.status === "Completed");

  const pdf = await page.request.get(`${API}/api/students/generate/${done._id}`, { headers });
  expect(pdf.headers()["content-type"]).toBe("application/pdf");

  await page.goto("/studentlayout/certificates");
  const codeLink = page.locator('a[href^="/verify/"]').first();
  await expect(codeLink).toBeVisible();
  const code = (await codeLink.textContent()).trim();

  // A logged-out visitor (an employer) checks it.
  const visitor = await browser.newPage();
  await visitor.goto(`/verify/${code}`);
  await expect(visitor.getByText("Valid certificate")).toBeVisible();
  await expect(visitor.getByText(done.title)).toBeVisible();
  await visitor.screenshot({ path: "screenshots/flows/verify_valid.png" });

  await visitor.goto("/verify/ZZZZZZZZZZ");
  await expect(visitor.getByText("No certificate found")).toBeVisible();
  await visitor.close();
});
