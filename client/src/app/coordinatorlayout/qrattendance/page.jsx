"use client";

import QrAttendance from "@/features/attendance/QrAttendance";

const extract = (data) => data.events || [];

export default function Page() {
  return (
    <QrAttendance
      eventsPath="/api/coordinator/my-events"
      extractEvents={extract}
      startHint="Start an event from My Events first."
    />
  );
}
