// @ts-check
// Mongoose plugin: never serialize credentials / OTPs in API responses (res.json -> toJSON).
// toObject() is left untouched so internal code can still read these fields.
const SECRET_FIELDS = ["password", "otp", "otpExpiry", "googleId"];

export default function stripSecrets(schema) {
  const transform = (_doc, ret) => {
    for (const field of SECRET_FIELDS) delete ret[field];
    return ret;
  };
  schema.set("toJSON", { transform });
}
