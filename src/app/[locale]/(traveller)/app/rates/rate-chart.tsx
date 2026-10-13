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
import type { RatePoint } from "@/lib/api/rates";
import { formatShortDate } from "@/lib/datetime";

interface RateChartProps {
  pair: string;
  history: RatePoint[];
}

/** 30-day single-series rate trend. Brand red line per the design tokens. */
export function RateChart({ pair, history }: RateChartProps) {
  const t = useTranslations("rates");
  const locale = useLocale();

  const data = history.map((point) => ({
    ...point,
    label: formatShortDate(point.date, locale),
  }));

  const formatRate = (value: number) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <figure aria-label={t("chartAria", { pair })}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
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
              domain={["dataMin", "dataMax"]}
              tick={{ fill: "#6B6B6B", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={formatRate}
            />
            <Tooltip
              cursor={{ stroke: "#6B6B6B", strokeDasharray: "3 3" }}
              formatter={(value) => [
                new Intl.NumberFormat(locale, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(Number(value)),
                pair,
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
              dataKey="rate"
              stroke="#E31E24"
              strokeWidth={2}
              fill="url(#rateFill)"
              dot={false}
              activeDot={{ r: 4, fill: "#E31E24", stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">{t("chartAria", { pair })}</figcaption>
    </figure>
  );
}
