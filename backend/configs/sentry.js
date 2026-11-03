// @ts-check
import * as Sentry from "@sentry/node";

// Error reporting is opt-in: set SENTRY_DSN to enable.
export const sentryEnabled = Boolean(process.env.SENTRY_DSN);

if (sentryEnabled) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),
  });
}

export const captureException = (err, context) => {
  if (sentryEnabled) Sentry.captureException(err, context);
};
