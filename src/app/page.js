"use client";

import { ChartAreaInteractive } from "./Main_chart";
import { DeviceControl } from "@/components/DeviceControl";
import BillCard from "@/components/BillCard";
import ClassroomSelector from "@/components/ClassroomSelector";
import React, { useEffect, useState } from "react";
import classroomBus from "@/lib/classroomBus";

export default function Home() {
  const [selectedClassroom, setSelectedClassroom] = useState(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
        <div className="relative px-6 py-8 rounded-2xl border border-indigo-500/30 backdrop-blur-sm bg-gradient-to-r from-indigo-950/50 to-purple-950/50">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-300 via-purple-200 to-indigo-300 bg-clip-text text-transparent mb-3">
            🏢 Building Power Dashboard
          </h1>
          <p className="text-indigo-200/80 text-lg font-light tracking-wide">
            Multi-Classroom Real-Time Monitoring • 30 Classrooms
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Classroom Selector & Data Display */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-5">
            <ClassroomSelector selectedClassroom={selectedClassroom} onSelectClassroom={setSelectedClassroom} />
            <App classroomId={selectedClassroom} />
            <BillCard classroomId={selectedClassroom} />
          </div>
        </div>

        {/* Right Content - Chart and Control */}
        <div className="lg:col-span-3 space-y-6">
          <DeviceControl classroomId={selectedClassroom} />
          <ChartAreaInteractive classroomId={selectedClassroom} />
        </div>
      </div>
    </div>
  );
}function App({ classroomId }) {
  const [data, setData] = useState(null);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    // For classroom 1 use backend WebSocket. For others subscribe to classroomBus.
    if (classroomId === 1) {
      const ws = new WebSocket("ws://localhost:9060");

      ws.onopen = () => console.log("WebSocket connected");
      ws.onmessage = (event) => {
        try {
          const newData = JSON.parse(event.data);
          setData(newData);
          setBlink(true);
          setTimeout(() => setBlink(false), 150);
        } catch (err) {
          console.error("Error parsing message", err);
        }
      };
      ws.onerror = (err) => console.error("WebSocket error", err);
      ws.onclose = () => console.warn("WebSocket closed");
      return () => ws.close();
    } else {
      // subscribe to simulated live metrics for other classrooms
      const unsubscribe = classroomBus.subscribe(classroomId, (payload) => {
        setData(payload);
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
      });
      // also set current switch state: if it's off, bus will publish an off payload when stopped
      return () => {
        try {
          unsubscribe();
        } catch (e) {}
      };
    }
  }, [classroomId]);

  const blinkClass = blink
    ? "opacity-0 transition-opacity duration-150"
    : "opacity-100 transition-opacity duration-150";

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-indigo-900/40 rounded-2xl shadow-2xl overflow-hidden border border-indigo-500/30 backdrop-blur-sm">
      <div className="bg-gradient-to-r from-indigo-600/60 to-purple-600/60 backdrop-blur-sm px-6 py-5 border-b border-indigo-400/30">
        <h2 className="text-2xl font-bold text-indigo-100">📊 Live Metrics</h2>
      </div>
      
      {data ? (
        <div className="p-6 space-y-4">
          {/* Time */}
          <div className="group p-5 rounded-xl bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/40 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer">
            <div className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-2 opacity-80 group-hover:opacity-100">
              ⏰ Time
            </div>
            <div className={`text-3xl font-bold text-blue-100 ${blinkClass} font-mono`}>
              {new Date(data.time).toLocaleTimeString()}
            </div>
          </div>

          {/* Current */}
          <div className="group p-5 rounded-xl bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-500/40 hover:border-emerald-400/60 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer">
            <div className="text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-2 opacity-80 group-hover:opacity-100">
              ⚡ Current
            </div>
            <div className="text-3xl font-bold text-emerald-100 font-mono">
              {data.current} <span className="text-lg font-normal text-emerald-300">mA</span>
            </div>
          </div>

          {/* Voltage */}
          <div className="group p-5 rounded-xl bg-gradient-to-br from-amber-900/40 to-amber-800/20 border border-amber-500/40 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 cursor-pointer">
            <div className="text-xs font-semibold text-amber-300 uppercase tracking-widest mb-2 opacity-80 group-hover:opacity-100">
              🔌 Voltage
            </div>
            <div className="text-3xl font-bold text-amber-100 font-mono">
              {data.voltage} <span className="text-lg font-normal text-amber-300">V</span>
            </div>
          </div>

          {/* Power */}
          <div className="group p-5 rounded-xl bg-gradient-to-br from-rose-900/40 to-rose-800/20 border border-rose-500/40 hover:border-rose-400/60 hover:shadow-lg hover:shadow-rose-500/20 transition-all duration-300 cursor-pointer">
            <div className="text-xs font-semibold text-rose-300 uppercase tracking-widest mb-2 opacity-80 group-hover:opacity-100">
              🔥 Power
            </div>
            <div className="text-3xl font-bold text-rose-100 font-mono">
              {data.power} <span className="text-lg font-normal text-rose-300">W</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin"></div>
            <p className="text-indigo-300/80 font-medium tracking-wide">Waiting for data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
