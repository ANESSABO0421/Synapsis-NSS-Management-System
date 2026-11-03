import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

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
  const err = new Error(`Unsupported file type for ${file.fieldname}`);
  err.status = 400;
  cb(err);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
});

export default upload;
