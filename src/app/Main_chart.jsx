"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import { Loader2, RefreshCw } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Updated color set
const chartConfig = {
  power: {
    label: "Power (W)",
    color: "#e6194B", // Crimson Red
  },
  current: {
    label: "Current (mA)",
    color: "#3cb44b", // Lime Green
  },
  voltage: {
    label: "Voltage (V)",
    color: "#4363d8", // Royal Blue
  },
};

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("1d");
  const [chartData, setChartData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      const response = await fetch("http://localhost:9060/main-chart/data");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setChartData(result.data);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData(true);
  };

  const getFilteredData = () => {
    if (!chartData) return [];
    switch (timeRange) {
      case "1d":
        return chartData.today || [];
      case "7d":
        return chartData.week || [];
      case "30d":
        return chartData.month || [];
      default:
        return chartData.week || [];
    }
  };

  const filteredData = getFilteredData();

  if (loading) {
    return (
      <Card className="pt-0 bg-gradient-to-br from-slate-800/40 to-indigo-900/40 border border-indigo-500/30 backdrop-blur-sm shadow-2xl">
        <CardHeader className="flex items-center gap-2 border-b border-indigo-400/30 py-6 sm:flex-row bg-gradient-to-r from-indigo-600/40 to-purple-600/40">
          <div className="grid flex-1 gap-2">
            <CardTitle className="text-2xl font-bold text-indigo-100">📈 Power Analytics</CardTitle>
            <CardDescription className="text-indigo-300/80">
              Loading power consumption data...
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-center h-[350px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
              <span className="text-indigo-300/80 font-medium">Loading chart data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="pt-0 bg-gradient-to-br from-slate-800/40 to-indigo-900/40 border border-indigo-500/30 backdrop-blur-sm shadow-2xl">
        <CardHeader className="flex items-center gap-2 border-b border-indigo-400/30 py-6 sm:flex-row bg-gradient-to-r from-indigo-600/40 to-purple-600/40">
          <div className="grid flex-1 gap-2">
            <CardTitle className="text-2xl font-bold text-indigo-100">📈 Power Analytics</CardTitle>
            <CardDescription className="text-rose-300/80">
              Error loading chart data
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-center h-[350px]">
            <div className="text-center">
              <p className="text-rose-400 mb-3 font-bold text-lg">⚠️ Failed to load data</p>
              <p className="text-slate-400 text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-0 bg-gradient-to-br from-slate-800/40 to-indigo-900/40 border border-indigo-500/30 backdrop-blur-sm shadow-2xl">
      <CardHeader className="flex items-center gap-2 border-b border-indigo-400/30 py-6 sm:flex-row bg-gradient-to-r from-indigo-600/40 to-purple-600/40">
        <div className="grid flex-1 gap-2">
          <CardTitle className="text-2xl font-bold text-indigo-100">📈 Power Analytics</CardTitle>
          <CardDescription className="text-indigo-300/80">
            Visualizing power consumption, current, and voltage trends
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="hidden w-[160px] sm:flex bg-slate-700/60 border-indigo-400/40 text-indigo-100">
              <SelectValue placeholder="Today" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-indigo-400/40">
              <SelectItem value="1d">📅 Today</SelectItem>
              <SelectItem value="7d">📊 Last 7 days</SelectItem>
              <SelectItem value="30d">📈 Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-12 h-12 rounded-xl border border-indigo-400/40 bg-slate-700/60 hover:bg-slate-700/80 disabled:opacity-50 flex justify-center items-center transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20"
          >
            <RefreshCw className={`h-5 w-5 text-indigo-300 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-6 sm:px-6 sm:pt-6 pb-6">
        <ChartContainer
          config={chartConfig}
          className="chart-container aspect-auto h-[350px] w-full rounded-xl overflow-hidden"
        >
          <ComposedChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillPower" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#51cf66" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#51cf66" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillVoltage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4dabf7" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#4dabf7" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              vertical={false} 
              stroke="#475569/30"
              strokeDasharray="0"
            />
            <XAxis
              dataKey={timeRange === "1d" ? "hour" : "date"}
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={32}
              tick={{ fill: "#cbd5e1", fontSize: 12, fontWeight: 500 }}
              tickFormatter={(value) => {
                if (timeRange === "1d") return `${value}:00`;
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              domain={[0, 5000]}
              tick={{ fill: "#cbd5e1", fontSize: 12, fontWeight: 500 }}
              label={{ value: "Power (W) / Current (mA)", angle: -90, position: "insideLeft", fill: "#cbd5e1", style: { textAnchor: "middle" } }}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              domain={[200, 260]}
              tick={{ fill: "#cbd5e1", fontSize: 12, fontWeight: 500 }}
              label={{ value: "Voltage (V)", angle: 90, position: "insideRight", fill: "#cbd5e1", style: { textAnchor: "middle" } }}
              tickFormatter={(value) => `${value.toFixed(0)}V`}
            />

            <ChartTooltip
              cursor={{ stroke: "#818cf8", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    if (timeRange === "1d") return `${value}:00`;
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      weekday: "short"
                    });
                  }}
                  indicator="dot"
                />
              }
              contentStyle={{
                backgroundColor: "#1e293b/95",
                border: "1px solid #4c1d95",
                borderRadius: "8px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
              }}
            />

            <Area
              dataKey="power"
              type="monotone"
              fill="url(#fillPower)"
              stroke="#ff6b6b"
              strokeWidth={3}
              dot={false}
              yAxisId="left"
              isAnimationActive={true}
              animationDuration={800}
            />
            <Area
              dataKey="current"
              type="monotone"
              fill="url(#fillCurrent)"
              stroke="#51cf66"
              strokeWidth={3}
              dot={false}
              yAxisId="left"
              isAnimationActive={true}
              animationDuration={800}
            />
            <Area
              dataKey="voltage"
              type="monotone"
              fill="url(#fillVoltage)"
              stroke="#4dabf7"
              strokeWidth={3}
              dot={false}
              yAxisId="right"
              isAnimationActive={true}
              animationDuration={800}
            />

            <ChartLegend 
              content={<ChartLegendContent />} 
              wrapperStyle={{ paddingTop: "20px" }}
            />
          </ComposedChart>
        </ChartContainer>
        
        {/* Info Box */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/40 backdrop-blur-sm">
            <p className="text-red-300/80 text-xs font-semibold uppercase tracking-wider">Power</p>
            <p className="text-red-100 text-lg font-bold mt-1">🔥 Watts</p>
          </div>
          <div className="p-4 rounded-lg bg-green-900/30 border border-green-500/40 backdrop-blur-sm">
            <p className="text-green-300/80 text-xs font-semibold uppercase tracking-wider">Current</p>
            <p className="text-green-100 text-lg font-bold mt-1">⚡ Milliamps</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-900/30 border border-blue-500/40 backdrop-blur-sm">
            <p className="text-blue-300/80 text-xs font-semibold uppercase tracking-wider">Voltage</p>
            <p className="text-blue-100 text-lg font-bold mt-1">🔌 Volts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
