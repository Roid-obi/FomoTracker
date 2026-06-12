"use client";

import {
  Bar,
  BarChart,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const rankColors = ["#334155", "#475569", "#64748B", "#94A3B8", "#E2E8F0"];

// biome-ignore lint/suspicious/noExplicitAny: Recharts custom shape props are dynamic
const CustomBar = (props: any) => {
  const { height, payload, dataKey, rankedApps } = props;
  if (!payload || !dataKey || !height || height <= 0) return null;

  const appsOrder = rankedApps || [
    "Instagram",
    "TikTok",
    "YouTube",
    "WhatsApp",
  ];
  const activeApps = appsOrder.filter((app: string) => (payload[app] || 0) > 0);
  const isTop = activeApps[activeApps.length - 1] === dataKey;

  const radius = isTop ? [4, 4, 0, 0] : [0, 0, 0, 0];

  return <Rectangle {...props} radius={radius} />;
};

interface StatistikDailyChartProps {
  // biome-ignore lint/suspicious/noExplicitAny: recharts data is dynamic
  rankedDailyData: any[];
  top4AppsForRender: string[];
}

export default function StatistikDailyChart({
  rankedDailyData,
  top4AppsForRender,
}: StatistikDailyChartProps) {
  return (
    <div className="overflow-x-auto lg:overflow-x-visible pb-2 scrollbar-thin">
      <div className="h-64 min-w-[700px] lg:min-w-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rankedDailyData}
            margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
          >
            <XAxis
              dataKey="hari"
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                borderColor: "#e1e8ef",
                fontFamily: "Poppins",
                fontSize: "11px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
              }}
              // biome-ignore lint/suspicious/noExplicitAny: needed for Recharts dynamic Tooltip formatter types
              formatter={(value: any, name: any) => {
                if (value === 0) return null;
                return [`${value} menit`, name];
              }}
            />
            <Legend
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
            />
            {top4AppsForRender.map((appName, index) => (
              <Bar
                key={appName}
                dataKey={appName}
                stackId="a"
                fill={rankColors[index]}
                // biome-ignore lint/suspicious/noExplicitAny: Recharts custom shape receives dynamic properties
                shape={(shapeProps: any) => (
                  <CustomBar
                    {...shapeProps}
                    rankedApps={[...top4AppsForRender, "Lainnya"]}
                  />
                )}
              />
            ))}
            <Bar
              dataKey="Lainnya"
              stackId="a"
              fill={rankColors[4]}
              // biome-ignore lint/suspicious/noExplicitAny: Recharts custom shape receives dynamic properties
              shape={(shapeProps: any) => (
                <CustomBar
                  {...shapeProps}
                  rankedApps={[...top4AppsForRender, "Lainnya"]}
                />
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
