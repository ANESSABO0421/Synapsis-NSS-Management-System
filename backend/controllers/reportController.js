// @ts-check
import mongoose from "mongoose";
import Coordinator from "../models/Coordinator.js";
import { academicYearOf } from "../configs/nss.js";
import { aiSummary, buildAnnualReport, reportToCsv, streamReportPdf } from "../services/annualReport.js";

/**
 * GET /api/reports/annual?year=2025-26&format=json|pdf|csv&ai=1
 * Coordinators get their own institution; admins pass ?institution=<id>.
 */
export const getAnnualReport = async (req, res, next) => {
  try {
    let institutionId;
    if (req.user.role === "coordinator") {
      institutionId = (await Coordinator.findById(req.user._id).select("institution")).institution;
    } else {
      institutionId = req.query.institution;
      if (!mongoose.isValidObjectId(institutionId)) {
        return res.status(400).json({ success: false, message: "institution query parameter is required" });
      }
    }

    const year = req.query.year || academicYearOf(new Date());
    const format = req.query.format || "json";
    const report = await buildAnnualReport(institutionId, year);
    const wantsAi = req.query.ai === "1" || req.query.ai === "true";

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="NSS_Annual_Report_${year}.csv"`);
      return res.send("﻿" + reportToCsv(report)); // BOM so Excel reads UTF-8
    }
    if (format === "pdf") {
      return streamReportPdf(res, report, wantsAi ? await aiSummary(report) : null);
    }
    if (format !== "json") {
      return res.status(400).json({ success: false, message: "format must be json, pdf or csv" });
    }
    res.json({ success: true, report, summary: wantsAi ? await aiSummary(report) : null });
  } catch (error) {
    next(error);
  }
};
