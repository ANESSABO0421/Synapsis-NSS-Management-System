import { z } from "zod";

/**
 * validate({ body, params, query }) — Zod schemas per request part.
 * On success the parsed (coerced/trimmed) values replace the originals.
 */
export const validate = (schemas) => (req, res, next) => {
  for (const part of ["params", "query", "body"]) {
    const schema = schemas[part];
    if (!schema) continue;
    const result = schema.safeParse(req[part] ?? {});
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }
    if (part === "query") {
      Object.defineProperty(req, "query", { value: result.data, writable: true, configurable: true });
    } else {
      req[part] = result.data;
    }
  }
  next();
};

// ---------- Reusable field schemas ----------
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
// Not lowercased: existing accounts were stored with original casing.
export const email = z.string().trim().email("Invalid email").max(254);
export const password = z.string().min(1, "Password is required").max(128);
export const otp = z.union([z.string(), z.number()]).transform(String).pipe(
  z.string().regex(/^\d{6}$/, "OTP must be 6 digits")
);

// ---------- Auth ----------
export const loginSchema = { body: z.object({ email, password }).passthrough() };

export const otpSchema = (idField) => ({
  body: z.object({ [idField]: idField === "email" ? email : objectId, otp }).passthrough(),
});

export const genericOtpSchema = {
  body: z
    .object({
      id: objectId,
      otp,
      role: z.enum(["admin", "student", "teacher", "coordinator", "alumni"]),
    })
    .passthrough(),
};
