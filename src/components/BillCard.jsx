"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";

const UNIT_PRICE_BDT = 7.72; // fixed per-user requirement

export default function BillCard({ initialRange = "1d" }) {
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

			const res = await fetch("http://localhost:9060/main-chart/data");
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const json = await res.json();
			if (json.success) setChartData(json.data);
			else throw new Error("backend returned success=false");
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
	}, []);

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
	// Assumptions:
	// - 1d (hourly) data: each point represents 1 hour
	// - 7d / 30d (daily) data: each point represents 24 hours
	// If dataset has varying interval or explicit duration fields, this can be improved.
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
			<Card>
				<CardHeader>
					<CardTitle>🔌 Electricity Bill</CardTitle>
					<CardDescription>Calculating electricity cost...</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center gap-3">
					<Loader2 className="animate-spin" />
					<span>Loading...</span>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>🔌 Electricity Bill</CardTitle>
					<CardDescription className="text-rose-500">Error: {error}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-3">
						<button onClick={handleRefresh} className="px-3 py-2 rounded bg-slate-700/70">Retry</button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="flex items-center justify-between">
				<div>
					<CardTitle>🔌 Electricity Bill</CardTitle>
					<CardDescription>Unit price: {UNIT_PRICE_BDT} BDT / kWh</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					<select
						value={timeRange}
						onChange={(e) => setTimeRange(e.target.value)}
						className="rounded px-2 py-1 bg-slate-700/60 text-white"
					>
						<option value="1d">Today (hourly)</option>
						<option value="7d">Last 7 days</option>
						<option value="30d">Last 30 days</option>
					</select>
					<button onClick={handleRefresh} disabled={refreshing} className="p-2 rounded bg-slate-700/60">
						<RefreshCw className={`${refreshing ? "animate-spin" : ""}`} />
					</button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-2">
					<div className="text-sm text-slate-400">Total units (kWh)</div>
					<div className="text-2xl font-bold">{units.toFixed(3)} kWh</div>
					<div className="text-sm text-slate-400 mt-2">Estimated cost</div>
					<div className="text-2xl font-bold">{cost.toFixed(2)} BDT</div>
				</div>
			</CardContent>
		</Card>
	);
}
