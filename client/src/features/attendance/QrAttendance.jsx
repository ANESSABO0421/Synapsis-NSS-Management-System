"use client";

import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FaExpand, FaCompress } from "react-icons/fa";
import { api } from "@/utils/api";
import { useSocket } from "@/context/SocketContext";
import StatTile from "@/components/nss/StatTile";

const REFRESH_MS = 30_000; // tokens live 45s; refresh well before expiry

/**
 * Staff screen: pick a running event and display a rotating QR code that
 * volunteers scan to check in / out. `eventsPath` differs per role.
 */
export default function QrAttendance({ eventsPath, extractEvents, startHint }) {
  const socket = useSocket();
  const [events, setEvents] = useState(null);
  const [eventId, setEventId] = useState("");
  const [qr, setQr] = useState(null);
  const [error, setError] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    api
      .get(eventsPath)
      .then((res) => {
        const ongoing = extractEvents(res.data).filter((e) => e.status === "Ongoing");
        setEvents(ongoing);
        if (ongoing.length === 1) setEventId(ongoing[0]._id);
      })
      .catch(() => setEvents([]));
  }, [eventsPath, extractEvents]);

  const refresh = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await api.get(`/api/events/${eventId}/qr`);
      setQr(res.data);
      setError("");
    } catch (err) {
      setQr(null);
      setError(err.response?.data?.message || "Could not load the QR code");
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch from external API on selection
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [eventId, refresh]);

  // Live counts as volunteers scan (server emits to the event chat room).
  useEffect(() => {
    if (!socket || !eventId) return;
    socket.emit("join_event", eventId);
    const onUpdate = (stats) => setQr((prev) => (prev ? { ...prev, stats } : prev));
    socket.on("attendance_update", onUpdate);
    return () => {
      socket.off("attendance_update", onUpdate);
      socket.emit("leave_event", eventId);
    };
  }, [socket, eventId]);

  if (events === null) return <p className="p-6 text-gray-500">Loading events…</p>;

  const selected = events.find((e) => e._id === eventId);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">QR Attendance</h1>
        <p className="text-sm text-gray-500">
          Volunteers scan with their phone to check in, and again when leaving. Hours are credited for the time
          actually present when the event is completed.
        </p>
      </header>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          No running events. {startHint}
        </div>
      ) : (
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Event</span>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          >
            <option value="">Select a running event…</option>
            {events.map((e) => (
              <option key={e._id} value={e._id}>{e.title}</option>
            ))}
          </select>
        </label>
      )}

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {qr && selected && (
        <div className={fullscreen ? "fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white p-6" : "space-y-6"}>
          <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-center text-xl font-semibold text-gray-900">{selected.title}</h2>
            <QRCodeSVG value={qr.url} size={fullscreen ? 420 : 280} level="M" marginSize={2} aria-label="Check-in QR code" />
            <p className="mt-3 text-xs text-gray-500">Code refreshes every 30 seconds · screenshots stop working after {qr.expiresIn}s</p>
            <button
              onClick={() => setFullscreen((v) => !v)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              {fullscreen ? <FaCompress aria-hidden /> : <FaExpand aria-hidden />}
              {fullscreen ? "Exit full screen" : "Full screen for projector"}
            </button>
          </div>
          <div className="grid w-full max-w-2xl grid-cols-3 gap-3">
            <StatTile label="Registered" value={qr.stats.participants} />
            <StatTile label="On site now" value={qr.stats.onSite} />
            <StatTile label="Checked out" value={qr.stats.checkedOut} />
          </div>
        </div>
      )}
    </div>
  );
}
