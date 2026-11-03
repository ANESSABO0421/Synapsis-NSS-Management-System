"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaFileCsv, FaFilePdf, FaMagic } from "react-icons/fa";
import { api } from "@/utils/api";
import { downloadFile } from "@/utils/download";
import StatTile from "@/components/nss/StatTile";
import StatusBadge from "@/components/nss/StatusBadge";
import Meter from "@/components/nss/Meter";

// Academic years start in June (matches backend configs/nss.js).
const yearLabel = (start) => `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
const currentStart = () => {
  const d = new Date();
  return d.getMonth() >= 5 ? d.getFullYear() : d.getFullYear() - 1;
};
const YEARS = Array.from({ length: 5 }, (_, i) => yearLabel(currentStart() - i));

const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function AnnualReport() {
  const [year, setYear] = useState(YEARS[0]);
  const [report, setReport] = useState(null);
  const [summary, setSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [volunteers, setVolunteers] = useState(null);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/api/reports/annual?year=${year}`)
      .then((res) => {
        if (cancelled) return;
        setReport(res.data.report);
        setSummary(null);
      })
      .catch((err) => toast.error(err.response?.data?.message || "Could not load the report"));
    return () => {
      cancelled = true;
    };
  }, [year]);

  useEffect(() => {
    api
      .get("/api/coordinator/nss-progress")
      .then((res) => setVolunteers(res.data))
      .catch(() => setVolunteers({ volunteers: [], counts: {} }));
  }, []);

  const generateSummary = async () => {
    setAiLoading(true);
    try {
      const res = await api.get(`/api/reports/annual?year=${year}&ai=1`);
      if (res.data.summary) setSummary(res.data.summary);
      else toast.info("AI summary is not available right now.");
    } catch (err) {
      toast.error(err.response?.data?.message || "AI summary failed");
    } finally {
      setAiLoading(false);
    }
  };

  const download = async (format) => {
    setBusy(format);
    try {
      await downloadFile(
        `/api/reports/annual?year=${year}&format=${format}${format === "pdf" && summary ? "&ai=1" : ""}`,
        `NSS_Annual_Report_${year}.${format}`
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy("");
    }
  };

  const rows = useMemo(() => {
    const list = volunteers?.volunteers || [];
    return filter === "all" ? list : list.filter((v) => v.status === filter);
  }, [volunteers, filter]);

  const t = report?.totals;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Annual Report</h1>
          <p className="text-sm text-gray-500">{report?.institution?.name || "Your institution"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-600">
            <span className="sr-only">Academic year</span>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-lg border border-gray-300 p-2">
              {YEARS.map((y) => (
                <option key={y} value={y}>Academic year {y}</option>
              ))}
            </select>
          </label>
          <button onClick={() => download("pdf")} disabled={!!busy} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm text-white hover:bg-green-800 disabled:opacity-60">
            <FaFilePdf aria-hidden /> {busy === "pdf" ? "Preparing…" : "PDF"}
          </button>
          <button onClick={() => download("csv")} disabled={!!busy} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60">
            <FaFileCsv aria-hidden /> {busy === "csv" ? "Preparing…" : "Excel / CSV"}
          </button>
        </div>
      </header>

      {!report ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile label="Events" value={t.events} hint={`${t.byStatus.Completed || 0} completed · ${t.specialCamps} special camp${t.specialCamps === 1 ? "" : "s"}`} />
            <StatTile label="Volunteer hours" value={t.volunteerHours.toLocaleString("en-IN")} />
            <StatTile label="Active volunteers" value={t.activeVolunteers} hint={`${t.volunteersMeetingYearlyTarget} reached ${report.rules.hoursPerYear} h`} />
            <StatTile label="Attendance rate" value={t.attendanceRate == null ? "—" : `${t.attendanceRate}%`} hint={`Donations ${inr(t.donations)}`} />
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
              <button onClick={generateSummary} disabled={aiLoading} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60">
                <FaMagic aria-hidden /> {aiLoading ? "Writing…" : summary ? "Regenerate" : "Write with AI"}
              </button>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {summary || "Generate a short narrative for the report from this year's numbers. It is included in the PDF once generated."}
            </p>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <h2 className="px-5 pt-5 text-lg font-semibold text-gray-900">Events</h2>
            <div className="overflow-x-auto">
              <table className="mt-3 w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-5 py-2 font-medium">Date</th>
                    <th className="px-5 py-2 font-medium">Event</th>
                    <th className="px-5 py-2 font-medium">Type</th>
                    <th className="px-5 py-2 font-medium">Status</th>
                    <th className="px-5 py-2 text-right font-medium">Present</th>
                    <th className="px-5 py-2 text-right font-medium">Hours</th>
                    <th className="px-5 py-2 text-right font-medium">Donations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.events.map((e) => (
                    <tr key={e.id}>
                      <td className="whitespace-nowrap px-5 py-2 text-gray-600">{fmtDate(e.date)}</td>
                      <td className="px-5 py-2 text-gray-900">{e.title}</td>
                      <td className="px-5 py-2 text-gray-600">{e.category === "special_camp" ? "Special camp" : "Regular"}</td>
                      <td className="px-5 py-2 text-gray-600">{e.status}</td>
                      <td className="px-5 py-2 text-right tabular-nums">{e.present}/{e.registered}</td>
                      <td className="px-5 py-2 text-right tabular-nums">{e.volunteerHours}</td>
                      <td className="px-5 py-2 text-right tabular-nums">{e.donations ? inr(e.donations) : "—"}</td>
                    </tr>
                  ))}
                  {report.events.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-6 text-center text-gray-500">No events in {year}.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Volunteer progress</h2>
            <p className="text-xs text-gray-500">All-time hours toward the NSS certificate. “Behind” = well under the pace for this academic year.</p>
          </div>
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 text-sm" role="tablist" aria-label="Filter volunteers">
            {[
              ["all", "All"],
              ["behind", `Behind (${volunteers?.counts?.behind || 0})`],
              ["on_track", `On track (${volunteers?.counts?.on_track || 0})`],
              ["completed", `Completed (${volunteers?.counts?.completed || 0})`],
            ].map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={`rounded-md px-3 py-1 ${filter === key ? "bg-white font-medium text-gray-900 shadow-sm" : "text-gray-600"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-5 py-2 font-medium">Volunteer</th>
                <th className="px-5 py-2 font-medium">Department</th>
                <th className="w-64 px-5 py-2 font-medium">Total hours</th>
                <th className="px-5 py-2 text-right font-medium">This year</th>
                <th className="px-5 py-2 font-medium">Camp</th>
                <th className="px-5 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((v) => (
                <tr key={v.student._id}>
                  <td className="px-5 py-2 text-gray-900">{v.student.name}</td>
                  <td className="px-5 py-2 text-gray-600">{v.student.department}</td>
                  <td className="px-5 py-2">
                    <Meter size="sm" hideLabel label={`${v.student.name} total hours`} value={v.totalHours} max={240} tone={v.status === "behind" ? "warning" : "good"} />
                  </td>
                  <td className="px-5 py-2 text-right tabular-nums">{v.currentYearHours}</td>
                  <td className="px-5 py-2 text-gray-600">{v.specialCampDone ? "Done" : "Pending"}</td>
                  <td className="px-5 py-2"><StatusBadge status={v.status} /></td>
                </tr>
              ))}
              {volunteers && rows.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-6 text-center text-gray-500">No volunteers in this view.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
