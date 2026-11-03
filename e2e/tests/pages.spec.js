import { test, expect } from "@playwright/test";
import { loginAs, trackErrors } from "./helpers.js";

// Every page of every role must render without crashing or logging errors.
const PAGES = {
  admin: ["/adminpanel", "/adminpanel/adminprofile", "/adminpanel/allalumni", "/adminpanel/allcoordinators",
    "/adminpanel/allstudent", "/adminpanel/allteachers", "/adminpanel/createinstitution", "/adminpanel/manageinstitute",
    "/adminpanel/pendingalumni", "/adminpanel/pendingcoordinator", "/adminpanel/pendingstudent",
    "/adminpanel/pendingteacher", "/adminpanel/testimonials"],
  coordinator: ["/coordinatorlayout", "/coordinatorlayout/ManageDonation", "/coordinatorlayout/annualreport",
    "/coordinatorlayout/chat", "/coordinatorlayout/coordinatormyprofile", "/coordinatorlayout/createevent",
    "/coordinatorlayout/eventreport", "/coordinatorlayout/managestudents", "/coordinatorlayout/manageteacher",
    "/coordinatorlayout/managevolunteer", "/coordinatorlayout/myevents", "/coordinatorlayout/qrattendance",
    "/coordinatorlayout/recommendgracemark"],
  teacher: ["/teacherLayout", "/teacherLayout/announcement", "/teacherLayout/approvegracebyteacher",
    "/teacherLayout/assigngracemarks", "/teacherLayout/attendanceByTeacher", "/teacherLayout/attendancepdf",
    "/teacherLayout/myeventsteacher", "/teacherLayout/qrattendance", "/teacherLayout/teacherchat",
    "/teacherLayout/teacherprofile"],
  student: ["/studentlayout/dashboard", "/studentlayout/announcement", "/studentlayout/certificates",
    "/studentlayout/chatstudent", "/studentlayout/mentorshipchatlayout", "/studentlayout/mentorshiprequestbyvolunteer",
    "/studentlayout/mymentors", "/studentlayout/nssprogress", "/studentlayout/studentattendance",
    "/studentlayout/studentevents", "/studentlayout/studentprofile", "/studentlayout/studentupload"],
  alumni: ["/alumnilayout/dashboard", "/alumnilayout/alumniprofile", "/alumnilayout/donations",
    "/alumnilayout/feedback", "/alumnilayout/gallery", "/alumnilayout/managementorship",
    "/alumnilayout/mentorshipchatlayout", "/alumnilayout/testimonials"],
  public: ["/", "/login", "/signup/student", "/signup/teacher", "/signup/coordinator", "/signup/alumni",
    "/eventalbum", "/verify"],
};

const shotName = (path) => (path === "/" ? "home" : path.slice(1).replace(/\//g, "_"));

for (const [role, paths] of Object.entries(PAGES)) {
  test.describe(`${role} pages`, () => {
    for (const path of paths) {
      test(`${path} renders cleanly`, async ({ page }) => {
        if (role !== "public") await loginAs(page, role);
        const errors = trackErrors(page);

        const res = await page.goto(path, { waitUntil: "networkidle" });
        expect(res?.status(), "HTTP status").toBeLessThan(400);
        await expect(page.locator("body")).not.toContainText("Application error");
        if (role !== "public") await expect(page).toHaveURL(new RegExp(path.replace(/\//g, "\\/")));

        await page.screenshot({ path: `screenshots/${role}/${shotName(path)}.png`, fullPage: false });
        expect(errors, errors.join("\n")).toEqual([]);
      });
    }
  });
}
