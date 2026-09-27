"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// The token lives in localStorage, which the server cannot read, so the first
// render must produce the same empty output on both sides. Resolving the session
// in a mount effect (rather than a lazy useState initializer) is what keeps
// server HTML and client hydration identical.
export default function useAuthGuard(allowedRoles, { redirectTo = "/login" } = {}) {
  const router = useRouter();
  const [session, setSession] = useState({ ready: false, token: null, role: null });

  const roleKey = Array.isArray(allowedRoles) ? allowedRoles.join(",") : allowedRoles;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.replace(redirectTo);
      return;
    }

    const allowed = roleKey ? roleKey.split(",") : null;
    if (allowed && !allowed.includes(role)) {
      router.replace(redirectTo);
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing an external store (localStorage) into React after mount; see note above
    setSession({ ready: true, token, role });
  }, [router, redirectTo, roleKey]);

  return session;
}
