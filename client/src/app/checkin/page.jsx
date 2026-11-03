import { Suspense } from "react";
import QrCheckIn from "@/features/attendance/QrCheckIn";

export const metadata = { title: "Event check-in | Synapsis NSS" };

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 pt-16">
      <Suspense>
        <QrCheckIn />
      </Suspense>
    </main>
  );
}
