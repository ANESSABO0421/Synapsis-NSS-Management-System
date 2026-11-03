import Groq from "groq-sdk";

// Lazily-created Groq client: a missing GROQ_API_KEY disables AI features
// (503 on use) instead of crashing the whole server at import time.
let client = null;

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error("AI features are not configured (GROQ_API_KEY missing)");
    err.status = 503;
    throw err;
  }
  client ??= new Groq({ apiKey: process.env.GROQ_API_KEY });
  return client;
};

export const groq = {
  chat: {
    completions: {
      create: (...args) => getClient().chat.completions.create(...args),
    },
  },
};
