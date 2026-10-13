"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  // The caches are created once but must always toast in the current locale.
  const tRef = useRef(t);
  tRef.current = t;

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cached pages render instantly on back/forward navigation; data
            // is refetched in the background once it's older than this.
            staleTime: 60_000,
            retry: 1,
          },
        },
        // Safety net: any mutation without its own error UI still tells the
        // user the action failed (mock API today, real API later).
        mutationCache: new MutationCache({
          onError: (_error, _variables, _context, mutation) => {
            if (mutation.meta?.silentError) return;
            toast.error(tRef.current("actionFailedTitle"), {
              description: tRef.current("actionFailedBody"),
            });
          },
        }),
        // Initial-load failures render an inline ErrorState; this covers
        // background refetches that would otherwise fail invisibly.
        queryCache: new QueryCache({
          onError: (_error, query) => {
            if (query.state.data !== undefined) {
              toast.error(tRef.current("refreshFailed"));
            }
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
