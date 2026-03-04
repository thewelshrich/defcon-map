import { queryOptions } from "@tanstack/react-query";
import type { DefconSummary } from "../../domain/defcon";

export async function fetchDefconSummary() {
  const response = await fetch("/api/summary.json");

  if (!response.ok) {
    throw new Error(`Failed to load DEFCON summary: ${response.status}`);
  }

  return (await response.json()) as DefconSummary;
}

export function getSummaryQueryOptions() {
  return queryOptions({
    queryKey: ["defcon-summary"],
    queryFn: fetchDefconSummary
  });
}
