"use client";

/**
 * Progress meter toward a limit. The fill carries status (good -> warning);
 * the unfilled track is a lighter step of the same hue so state reads across
 * the whole bar. Text stays in neutral ink; the value is always printed, so
 * color is never the only signal.
 */
const TONES = {
  good: { fill: "bg-green-600", track: "bg-green-100" },
  warning: { fill: "bg-amber-500", track: "bg-amber-100" },
  neutral: { fill: "bg-gray-500", track: "bg-gray-200" },
};

export default function Meter({ label, value, max, unit = "h", tone = "good", size = "md", caption, hideLabel = false }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const t = TONES[tone] || TONES.good;
  const height = size === "sm" ? "h-2" : "h-3";

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className={hideLabel ? "sr-only" : "text-sm font-medium text-gray-700"}>{label}</span>
        <span className="text-sm tabular-nums text-gray-900">
          <span className="font-semibold">{format(value)}</span>
          <span className="text-gray-500"> / {format(max)} {unit}</span>
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${format(value)} of ${format(max)} ${unit}`}
        className={`w-full ${height} rounded-full ${t.track} overflow-hidden`}
      >
        <div className={`${height} rounded-full ${t.fill} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
      </div>
      {caption && <p className="mt-1 text-xs text-gray-500">{caption}</p>}
    </div>
  );
}

const format = (n) => (Number.isInteger(n) ? n : Number(n).toFixed(1)).toLocaleString("en-IN");
