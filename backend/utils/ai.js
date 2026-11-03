// @ts-check
import Groq from "groq-sdk";
import { HttpError } from "./httpError.js";

// Lazily-created Groq client: a missing GROQ_API_KEY disables AI features
// (503 on use) instead of crashing the whole server at import time.
let client = null;

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new HttpError(503, "AI features are not configured (GROQ_API_KEY missing)");
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
