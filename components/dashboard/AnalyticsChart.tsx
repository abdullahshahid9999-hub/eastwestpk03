"use client";

import { useState, useTransition } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Download,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import {
  fetchMaturedBookingsForExport,
  type MonthlyAnalytics,
} from "@/lib/actions/booking-actions";

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface AnalyticsChartProps {
  data: MonthlyAnalytics[];
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-slate-800 mb-2">
        {formatMonth(label ?? "")}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center justify-between gap-4"
        >
          <span className="flex items-center gap-1.5 text-slate-600 capitalize">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-semibold text-slate-800">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function formatMonth(key: string): string {
  if (!key) return "";
  const [year, month] = key.split("-");
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
    "en-US",
    { month: "short", year: "numeric" }
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  delta,
  color,
}: {
  label: string;
  value: number;
  delta?: number;
  color: string;
}) {
  const positive = delta !== undefined && delta > 0;
  const negative = delta !== undefined && delta < 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
      </div>
      <p className="text-3xl font-bold text-[#002147] tabular-nums">{value}</p>
      {delta !== undefined && (
        <div
          className={`flex items-center gap-1 mt-2 text-xs font-medium ${
            positive
              ? "text-green-600"
              : negative
                ? "text-red-500"
                : "text-slate-400"
          }`}
        >
          {positive ? (
            <TrendingUp size={12} />
          ) : negative ? (
            <TrendingDown size={12} />
          ) : (
            <Minus size={12} />
          )}
          <span>
            {positive ? "+" : ""}
            {delta} vs last month
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Chart ────────────────────────────────────────────────────────────────

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  const [isPending, startTransition] = useTransition();
  const [exportError, setExportError] = useState<string | null>(null);

  // Compute KPIs from last 2 months
  const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month));
  const current = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  const totalAll = data.reduce((s, d) => s + d.total, 0);
  const totalMatured = data.reduce((s, d) => s + d.matured, 0);
  const totalApproved = data.reduce((s, d) => s + d.approved, 0);
  const maturedRate =
    totalAll > 0 ? Math.round((totalMatured / totalAll) * 100) : 0;

  const delta = (field: keyof MonthlyAnalytics) =>
    current && previous
      ? (current[field] as number) - (previous[field] as number)
      : undefined;

  // CSV Export
  const handleExport = () => {
    setExportError(null);
    startTransition(async () => {
      const result = await fetchMaturedBookingsForExport();
      if (!result.success || !result.data) {
        setExportError(result.message ?? "Export failed.");
        return;
      }
      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `matured-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  // Chart data with readable labels
  const chartData = sorted.map((d) => ({
    ...d,
    monthLabel: formatMonth(d.month),
  }));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-slate-400 gap-3">
        <BarChart3 size={40} className="text-slate-200" />
        <p className="text-sm">No analytics data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Bookings"
          value={totalAll}
          delta={delta("total")}
          color="#002147"
        />
        <KpiCard
          label="Approved"
          value={totalApproved}
          delta={delta("approved")}
          color="#D4AF37"
        />
        <KpiCard
          label="Matured"
          value={totalMatured}
          delta={delta("matured")}
          color="#10b981"
        />
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Maturity Rate
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <p className="text-3xl font-bold text-[#002147] tabular-nums">
            {maturedRate}%
          </p>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${maturedRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chart Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-[#002147]">
              Monthly Booking Trends
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Matured vs Total bookings over the last 12 months
            </p>
          </div>
          <div className="flex items-center gap-2">
            {exportError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle size={12} />
                {exportError}
              </div>
            )}
            <button
              onClick={handleExport}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#002147] text-white text-xs font-semibold rounded-lg hover:bg-[#002147]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              {isPending ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="px-4 py-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 12, left: -10, bottom: 4 }}
              barGap={4}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f8fafc", radius: 4 }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                formatter={(value) => (
                  <span style={{ color: "#64748b", textTransform: "capitalize" }}>
                    {value}
                  </span>
                )}
              />

              {/* Total bar */}
              <Bar dataKey="total" name="total" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.month === current?.month ? "#002147" : "#e2e8f0"
                    }
                  />
                ))}
              </Bar>

              {/* Matured bar */}
              <Bar
                dataKey="matured"
                name="matured"
                fill="#D4AF37"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />

              {/* Approved bar */}
              <Bar
                dataKey="approved"
                name="approved"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend note */}
        <div className="px-6 pb-4 flex flex-wrap gap-4">
          {[
            { color: "#002147", label: "Total Bookings" },
            { color: "#D4AF37", label: "Matured (Completed)" },
            { color: "#10b981", label: "Approved" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: color }}
              />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}