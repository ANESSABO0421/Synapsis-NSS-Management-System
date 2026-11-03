// National Service Scheme certificate rules. Universities vary slightly;
// adjust here rather than in the code that uses them.
export const NSS_RULES = {
  hoursPerYear: 120,
  totalHours: 240,
  specialCampRequired: true,
  // Indian academic years start in June (0-based month index 5).
  academicYearStartMonth: 5,
};

/** "2025-26" for any date between June 2025 and May 2026. */
export const academicYearOf = (date) => {
  const d = new Date(date);
  const start = d.getMonth() >= NSS_RULES.academicYearStartMonth ? d.getFullYear() : d.getFullYear() - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
};

/** [startDate, endDateExclusive] for "2025-26". */
export const academicYearRange = (label) => {
  const match = /^(\d{4})-(\d{2})$/.exec(label || "");
  if (!match) return null;
  const start = Number(match[1]);
  if ((start + 1) % 100 !== Number(match[2])) return null;
  return [
    new Date(start, NSS_RULES.academicYearStartMonth, 1),
    new Date(start + 1, NSS_RULES.academicYearStartMonth, 1),
  ];
};

/** Fraction (0..1) of the given academic year that has elapsed. */
export const academicYearElapsed = (label, now = new Date()) => {
  const range = academicYearRange(label);
  if (!range) return 0;
  const [from, to] = range;
  return Math.min(1, Math.max(0, (now - from) / (to - from)));
};
