// @ts-check
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";
import { sanitizeInput } from "./sanitize.js";
import { HttpError } from "../utils/httpError.js";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DOCUMENT_TYPES = ["application/pdf"];
// Only verification documents may be PDFs.
const PDF_FIELDS = new Set(["verificationDocument"]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// NOTE: this key was previously misspelled `parmas`, so folder, format and
// size limits were silently ignored and any file type was accepted.
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    if (file.mimetype === "application/pdf") {
      return { folder: "synapsis_nss/documents", resource_type: "image", format: "pdf" };
    }
    return {
      folder: file.fieldname === "profileImage" ? "synapsis_nss/profiles" : "synapsis_nss/events",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        file.fieldname === "profileImage"
          ? { width: 500, height: 500, crop: "limit" }
          : { width: 1600, height: 1600, crop: "limit", quality: "auto" },
      ],
    };
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = PDF_FIELDS.has(file.fieldname)
    ? [...IMAGE_TYPES, ...DOCUMENT_TYPES]
    : IMAGE_TYPES;
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new HttpError(400, `Unsupported file type for ${file.fieldname}`));
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
});

// Multipart bodies are parsed here (after the global sanitizer ran), and multer
// expands names like `email[$ne]` into objects — so sanitize again afterwards.
const thenSanitize = (mw) => (req, res, next) =>
  mw(req, res, (err) => (err ? next(err) : sanitizeInput(req, res, next)));

const upload = {
  /** @param {string} field */
  single: (field) => thenSanitize(multerUpload.single(field)),
  /** @param {string} field @param {number} [max] */
  array: (field, max) => thenSanitize(multerUpload.array(field, max)),
  /** @param {import("multer").Field[]} fields */
  fields: (fields) => thenSanitize(multerUpload.fields(fields)),
  none: () => thenSanitize(multerUpload.none()),
};

export default upload;
