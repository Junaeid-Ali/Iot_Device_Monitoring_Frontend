"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { generateDummyClassroomData } from "@/lib/dummyData";

const UNIT_PRICE_BDT = 7.72; // fixed per-user requirement

export default function BillCard({ classroomId, initialRange = "1d" }) {
  const [timeRange, setTimeRange] = React.useState(initialRange);
  const [chartData, setChartData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      let json;
      if (classroomId === 1) {
        // Real data from backend
        const res = await fetch("http://localhost:9060/main-chart/data");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        json = await res.json();
        if (!json.success) throw new Error("backend returned success=false");
      } else {
        // Dummy data for other classrooms
        json = generateDummyClassroomData(classroomId || 1);
        if (!json.success) throw new Error("Failed to generate data");
      }
      
      if (json.success) setChartData(json.data);
      else throw new Error("Failed to fetch/generate data");
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [classroomId]);

  const handleRefresh = () => fetchData(true);

  const getFiltered = () => {
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

  // Compute energy units (kWh) from power readings (watts)
  const computeUnitsAndCost = (data) => {
    if (!data || data.length === 0) return { units: 0, cost: 0 };

    let hoursPerPoint = 24; // default for multi-day
    if (timeRange === "1d") hoursPerPoint = 1;

    // Sum power values (watts) and convert to kWh: sum(watts * hours) / 1000
    const totalWh = data.reduce((acc, item) => {
      const p = Number(item.power ?? item.watts ?? item.POWER ?? 0);
      if (Number.isFinite(p)) return acc + p * hoursPerPoint;
      return acc;
    }, 0);

    const units = totalWh / 1000; // kWh
    const cost = units * UNIT_PRICE_BDT;
    return { units, cost };
  };

  const filtered = getFiltered();
  const { units, cost } = computeUnitsAndCost(filtered);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/40 to-indigo-900/40 border border-indigo-500/30 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border-b border-indigo-400/30">
          <CardTitle>💰 Classroom {classroomId} Bill</CardTitle>
          <CardDescription>Calculating electricity cost...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 pt-6">
          <Loader2 className="animate-spin text-indigo-400" />
          <span className="text-indigo-200">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/40 to-indigo-900/40 border border-indigo-500/30 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border-b border-indigo-400/30">
          <CardTitle>💰 Classroom {classroomId} Bill</CardTitle>
          <CardDescription className="text-rose-400">Error: {error}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <button onClick={handleRefresh} className="px-3 py-2 rounded bg-slate-700/70 text-indigo-200">
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/40 to-indigo-900/40 border border-indigo-500/30 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border-b border-indigo-400/30 flex items-center justify-between">
        <div>
          <CardTitle className="text-indigo-100">💰 Classroom {classroomId} - Bill</CardTitle>
          <CardDescription className="text-indigo-300/80">Unit price: {UNIT_PRICE_BDT} BDT / kWh</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded px-2 py-1 bg-slate-700/60 border border-indigo-400/40 text-indigo-100 text-sm"
          >
            <option value="1d">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded bg-slate-700/60 border border-indigo-400/40 hover:bg-slate-700/80 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-indigo-300 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <div className="text-sm text-indigo-300/80 uppercase tracking-widest mb-2">Total Units (kWh)</div>
          <div className="text-3xl font-bold text-indigo-100">{units.toFixed(3)} kWh</div>
        </div>
        <div>
          <div className="text-sm text-indigo-300/80 uppercase tracking-widest mb-2">Estimated Cost</div>
          <div className="text-3xl font-bold text-green-400">{cost.toFixed(2)} BDT</div>
        </div>
      </CardContent>
    </Card>
  );
}
