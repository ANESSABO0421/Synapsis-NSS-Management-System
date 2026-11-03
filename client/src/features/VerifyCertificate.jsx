"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaSearch } from "react-icons/fa";
import { API_URL } from "@/utils/config";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

/** Public certificate verification. No login needed. */
export default function VerifyCertificate({ code }) {
  const router = useRouter();
  const [input, setInput] = useState(code || "");
  const [state, setState] = useState(code ? { phase: "loading" } : { phase: "idle" });

  useEffect(() => {
    if (!code) return;
    axios
      .get(`${API_URL}/api/certificates/verify/${encodeURIComponent(code)}`)
      .then((res) => setState({ phase: "found", cert: res.data.certificate }))
      .catch((err) =>
        setState({ phase: err.response?.status === 404 ? "missing" : "error" })
      );
  }, [code]);

  const submit = (e) => {
    e.preventDefault();
    const clean = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean) router.push(`/verify/${clean}`);
  };

  const cert = state.cert;
  const valid = cert?.valid;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-xl">
        <h1 className="text-center text-2xl font-bold text-gray-900">Verify an NSS certificate</h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Enter the 10-character code printed under the QR code on the certificate.
        </p>

        <form onSubmit={submit} className="mt-6 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. K7M2QX9PRT"
            maxLength={14}
            aria-label="Certificate code"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 font-mono uppercase tracking-widest"
          />
          <button className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-white hover:bg-green-800">
            <FaSearch aria-hidden /> Verify
          </button>
        </form>

        {state.phase === "loading" && <p className="mt-8 text-center text-gray-500">Checking…</p>}
        {state.phase === "missing" && (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
            <FaTimesCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">No certificate found</p>
              <p className="text-sm">Check the code and try again. A certificate that cannot be found here was not issued by this system.</p>
            </div>
          </div>
        )}
        {state.phase === "error" && <p className="mt-8 text-center text-red-700">Verification service unavailable. Try again later.</p>}

        {state.phase === "found" && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className={`flex items-center gap-3 px-5 py-4 ${valid ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              {valid ? <FaCheckCircle className="h-6 w-6" aria-hidden /> : <FaTimesCircle className="h-6 w-6" aria-hidden />}
              <div>
                <p className="font-semibold">{valid ? "Valid certificate" : "Certificate revoked"}</p>
                {!valid && cert.revokedReason && <p className="text-sm">Reason: {cert.revokedReason}</p>}
              </div>
            </div>
            <dl className="divide-y divide-gray-100 text-sm">
              {[
                ["Certificate", cert.type === "nss_completion" ? "NSS completion" : "Event participation"],
                ["Awarded to", cert.studentName],
                ["Department", cert.department],
                ["Institution", cert.institutionName],
                ...(cert.type === "event" ? [["Event", cert.eventTitle], ["Event date", fmtDate(cert.eventDate)]] : []),
                ["Service hours", cert.hours ?? "—"],
                ["Issued", fmtDate(cert.issuedAt)],
                ["Code", <span key="c" className="font-mono">{cert.code}</span>],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 px-5 py-3">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="col-span-2 text-gray-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-gray-400">
          <Link href="/" className="hover:underline">Synapsis NSS Management System</Link>
        </p>
      </div>
    </main>
  );
}
