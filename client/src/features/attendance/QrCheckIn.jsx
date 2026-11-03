"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaCheckCircle, FaSignOutAlt, FaExclamationTriangle } from "react-icons/fa";
import { api } from "@/utils/api";
import { getRole, getToken } from "@/utils/auth";

const fmtTime = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

/** Landing page for the QR code a student scans at an event. */
export default function QrCheckIn() {
  const token = useSearchParams().get("t");
  const [state, setState] = useState({ phase: "working" });
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return; // StrictMode double-invoke would otherwise check out immediately
    sent.current = true;

    if (!token) return;
    // localStorage is only readable after mount, so the login check lives here.
    if (!getToken() || getRole() !== "student") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage (external store)
      return setState({ phase: "login" });
    }
    api
      .post("/api/events/checkin", { token })
      .then((res) => setState({ phase: "done", ...res.data }))
      .catch((err) =>
        setState({
          phase: err.response?.data?.code === "too_soon" ? "info" : "error",
          message: err.response?.data?.message || "Check-in failed. Please try again.",
        })
      );
  }, [token]);

  const card = (icon, title, body, tone) => (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${tone}`}>{icon}</div>
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <div className="mt-2 text-gray-600">{body}</div>
      <Link href="/studentlayout/nssprogress" className="mt-6 inline-block text-sm font-medium text-green-700 hover:underline">
        View my NSS progress →
      </Link>
    </div>
  );

  if (!token) return card(
    <FaExclamationTriangle className="h-7 w-7 text-red-600" />,
    "Invalid link",
    <p>This link has no check-in code. Scan the QR code shown at the event.</p>,
    "bg-red-50"
  );
  if (state.phase === "working") return <p className="mt-24 text-center text-gray-500">Recording your attendance…</p>;
  if (state.phase === "login")
    return card(
      <FaExclamationTriangle className="h-7 w-7 text-amber-600" />,
      "Log in to check in",
      <>
        <p>Log in with your volunteer account, then scan the code on screen again.</p>
        <Link href="/login" className="mt-4 inline-block rounded-lg bg-green-700 px-4 py-2 text-white">Log in</Link>
      </>,
      "bg-amber-50"
    );
  if (state.phase === "done") {
    const out = state.action === "checked_out";
    return card(
      out ? <FaSignOutAlt className="h-7 w-7 text-green-700" /> : <FaCheckCircle className="h-7 w-7 text-green-700" />,
      out ? "Checked out" : "Checked in",
      <>
        <p className="font-medium text-gray-800">{state.event?.title}</p>
        <p className="mt-1 text-sm">
          In at {fmtTime(state.checkInAt)}
          {state.checkOutAt ? ` · Out at ${fmtTime(state.checkOutAt)}` : " · Scan again when you leave to record your hours."}
        </p>
      </>,
      "bg-green-50"
    );
  }
  return card(
    <FaExclamationTriangle className={`h-7 w-7 ${state.phase === "info" ? "text-gray-600" : "text-red-600"}`} />,
    state.phase === "info" ? "Already checked in" : "Couldn't check you in",
    <p>{state.message}</p>,
    state.phase === "info" ? "bg-gray-100" : "bg-red-50"
  );
}
