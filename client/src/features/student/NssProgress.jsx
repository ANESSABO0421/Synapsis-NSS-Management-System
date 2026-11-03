"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaAward, FaCampground, FaClock, FaQrcode } from "react-icons/fa";
import { api } from "@/utils/api";
import { downloadFile } from "@/utils/download";
import Meter from "@/components/nss/Meter";
import StatTile from "@/components/nss/StatTile";
import StatusBadge, { statusTone } from "@/components/nss/StatusBadge";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function NssProgress() {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api
      .get("/api/students/nss-progress")
      .then((res) => setProgress(res.data.progress))
      .catch((err) => setError(err.response?.data?.message || "Could not load your progress"));
  }, []);

  const downloadCompletion = async () => {
    setDownloading(true);
    try {
      await downloadFile("/api/students/nss-certificate", "NSS_Completion_Certificate.pdf");
      toast.success("Certificate downloaded");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (error) return <p className="p-6 text-red-700">{error}</p>;
  if (!progress) return <p className="p-6 text-gray-500">Loading your NSS progress…</p>;

  const { rules } = progress;
  const tone = statusTone(progress.status);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NSS Progress</h1>
          <p className="text-sm text-gray-500">
            {rules.totalHours} hours over two years
            {rules.specialCampRequired ? " plus one special camp" : ""} earn the NSS certificate.
          </p>
        </div>
        <StatusBadge status={progress.status} />
      </header>

      {/* Headline meter */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <Meter
          label="Total service hours"
          value={progress.totalHours}
          max={rules.totalHours}
          tone={tone}
          caption={
            progress.eligible
              ? "Requirements complete — download your certificate below."
              : `${progress.remainingHours} hours to go${progress.specialCampDone ? "" : " · special camp pending"}`
          }
        />
      </section>

      {/* KPI row */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon={<FaClock />} label="This year" value={`${progress.currentYearHours} h`} hint={`Academic year ${progress.currentYear}`} />
        <StatTile icon={<FaAward />} label="Years at 120 h" value={progress.yearsCompleted} hint={`Target ${rules.hoursPerYear} h per year`} />
        <StatTile icon={<FaCampground />} label="Special camp" value={progress.specialCampDone ? "Done" : "Pending"} />
        <StatTile icon={<FaQrcode />} label="Events attended" value={progress.events.length} />
      </section>

      {/* Per-year meters */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Hours by academic year</h2>
        {progress.hoursByYear.length === 0 ? (
          <p className="text-sm text-gray-500">No completed events yet. Hours appear here once an event you attended is completed.</p>
        ) : (
          <div className="space-y-4">
            {progress.hoursByYear.map((y) => (
              <Meter
                key={y.year}
                size="sm"
                label={y.year}
                value={y.hours}
                max={rules.hoursPerYear}
                tone={y.metTarget || y.year === progress.currentYear ? "good" : "warning"}
              />
            ))}
          </div>
        )}
      </section>

      {/* Completion certificate */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">NSS completion certificate</h2>
          <p className="text-sm text-gray-500">
            Includes a QR code anyone can scan to verify it online.
          </p>
        </div>
        <button
          onClick={downloadCompletion}
          disabled={!progress.eligible || downloading}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
        >
          {downloading ? "Preparing…" : progress.eligible ? "Download certificate" : "Not yet eligible"}
        </button>
      </section>

      {/* Table view: the data behind every meter */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <h2 className="px-5 pt-5 text-lg font-semibold text-gray-900">Credited events</h2>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-5 py-2 font-medium">Date</th>
                <th className="px-5 py-2 font-medium">Event</th>
                <th className="px-5 py-2 font-medium">Type</th>
                <th className="px-5 py-2 font-medium">Year</th>
                <th className="px-5 py-2 text-right font-medium">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {progress.events.map((e) => (
                <tr key={e.eventId}>
                  <td className="whitespace-nowrap px-5 py-2 text-gray-600">{fmtDate(e.date)}</td>
                  <td className="px-5 py-2 text-gray-900">{e.title}</td>
                  <td className="px-5 py-2 text-gray-600">{e.category === "special_camp" ? "Special camp" : "Regular"}</td>
                  <td className="px-5 py-2 text-gray-600">{e.academicYear}</td>
                  <td className="px-5 py-2 text-right tabular-nums text-gray-900">{e.hours}</td>
                </tr>
              ))}
              {progress.events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-gray-500">Nothing credited yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
