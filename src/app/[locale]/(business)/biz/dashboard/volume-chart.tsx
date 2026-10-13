"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/money";
import { formatShortDate } from "@/lib/datetime";

interface VolumeChartProps {
  trend: { date: string; amountMinor: number }[];
}

/** Single-series 14-day payment volume. Brand red line per the design tokens. */
export function VolumeChart({ trend }: VolumeChartProps) {
  const t = useTranslations("bizDashboard");
  const locale = useLocale();

  const data = trend.map((point) => ({
    ...point,
    label: formatShortDate(point.date, locale),
  }));

  return (
    <figure aria-label={t("chartAria")}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E31E24" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#E31E24" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6B6B6B", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#E5E5E5" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#6B6B6B", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat(locale, {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(value)
              }
            />
            <Tooltip
              cursor={{ stroke: "#6B6B6B", strokeDasharray: "3 3" }}
              formatter={(value) => [
                formatMoney(
                  { amountMinor: Number(value), currency: "TZS" },
                  locale,
                ),
                t("volume"),
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E5E5",
                fontSize: 12,
                fontVariantNumeric: "tabular-nums",
              }}
            />
            <Area
              type="monotone"
              dataKey="amountMinor"
              stroke="#E31E24"
              strokeWidth={2}
              fill="url(#volumeFill)"
              dot={false}
              activeDot={{ r: 4, fill: "#E31E24", stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">{t("chartAria")}</figcaption>
    </figure>
  );
}
