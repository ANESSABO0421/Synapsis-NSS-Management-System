// @ts-check
// Strips MongoDB operator keys ($gt, $ne, $where, ...) and dotted keys from
// user input so values can't turn into query operators (NoSQL injection).
// Express 5 makes req.query a getter, so it is redefined rather than assigned.
const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

const DROP = Symbol("drop");

const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean).filter((v) => v !== DROP);
  if (!isPlainObject(value)) return value;
  const out = {};
  let stripped = false;
  for (const [key, v] of Object.entries(value)) {
    if (key.startsWith("$") || key.includes(".")) {
      stripped = true;
      continue;
    }
    const cleaned = clean(v);
    if (cleaned !== DROP) out[key] = cleaned;
  }
  // An object that consisted only of operators (e.g. {$ne: x}) is dropped
  // entirely, rather than left as {} for Mongoose to choke on.
  return stripped && Object.keys(out).length === 0 ? DROP : out;
};

const cleanRoot = (value) => {
  const cleaned = clean(value);
  return cleaned === DROP ? {} : cleaned;
};

export const sanitizeInput = (req, _res, next) => {
  if (isPlainObject(req.body)) req.body = cleanRoot(req.body);
  if (req.params) req.params = cleanRoot(req.params);
  const query = cleanRoot(req.query);
  Object.defineProperty(req, "query", { value: query, writable: true, configurable: true });
  next();
};
