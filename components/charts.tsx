"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsPoint } from "@/lib/types";
import { usdWhole } from "@/lib/format";

const axis = {
  stroke: "#cbd5e1",
  fontSize: 11,
  tickLine: false as const,
  axisLine: false as const,
};

function money(v: number) {
  return usdWhole(v);
}

function shortDate(d: string) {
  const dt = new Date(`${d}T00:00:00Z`);
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

interface TooltipPayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
}

function KeptTooltip({
  active,
  payload,
  label,
  isMoney = true,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  isMoney?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-[12px]">
      <p className="mb-1 font-semibold text-ink">{shortDate(String(label))}</p>
      {payload.map((e, i) => (
        <p key={i} className="tabular-nums text-ink-2">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-sm"
            style={{ background: e.color }}
          />
          {e.name}:{" "}
          {isMoney ? money(Number(e.value ?? 0)) : String(e.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

export function FeesArea({ points }: { points: AnalyticsPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={points} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="feesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="0" vertical={false} />
        <XAxis dataKey="date" {...axis} tickFormatter={shortDate} minTickGap={40} />
        <YAxis {...axis} tickFormatter={(v: number) => `$${Math.round(v / 100000) / 10}k`} width={44} />
        <Tooltip content={<KeptTooltip />} />
        <Area
          name="Fees"
          type="monotone"
          dataKey="feesUsdCents"
          stroke="#1d4ed8"
          strokeWidth={1.8}
          fill="url(#feesFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SplitBars({ points }: { points: AnalyticsPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={points} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="date" {...axis} tickFormatter={shortDate} minTickGap={40} />
        <YAxis {...axis} tickFormatter={(v: number) => `$${Math.round(v / 100000) / 10}k`} width={44} />
        <Tooltip content={<KeptTooltip />} />
        <Bar name="Creator 80%" dataKey="creatorShareCents" stackId="s" fill="#1d4ed8" />
        <Bar
          name="Protocol 20%"
          dataKey="protocolShareCents"
          stackId="s"
          fill="#0b1220"
          radius={[3, 3, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SubsBar({ points }: { points: AnalyticsPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={points} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="date" {...axis} tickFormatter={shortDate} minTickGap={40} />
        <YAxis {...axis} width={34} />
        <Tooltip content={<KeptTooltip isMoney={false} />} />
        <Bar
          name="Subscriptions"
          dataKey="subsCount"
          fill="#059669"
          radius={[3, 3, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CashArea({ points }: { points: AnalyticsPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={points} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="date" {...axis} tickFormatter={shortDate} minTickGap={40} />
        <YAxis {...axis} tickFormatter={(v: number) => `$${Math.round(v / 100000) / 10}k`} width={44} />
        <Tooltip content={<KeptTooltip />} />
        <Area
          name="Donations paid"
          type="monotone"
          dataKey="cashUsdCents"
          stroke="#2563eb"
          strokeWidth={1.8}
          fill="none"
        />
        <Area
          name="Burned"
          type="monotone"
          dataKey="burnedUsdCents"
          stroke="#0b1220"
          strokeWidth={1.8}
          fill="none"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
