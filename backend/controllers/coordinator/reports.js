import Coordinator from "../../models/Coordinator.js";
import Event from "../../models/Event.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { groq } from "../../utils/ai.js";

export const generateEventReport = async (req, res) => {
  try {
    const { eventId } = req.params;

    // AUTH CHECK
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    // GET EVENT DATA
    const event = await Event.findById(eventId)
      .populate("assignedTeacher", "name")
      .populate("assignedCoordinators", "name")
      .populate("participants", "name department status");

    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    if (String(event.institution) !== String(coordinator.institution)) {
      return res.status(403).json({
        success: false,
        message: "Event does not belong to your institution",
      });
    }

    // NORMALIZE ARRAYS
    const assignedCoordinators = Array.isArray(event.assignedCoordinators)
      ? event.assignedCoordinators
      : event.assignedCoordinators
      ? [event.assignedCoordinators]
      : [];

    const assignedTeachers = Array.isArray(event.assignedTeacher)
      ? event.assignedTeacher
      : event.assignedTeacher
      ? [event.assignedTeacher]
      : [];

    const participants = Array.isArray(event.participants)
      ? event.participants
      : event.participants
      ? [event.participants]
      : [];

    /* --------------------------------------------------------
        ⭐ AI SUMMARY
    ---------------------------------------------------------*/
    let aiSummary = "Summary unavailable.";

    try {
      const prompt = `
You are generating an official NSS (National Service Scheme) event report.

Event Title: ${event.title}
Description: ${event.description || "No description provided"}
Date: ${new Date(event.date).toDateString()}
Location: ${event.location}
Duration: ${event.hours} hours
Coordinators: ${assignedCoordinators.map((c) => c.name).join(", ")}
Teachers: ${assignedTeachers.map((t) => t.name).join(", ")}
Participants Count: ${participants.length}

Write a rich, detailed, professional 120–180 word summary highlighting objectives, activities, participation, outcomes, and impact.
`;

      const aiRes = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      });

      aiSummary = aiRes.choices[0]?.message?.content || aiSummary;
      aiSummary = aiSummary.replace(/\*\*/g, "");
    } catch (err) {
      console.error("AI ERROR:", err);
    }

    /* --------------------------------------------------------
        📄 PDF GENERATION
    ---------------------------------------------------------*/
    const uploadsDir = "uploads";
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const fileName = `event_report_${event._id}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      bufferPages: true,
      autoFirstPage: true,
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // SHIFT AMOUNT
    const SHIFT_X = 50;

    /* --------------------------------------------------------
       🌿 HEADER
    ---------------------------------------------------------*/
    doc.rect(0, 0, doc.page.width, 65).fill("#00A63E");
    doc
      .fill("#ffffff")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("NSS EVENT REPORT", 0, 20, {
        align: "center",
        width: doc.page.width,
      });
    doc.moveDown(2);

    /* --------------------------------------------------------
       SECTION TITLE FUNCTION
    ---------------------------------------------------------*/
    const sectionTitle = (title) => {
      doc
        .fillColor("#00A63E")
        .fontSize(15)
        .font("Helvetica-Bold")
        .text(title, SHIFT_X);

      doc
        .moveTo(SHIFT_X, doc.y + 3)
        .lineTo(550, doc.y + 3)
        .strokeColor("#00A63E")
        .stroke();

      doc.moveDown(0.8);
    };

    const detailRow = (label, value) => {
      doc
        .font("Helvetica-Bold")
        .fillColor("#222")
        .fontSize(11)
        .text(label, SHIFT_X, doc.y, { continued: true });

      doc
        .font("Helvetica")
        .fillColor("#444")
        .text(` : ${value || "N/A"}`);

      doc.moveDown(0.4);
    };

    /* --------------------------------------------------------
       📌 EVENT DETAILS (SHIFTED RIGHT)
    ---------------------------------------------------------*/
    sectionTitle("Event Details");

    detailRow("Event Title", event.title);
    detailRow("Date", new Date(event.date).toDateString());
    detailRow("Location", event.location);
    detailRow("Duration", `${event.hours} hours`);
    detailRow("Status", event.status);

    /* --------------------------------------------------------
       TEAM INFORMATION (SHIFTED RIGHT)
    ---------------------------------------------------------*/
    doc.moveDown(1.3);
    sectionTitle("Team Information");

    detailRow(
      "Coordinators",
      assignedCoordinators.map((c) => c.name).join(", ")
    );

    detailRow("Teachers", assignedTeachers.map((t) => t.name).join(", "));

    /* --------------------------------------------------------
       ⭐ AI SUMMARY BOX (SHIFTED RIGHT)
    ---------------------------------------------------------*/
    doc.moveDown(1.3);
    sectionTitle("AI Generated Event Summary");

    const startY = doc.y;
    const summaryWidth = 500 - SHIFT_X;
    const summaryX = SHIFT_X;

    doc
      .roundedRect(summaryX, startY, summaryWidth, 0, 8)
      .fillAndStroke("#EAF7EF", "#0E6B45");

    doc
      .fillColor("#000")
      .font("Helvetica")
      .fontSize(11)
      .text(aiSummary, summaryX + 12, startY + 10, {
        width: summaryWidth - 24,
        align: "justify",
      });

    const endY = doc.y + 10;

    doc
      .roundedRect(summaryX, startY, summaryWidth, endY - startY, 8)
      .strokeColor("#0E6B45")
      .stroke();

    if (doc.y > 650) doc.addPage();

    /* --------------------------------------------------------
      VOLUNTEER TABLE (LEFT ALIGN — NOT SHIFTED)
    ---------------------------------------------------------*/
    doc.moveDown(2);
    doc
      .fillColor("#0E6B45")
      .fontSize(15)
      .font("Helvetica-Bold")
      .text("Volunteer Attendance");

    let tableY = doc.y;

    doc.rect(45, tableY, 510, 25).fill("#DFF3E7");

    doc
      .fillColor("#000")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("No.", 55, tableY + 7)
      .text("Name", 110, tableY + 7)
      .text("Department", 300, tableY + 7)
      .text("Status", 470, tableY + 7);

    let rowY = tableY + 25;

    participants.forEach((p, i) => {
      if (rowY > 760) {
        doc.addPage();
        rowY = 70;
      }

      doc.rect(45, rowY, 510, 22).strokeColor("#DDD").stroke();

      doc
        .font("Helvetica")
        .fillColor("#000")
        .fontSize(10)
        .text(i + 1, 55, rowY + 6)
        .text(p.name, 110, rowY + 6)
        .text(p.department || "N/A", 300, rowY + 6);

      const color = p.status === "present" ? "#0E8F37" : "#B41F1F";
      doc.fillColor(color).text(p.status.toUpperCase(), 470, rowY + 6);

      doc.fillColor("#000");
      rowY += 22;
    });

    doc.moveDown(1);
    doc
      .font("Helvetica-Bold")
      .text(`Total Volunteers: ${participants.length}`, { align: "right" });

    /* --------------------------------------------------------
       FOOTER
    ---------------------------------------------------------*/
    doc.flushPages();
    const totalPages = doc.bufferedPageRange().count;

    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(9)
        .fillColor("#777")
        .text(
          `Page ${i + 1} of ${totalPages} | NSS Report Generated`,
          50,
          doc.page.height - 40,
          { align: "center" }
        );
    }

    /* --------------------------------------------------------
      FINALIZE
    ---------------------------------------------------------*/
    doc.end();

    stream.on("finish", () => {
      res.download(filePath, fileName, () => {
        fs.unlink(filePath, () => {});
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error generating report",
    });
  }
};

// update event status (simple version)
