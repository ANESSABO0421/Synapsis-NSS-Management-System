/** KPI tile: sentence-case label, semibold value, optional hint. */
export default function StatTile({ label, value, hint, icon }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {icon && <span className="text-gray-400" aria-hidden>{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-gray-500">{hint}</div>}
    </div>
  );
}
