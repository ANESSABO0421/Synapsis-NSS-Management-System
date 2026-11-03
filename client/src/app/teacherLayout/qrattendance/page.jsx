"use client";

import QrAttendance from "@/features/attendance/QrAttendance";

const extract = (data) => data.data || [];

export default function Page() {
  return (
    <QrAttendance
      eventsPath="/api/teacher/teachermyevents"
      extractEvents={extract}
      startHint="Ask the event coordinator to start the event."
    />
  );
}
