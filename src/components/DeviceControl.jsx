"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import classroomBus from "@/lib/classroomBus";

export function DeviceControl({ classroomId }) {
  const [switchState, setSwitchState] = React.useState(false);
  const [switchLoading, setSwitchLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  // Fetch initial switch status
  React.useEffect(() => {
    const fetchSwitchStatus = async () => {
      try {
        if (classroomId === 1) {
          // Real data: fetch from backend
          const response = await fetch("http://localhost:9060/switch-status");
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const result = await response.json();
          if (result.success && result.data) {
            setSwitchState(result.data.switch);
            console.log("Current switch status for classroom 1:", result.data.switch);
          } else {
            throw new Error(result.error || "Failed to fetch switch status");
          }
        } else {
          // Dummy data: generate deterministic state based on classroomId
          const dummyState = classroomId % 2 === 0;
          setSwitchState(dummyState);
          console.log("Dummy switch status for classroom", classroomId, ":", dummyState);
          // ensure the bus reflects initial dummy state
          classroomBus.setSwitchState(classroomId, dummyState);
        }
      } catch (err) {
        console.error("Error fetching switch status:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSwitchStatus();
  }, [classroomId]);

  const handleSwitchToggle = async (checked) => {
    try {
      setSwitchLoading(true);

      if (classroomId === 1) {
        // Real control: send to backend
        const response = await fetch("http://localhost:9060/switch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state: checked }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          setSwitchState(checked);
          console.log(`Classroom 1 device switched ${checked ? "on" : "off"} successfully`);
        } else {
          throw new Error(result.error || "Failed to control device switch");
        }
      } else {
        // Dummy control: just toggle locally
        setSwitchState(checked);
        console.log(`Classroom ${classroomId} device switched ${checked ? "on" : "off"} (simulated)`);
        // start/stop simulated live metrics via bus
        classroomBus.setSwitchState(classroomId, checked);
      }
    } catch (err) {
      console.error("Error controlling device switch:", err);
      setSwitchState(!checked);
      alert(`Failed to switch device: ${err.message}`);
    } finally {
      setSwitchLoading(false);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-slate-800/40 to-purple-900/40 shadow-2xl border border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300">
      <CardHeader className="pb-4 border-b border-purple-500/20">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          🎮 Classroom {classroomId} - Device Control
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-purple-200/80">
              Device Status
            </span>
            <span className={`text-sm font-bold px-4 py-2 rounded-full w-fit transition-all duration-300 ${
              initialLoading
                ? "bg-slate-700/60 text-slate-300 border border-slate-600/40"
                : switchState
                ? "bg-emerald-900/60 text-emerald-200 border border-emerald-500/50 shadow-lg shadow-emerald-500/20"
                : "bg-rose-900/60 text-rose-200 border border-rose-500/50 shadow-lg shadow-rose-500/20"
            }`}>
              {initialLoading
                ? "⏳ Loading..."
                : switchState
                ? "✅ Device ON"
                : "⛔ Device OFF"}
            </span>
          </div>
          <Switch
            checked={switchState}
            onCheckedChange={handleSwitchToggle}
            disabled={switchLoading || initialLoading}
            className="scale-150"
          />
        </div>
      </CardContent>
    </Card>
  );
}
