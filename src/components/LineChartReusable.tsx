"use client"

import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface LineChartReusableProps {
    data: any[];
    config: ChartConfig;
    xAxisKey?: string;
    lines: { key: string; color: string; label?: string }[];
    yAxisFormatter?: (value: any) => string;
}

export function LineChartReusable({
    data,
    config,
    xAxisKey = "name",
    lines,
    yAxisFormatter = (value) => `$${(value / 1000).toFixed(0)}k`
}: LineChartReusableProps) {
    return (
        <ChartContainer config={config} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} stroke="#ccc" />
                    <XAxis
                        dataKey={xAxisKey}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={yAxisFormatter}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {lines.map((line) => (
                        <Line
                            key={line.key}
                            type="monotone"
                            dataKey={line.key}
                            stroke={`var(--color-${line.key})`}
                            strokeWidth={3}
                            dot={{ r: 5, fill: `var(--color-${line.key})`, strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
