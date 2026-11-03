import { FaCheckCircle, FaExclamationTriangle, FaRunning } from "react-icons/fa";

// Status always pairs an icon and a label with its color — never color alone.
const STATUS = {
  completed: { label: "Completed", icon: FaCheckCircle, cls: "bg-green-50 text-green-800 ring-green-600/20" },
  on_track: { label: "On track", icon: FaRunning, cls: "bg-gray-50 text-gray-700 ring-gray-500/20" },
  behind: { label: "Behind", icon: FaExclamationTriangle, cls: "bg-amber-50 text-amber-800 ring-amber-600/30" },
};

export const statusTone = (status) => (status === "behind" ? "warning" : "good");

export default function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.on_track;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.cls}`}>
      <Icon aria-hidden className="h-3 w-3" />
      {s.label}
    </span>
  );
}
