"use client";

import { useEffect } from "react";

/**
 * Run a data loader when the component mounts (or deps change).
 *
 * Loaders usually set state (loading flags, results). Calling them directly in
 * an effect body sets state synchronously during the commit, causing an extra
 * cascading render (react-hooks/set-state-in-effect). Deferring by a microtask
 * avoids that, and the `active` flag skips the load if the component unmounted
 * first (e.g. React StrictMode's mount/unmount/mount in development).
 */
export default function useLoad(load, deps = []) {
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) load();
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller controls deps, exactly like useEffect
  }, deps);
}
