// @ts-check
import crypto from "node:crypto";
import { createRequire } from "node:module";
import pino from "pino";
import { pinoHttp } from "pino-http";

const isTest = process.env.NODE_ENV === "test";
const isProd = process.env.NODE_ENV === "production";

// pino-pretty is a devDependency: only use it if it's actually installed, so a
// host that skips devDependencies (and doesn't set NODE_ENV) still boots.
const hasPretty = (() => {
  try {
    createRequire(import.meta.url).resolve("pino-pretty");
    return true;
  } catch {
    return false;
  }
})();

// JSON logs in production (for Render/Datadog/etc.), readable logs in dev, silent in tests.
export const logger = pino({
  level: process.env.LOG_LEVEL || (isTest ? "silent" : "info"),
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.otp", "*.token"],
    censor: "[redacted]",
  },
  ...(isProd || isTest || !hasPretty ? {} : { transport: { target: "pino-pretty", options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" } } }),
});

// One log line per request, with a request id echoed in the X-Request-Id header.
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const id = req.headers["x-request-id"] || crypto.randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },
  customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info"),
  autoLogging: { ignore: (req) => req.url === "/health" },
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});
