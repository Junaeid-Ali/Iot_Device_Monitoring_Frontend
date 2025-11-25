"use client";

import { ChartAreaInteractive } from "./Main_chart";
import { DeviceControl } from "@/components/DeviceControl";
import BillCard from "@/components/BillCard";
import ClassroomSelector from "@/components/ClassroomSelector";
import FloorSelector from "@/components/FloorSelector";
import DeviceManager from "@/components/DeviceManager";
import React, { useEffect, useState } from "react";
import classroomBus from "@/lib/classroomBus";
import { generateDummyClassroomData } from "@/lib/dummyData";



export default function Home() {
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  // Get emission for selected classroom only (when selected)
  const selectedDummy = selectedClassroom ? generateDummyClassroomData(selectedClassroom) : null;
  const todayEmission = selectedDummy
    ? selectedDummy.data.today.reduce((sum, h) => sum + h.carbonEmission, 0).toFixed(2)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-900 to-purple-950 p-4 md:p-10">
      {/* Header */}
      <div className="mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/30 to-purple-700/20 rounded-2xl blur-2xl transform -rotate-2"></div>
        <div className="relative px-6 py-8 rounded-3xl border border-indigo-500/20 backdrop-blur-md bg-gradient-to-r from-indigo-900/40 to-purple-900/30 shadow-xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 mb-2">
            🏢 FUB Building Power Dashboard
          </h1>
          <p className="text-indigo-200/80 text-sm md:text-lg font-medium tracking-wide">
            Multi-Floor Real-Time Monitoring • 30 Classrooms
          </p>
        </div>
      </div>

      {/* Small Carbon Emission Card for selected classroom, with floor info */}
      <div className="mb-4 flex justify-start">
        <div className="bg-green-900/60 border border-green-700/40 rounded-lg px-3 py-2 flex flex-col items-center shadow-sm" style={{ minWidth: '120px', maxWidth: '160px' }}>
          <span className="text-green-300 text-xs font-semibold">🌱 CO₂ Today</span>
          <span className="text-green-100 text-base font-bold font-mono leading-tight">{todayEmission ?? "--"} {todayEmission ? 'kg' : ''}</span>
          <span className="text-green-400 text-[10px] mt-1">{selectedDummy ? selectedDummy.classroomName : 'No classroom selected'}</span>
          <span className="text-green-500 text-[10px] mt-1">{selectedDummy ? `Floor ${selectedDummy.floor}` : ''}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Classroom Selector & Data Display */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-5">
            <FloorSelector selectedFloor={selectedFloor} onSelectFloor={(f) => { setSelectedFloor(f); setSelectedClassroom(null); }} />
            <ClassroomSelector selectedFloor={selectedFloor} selectedClassroom={selectedClassroom} onSelectClassroom={(c) => setSelectedClassroom(c)} />
            <DeviceManager selectedClassroom={selectedClassroom} />
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



