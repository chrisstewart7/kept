"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AnalyticsPoint,
  Burn,
  Creator,
  FlowStep,
  PayPigInfo,
  OfframpEvent,
  Payout,
  Stats,
  Token,
} from "./types";

export type PayoutRowData = Payout & {
  creator: Creator | null;
  token: Token | null;
};

export type TokenRowData = Token & { creator: Creator | null };

const base = process.env.PAYPIG_API_BASE ?? "";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

export function useStats() {
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: () => get("/api/stats"),
    refetchInterval: 8000,
  });
}

export function usePayments(rail: string, cursor = 0, poll = true) {
  return useQuery<{ items: PayoutRowData[]; nextCursor: number | null }>({
    queryKey: ["payments", rail, cursor],
    queryFn: () => get(`/api/payments?rail=${rail}&cursor=${cursor}&limit=25`),
    refetchInterval: poll && cursor === 0 ? 8000 : false,
    placeholderData: (prev) => prev,
  });
}

export function useTokens(sort: string, q: string) {
  return useQuery<{ items: TokenRowData[] }>({
    queryKey: ["tokens", sort, q],
    queryFn: () => get(`/api/tokens?sort=${sort}&q=${encodeURIComponent(q)}`),
    placeholderData: (prev) => prev,
  });
}

export function useToken(mint: string) {
  return useQuery<{
    token: Token;
    creator: Creator | null;
    payments: PayoutRowData[];
  }>({
    queryKey: ["token", mint],
    queryFn: () => get(`/api/tokens/${mint}`),
    refetchInterval: 15000,
  });
}

export function useCreator(handle: string) {
  return useQuery<{
    creator: Creator;
    tokens: TokenRowData[];
    payments: PayoutRowData[];
  }>({
    queryKey: ["creator", handle],
    queryFn: () => get(`/api/creators/${handle}`),
    refetchInterval: 15000,
  });
}

export function useAnalytics(range: "1d" | "30d" | "all") {
  return useQuery<{
    points: AnalyticsPoint[];
    stats: Stats;
    topCreators: Creator[];
    topTokens: TokenRowData[];
  }>({
    queryKey: ["analytics", range],
    queryFn: () => get(`/api/analytics?range=${range}`),
    placeholderData: (prev) => prev,
  });
}

export function usePayPig() {
  return useQuery<{ info: PayPigInfo; burns: Burn[] }>({
    queryKey: ["paypig"],
    queryFn: () => get("/api/paypig"),
    refetchInterval: 15000,
  });
}

export function useBurns() {
  return useQuery<{ items: Burn[] }>({
    queryKey: ["burns"],
    queryFn: () => get("/api/burns"),
    refetchInterval: 15000,
  });
}

export function useOfframp() {
  return useQuery<{ items: OfframpEvent[] }>({
    queryKey: ["offramp"],
    queryFn: () => get("/api/offramp"),
  });
}

export function useFlow() {
  return useQuery<{ steps: FlowStep[]; example: boolean }>({
    queryKey: ["flow"],
    queryFn: () => get("/api/flow"),
    refetchInterval: 30000,
  });
}

export function useSearch(q: string) {
  return useQuery<{ tokens: TokenRowData[]; creators: Creator[] }>({
    queryKey: ["search", q],
    queryFn: () => get(`/api/search?q=${encodeURIComponent(q)}`),
    enabled: q.trim().length > 0,
    placeholderData: (prev) => prev,
  });
}
