"use client";

import { installAxiosInterceptors } from "@/utils/api";

// Installed at module load (client only) so it runs before any page's effects fire requests.
if (typeof window !== "undefined") installAxiosInterceptors();

export default function ApiSetup() {
  return null;
}
