// @ts-check
import multer from "multer";
import { captureException } from "../configs/sentry.js";

export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Not found: ${req.method} ${req.originalUrl}` });
};

// Central error handler. Controllers can call next(err); err.status sets the code.
export const errorHandler = (err, req, res, _next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 5 MB)" : err.message;
  } else if (err.name === "ValidationError") {
    status = 400;
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = `Duplicate value for ${Object.keys(err.keyValue || {}).join(", ") || "field"}`;
  } else if (err.message === "Not allowed by CORS") {
    status = 403;
  }

  if (status >= 500) {
    (req.log || console).error({ err }, `Unhandled error on ${req.method} ${req.originalUrl}`);
    captureException(err, { tags: { route: req.originalUrl }, extra: { requestId: req.id } });
    // Never leak internals for unexpected errors in production.
    if (process.env.NODE_ENV === "production") message = "Internal server error";
  }

  res.status(status).json({ success: false, message });
};
