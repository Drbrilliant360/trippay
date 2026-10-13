"use client";

import { useEffect, useState } from "react";

/**
 * Returns the value once it has been stable for `delayMs`. Used by search
 * inputs so each keystroke doesn't fire its own API request.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
