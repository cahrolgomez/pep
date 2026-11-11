import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export function useDados<T>(path: string | null, version = 0) {
  const [result, setResult] = useState<{ path: string; version: number; data?: T; error?: string }>();
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    apiRequest<T>(path, { signal: controller.signal })
      .then(data => {
        if (!controller.signal.aborted) setResult({ path, version, data });
      })
      .catch(error => {
        if (!controller.signal.aborted) setResult({ path, version, error: error.message });
      });
    return () => controller.abort();
  }, [path, version]);

  const current = result?.path === path && result?.version === version ? result : undefined;
  return { data: current?.data, error: current?.error, loading: !!path && !current };
}
