"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

interface TrendChartProps {
  title: string;
  description?: string;
  data: Array<{
    name: string;
    value: number;
    [key: string]: any;
  }>;
  className?: string;
  valueFormatter?: (value: number) => string;
  categories?: string[];
  colors?: string[];
  index?: string;
  showYAxis?: boolean;
  showXAxis?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  tooltipFormatter?: (value: number) => string;
  tooltipLabelFormatter?: (label: string) => string;
  type?: "line" | "area";
  showDots?: boolean;
  yAxisWidth?: number;
}

export function TrendChart({
  title,
  description,
  data,
  className,
  valueFormatter = (value) => `${value}`,
  categories = ["value"],
  colors = ["primary"],
  index = "name",
  showYAxis = true,
  showXAxis = true,
  showGrid = true,
  showTooltip = true,
  tooltipFormatter,
  tooltipLabelFormatter,
  type = "line",
  showDots = true,
  yAxisWidth = 40,
}: TrendChartProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar parpadeo durante la hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Colores base según el tema
  const getColor = (colorName: string, opacity = 1) => {
    const colorMap: Record<string, Record<string, string>> = {
      light: {
        primary: `rgba(var(--primary), ${opacity})`,
        secondary: `rgba(var(--secondary), ${opacity})`,
        success: `rgba(75, 192, 192, ${opacity})`,
        warning: `rgba(255, 159, 64, ${opacity})`,
        danger: `rgba(255, 99, 132, ${opacity})`,
        info: `rgba(54, 162, 235, ${opacity})`,
      },
      dark: {
        primary: `rgba(var(--primary), ${opacity})`,
        secondary: `rgba(var(--secondary), ${opacity})`,
        success: `rgba(75, 192, 192, ${opacity})`,
        warning: `rgba(255, 159, 64, ${opacity})`,
        danger: `rgba(255, 99, 132, ${opacity})`,
        info: `rgba(54, 162, 235, ${opacity})`,
      },
    };

    return (
      colorMap[theme === "dark" ? "dark" : "light"][colorName] || colorName
    );
  };

  // Personalización del tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-lg text-sm">
          <p className="font-medium">
            {tooltipLabelFormatter ? tooltipLabelFormatter(label) : label}
          </p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}:{" "}
              {tooltipFormatter
                ? tooltipFormatter(entry.value as number)
                : valueFormatter(entry.value as number)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!mounted) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="h-[200px] animate-pulse bg-muted rounded-md" />
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === "line" ? (
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                {showGrid && (
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                )}
                {showXAxis && (
                  <XAxis
                    dataKey={index}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                )}
                {showYAxis && (
                  <YAxis
                    tickFormatter={valueFormatter}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    width={yAxisWidth}
                    stroke="var(--muted-foreground)"
                  />
                )}
                {showTooltip && <Tooltip content={<CustomTooltip />} />}
                {categories.map((category, i) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    name={category}
                    stroke={getColor(colors[i] || "primary")}
                    activeDot={{ r: 6, fill: getColor(colors[i] || "primary") }}
                    dot={
                      showDots
                        ? { r: 3, fill: getColor(colors[i] || "primary") }
                        : false
                    }
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            ) : (
              <AreaChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                {showGrid && (
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                )}
                {showXAxis && (
                  <XAxis
                    dataKey={index}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                )}
                {showYAxis && (
                  <YAxis
                    tickFormatter={valueFormatter}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    width={yAxisWidth}
                    stroke="var(--muted-foreground)"
                  />
                )}
                {showTooltip && <Tooltip content={<CustomTooltip />} />}
                {categories.map((category, i) => (
                  <Area
                    key={category}
                    type="monotone"
                    dataKey={category}
                    name={category}
                    stroke={getColor(colors[i] || "primary")}
                    fill={getColor(colors[i] || "primary", 0.2)}
                    activeDot={{ r: 6, fill: getColor(colors[i] || "primary") }}
                    dot={
                      showDots
                        ? { r: 3, fill: getColor(colors[i] || "primary") }
                        : false
                    }
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
