import cloudinary from "../../utils/cloudinary.js";
import Student from "../../models/Student.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Event from "../../models/Event.js";
import { groq } from "../../utils/ai.js";

export const generateAttendancePdf = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate(
      "attendance.student",
      "name department graceHistory"
    );

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const total = event.attendance.length;
    const present = event.attendance.filter(
      (a) => a.status === "Present"
    ).length;
    const percent = total ? ((present / total) * 100).toFixed(2) : 0;

    // === AI Insight ===
    let aiInsight = "AI insight could not be generated.";
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You write formal, impressive NSS-style attendance insights.",
          },
          {
            role: "user",
            content: `Generate a 3-sentence formal paragraph for an NSS attendance report based on:
Event: ${event.title}
Date: ${new Date(event.date).toDateString()}
Location: ${event.location}
Attendance Rate: ${percent}%
Total Volunteers: ${total}
Focus on social impact, volunteer engagement, and community value.`,
          },
        ],
      });
      aiInsight = completion.choices[0]?.message?.content?.trim() || aiInsight;
    } catch (err) {
      console.error("AI Error:", err.message);
    }

    // === PDF GENERATION ===
    const doc = new PDFDocument({ margin: 50 });
    const folder = "uploads";
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    const fileName = `attendance_${event._id}.pdf`;
    const filePath = path.join(folder, fileName);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    const primaryColor = "#2e7d32";
    const borderColor = "#4caf50";
    const lightBg = "#e8f5e9";

    // HEADER
    doc.rect(0, 0, pageWidth, 80).fill(primaryColor);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(22);
    doc.text(event.title.toUpperCase(), 0, 28, { align: "center" });
    doc
      .fontSize(13)
      .font("Helvetica")
      .text("Attendance Report", 0, 55, { align: "center" });

    doc.lineWidth(1.2).strokeColor(borderColor);
    doc.rect(40, 100, pageWidth - 80, pageHeight - 160).stroke();

    doc.fillColor("black").font("Helvetica").fontSize(12);
    doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`, 60, 120);
    doc.text(`Location: ${event.location}`, 60, 140);
    doc.text(`Hours: ${event.hours || "-"} hrs`, 60, 160);
    doc.text(`Total Volunteers: ${total}`, 60, 180);
    doc.text(`Attendance Rate: ${percent}%`, 60, 200);

    const aiStartY = 240;
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor(primaryColor)
      .text("AI Attendance Insight", 60, aiStartY, { underline: true });

    const aiTextHeight = doc.heightOfString(aiInsight, {
      width: pageWidth - 120,
      align: "justify",
      lineGap: 4,
    });

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("black")
      .text(aiInsight, 60, aiStartY + 25, {
        width: pageWidth - 120,
        align: "justify",
        indent: 25,
        lineGap: 4,
      });

    const tableX = 60;
    const tableWidth = pageWidth - 120;
    const colWidths = [40, 120, 130, 80, 90];
    const headers = ["No.", "Name", "Department", "Status", "Grace Marks"];

    let y = aiStartY + aiTextHeight + 50;

    doc.rect(tableX, y, tableWidth, 28).fillAndStroke(lightBg, borderColor);
    doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(11);

    let x = tableX + 10;
    headers.forEach((h, i) => {
      const align = i === 0 || i === 4 ? "center" : "left";
      doc.text(h, x, y + 8, { width: colWidths[i] - 10, align });
      x += colWidths[i];
    });

    y += 28;

    // === TABLE ROWS (with correct event-wise grace marks) ===
    doc.font("Helvetica").fontSize(10).fillColor("black");

    event.attendance.forEach((a, i) => {
      const s = a.student || {};
      const bg = i % 2 === 0 ? "#ffffff" : "#f9f9f9";
      const rowHeight = 25;

      // event-wise grace mark
      const eventMark =
        s?.graceHistory?.find(
          (h) => h.eventId?.toString() === event._id.toString()
        )?.marks || 0;

      doc.rect(tableX, y, tableWidth, rowHeight).fillAndStroke(bg, "#c5cae9");

      let x = tableX + 10;
      const row = [
        i + 1,
        s.name || "-",
        s.department || "-",
        a.status || "-",
        eventMark,
      ];

      row.forEach((val, j) => {
        const align = j === 0 || j === 4 ? "center" : "left";
        doc.fillColor("black").text(String(val), x, y + 7, {
          width: colWidths[j] - 10,
          align,
        });
        x += colWidths[j];
      });

      y += rowHeight;
    });

    doc.fontSize(60).fillColor("#e8f5e9").opacity(0.15);
    doc.rotate(-30, { origin: [pageWidth / 2, pageHeight / 2] });
    doc.text("NSS", pageWidth / 2 - 100, pageHeight / 2);
    doc.rotate(30).opacity(1);

    doc
      .moveTo(50, pageHeight - 80)
      .lineTo(pageWidth - 50, pageHeight - 80)
      .strokeColor(borderColor)
      .lineWidth(1.2)
      .stroke();
    doc
      .fontSize(10)
      .fillColor("gray")
      .text(
        "Generated automatically by NSS Attendance Management System | AI Insights powered by Groq",
        0,
        pageHeight - 65,
        { align: "center" }
      );

    doc.end();

    stream.on("finish", () => {
      res.download(filePath, fileName, () => fs.unlinkSync(filePath));
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// test

export const getMyEvents = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const events = await Event.find({ assignedTeacher: teacherId })
      .populate("institution", "name")
      .sort({ date: -1 });

    if (!events.length) {
      return res
        .status(200)
        .json({ success: true, data: [], message: "No events found" });
    }

    const formatted = events.map((e) => ({
      _id: e._id,
      title: e.title,
      date: e.date,
      description: e.description,
      location: e.location,
      status: e.status,
      hours: e.hours,
      institution: e.institution?.name,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// 📸 Upload Event Images
// ===============================

export const uploadEventImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { captions } = req.body; // optional captions array (can be stringified)

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    const uploadedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        // ✅ Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "event_images",
        });

        // ✅ Push uploaded info
        uploadedImages.push({
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          caption:
            Array.isArray(captions) && captions[i]
              ? captions[i]
              : typeof captions === "string"
              ? captions
              : "",
          uploadAt: new Date(),
        });
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr.message);
      } finally {
        // ✅ Safely delete local temp file if it exists
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (unlinkErr) {
          console.warn("Local file cleanup skipped:", unlinkErr.message);
        }
      }
    }

    // ✅ Append to existing images (instead of replacing)
    event.images = [...(event.images || []), ...uploadedImages];
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    console.error("❌ Error uploading event images:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ===============================
// ✏️ Edit Event Details
// ===============================

export const editEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      location,
      hours,
      status,
      assignedTeacher,
      assignedCoordinators,
    } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // update editable fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (location) event.location = location;
    if (hours) event.hours = hours;
    if (status) event.status = status;
    if (assignedTeacher) event.assignedTeacher = assignedTeacher;
    if (assignedCoordinators) event.assignedCoordinators = assignedCoordinators;

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("❌ Error editing event:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// 🟢 Get Teacher Profile
// ==============================

export const getParticipantsOfEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Fetch only students assigned to this event
    const participants = await Student.find({
      assignedEvents: eventId,
    })
      .select("name email department graceHistory assignedEvents")
      .populate("graceHistory.eventId", "_id title")
      .lean();
    

    return res.json({ success: true, participants });
  } catch (err) {
    console.error("Error fetching participants:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
