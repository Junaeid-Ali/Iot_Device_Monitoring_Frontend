"use client";

import React, { useEffect, useState } from "react";
import { generateDummyClassroomData } from "@/lib/dummyData";

// Helper to format classroom label (FUB-<floor><room>)
function formatClassLabel(classNum) {
  let floor = classNum <= 28 ? Math.ceil(classNum / 4) : 8;
  let roomIndex;
  if (floor <= 7) {
    const start = (floor - 1) * 4 + 1;
    roomIndex = classNum - start + 1;
  } else {
    roomIndex = classNum - 28; // 1..2
  }
  const roomStr = String(roomIndex).padStart(2, "0");
  return `FUB-${floor}${roomStr}`;
}

const STORAGE_KEY = "fub_devices";

export default function DeviceManager({ selectedClassroom }) {
  const [devices, setDevices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ id: "", name: "", assignedTo: null });
  const [openScheduleFor, setOpenScheduleFor] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDevices(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  }, [devices]);

  const resetForm = () => setForm({ id: "", name: "", assignedTo: null });

  const handleAdd = () => {
    if (!form.id.trim()) return alert("Device ID required");
    if (!form.name.trim()) return alert("Device name required");
    if (devices.find((d) => d.id === form.id.trim())) return alert("Device ID already exists");
    const newDev = { id: form.id.trim(), name: form.name.trim(), assignedTo: selectedClassroom || form.assignedTo };
    setDevices((s) => [newDev, ...s]);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editing) return;
    setDevices((s) => s.map((d) => (d.id === editing ? { ...d, name: form.name.trim(), assignedTo: form.assignedTo } : d)));
    setEditing(null);
    resetForm();
  };

  const handleEdit = (dev) => {
    setEditing(dev.id);
    setForm({ id: dev.id, name: dev.name, assignedTo: dev.assignedTo ?? null });
  };

  const handleDelete = (id) => {
    if (!confirm(`Delete device ${id}?`)) return;
    setDevices((s) => s.filter((d) => d.id !== id));
    if (editing === id) {
      setEditing(null);
      resetForm();
    }
  };

  // classroom options 1..30 formatted
  const classroomOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  // Estimate savings: if selectedClassroom has any devices with schedules enabled,
  // show estimated saving = 20% of today's emissions for that classroom.
  let estimatedSaving = null;
  if (selectedClassroom) {
    try {
      const dummy = generateDummyClassroomData(selectedClassroom);
      const todayEmission = dummy.data.today.reduce((sum, h) => sum + h.carbonEmission, 0);
      const devicesForClass = devices.filter((d) => d.assignedTo === selectedClassroom);
      const hasSchedule = devicesForClass.some((d) => Array.isArray(d.schedules) && d.schedules.some((s) => s.enabled));
      if (hasSchedule) estimatedSaving = (todayEmission * 0.2).toFixed(2);
    } catch (e) {
      estimatedSaving = null;
    }
  }

  const nowIsBetween = (start, end) => {
    if (!start || !end) return false;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
    // overnight schedule
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  };

  const toggleScheduleEnabled = (deviceId, schedId) => {
    setDevices((s) => s.map((d) => {
      if (d.id !== deviceId) return d;
      return { ...d, schedules: d.schedules.map((sch) => sch.id === schedId ? { ...sch, enabled: !sch.enabled } : sch) };
    }));
  };

  const addScheduleToDevice = (deviceId, start = "18:00", end = "08:00") => {
    setDevices((s) => s.map((d) => {
      if (d.id !== deviceId) return d;
      const newSched = { id: `s_${Date.now()}`, start, end, enabled: true };
      return { ...d, schedules: Array.isArray(d.schedules) ? [newSched, ...d.schedules] : [newSched] };
    }));
  };

  const removeSchedule = (deviceId, schedId) => {
    setDevices((s) => s.map((d) => d.id === deviceId ? { ...d, schedules: d.schedules.filter((sch) => sch.id !== schedId) } : d));
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/30 to-indigo-900/30 rounded-2xl shadow-lg overflow-hidden border border-indigo-500/20 backdrop-blur-md">
      <div className="px-4 py-3 border-b border-indigo-400/12 bg-gradient-to-r from-indigo-800/10 to-purple-800/8">
        <h3 className="text-lg font-semibold text-indigo-100">🔧 Device Manager</h3>
        {selectedClassroom && (
          <p className="text-xs text-indigo-200/70 mt-1">Managing devices for {formatClassLabel(selectedClassroom)}</p>
        )}
      </div>

      <div className="p-3 space-y-3">
        {selectedClassroom ? (
          <>
            {(
              <div className="text-xs text-green-200/90 bg-green-900/10 px-2 py-1 rounded-md inline-block">
                Estimated savings if scheduled: {estimatedSaving ? `${estimatedSaving} kg CO₂ (≈20%)` : "No schedules"}
              </div>
            )}
            <div className="flex gap-2">
          <input value={form.id} onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))} placeholder="Device ID" className="flex-1 px-3 py-2 rounded-lg bg-slate-700/60 text-sm border border-slate-700/20 placeholder:text-slate-400" />
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Device Name" className="flex-1 px-3 py-2 rounded-lg bg-slate-700/60 text-sm border border-slate-700/20 placeholder:text-slate-400" />
        </div>

        <div className="flex gap-2 items-center">
          <select value={form.assignedTo ?? ""} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value ? Number(e.target.value) : null }))} className="flex-1 px-3 py-2 rounded-lg bg-slate-700/60 text-sm border border-slate-700/20">
            <option value="">-- Assign to Classroom --</option>
            {classroomOptions.map((c) => (
              <option key={c} value={c}>{formatClassLabel(c)}</option>
            ))}
          </select>
          {editing ? (
            <>
              <button onClick={handleUpdate} className="px-3 py-1 rounded-lg bg-emerald-600 text-sm">Update</button>
              <button onClick={() => { setEditing(null); resetForm(); }} className="px-3 py-1 rounded-lg bg-slate-600 text-sm">Cancel</button>
            </>
          ) : (
            <button onClick={handleAdd} className="px-3 py-1 rounded-lg bg-indigo-600 text-sm">Add</button>
          )}
        </div>

        <div className="max-h-56 overflow-y-auto border-t border-slate-700/12 pt-2 space-y-2">
          {devices.length === 0 ? (
            <div className="text-sm text-indigo-200/70">No devices yet.</div>
          ) : (
            devices.filter((d) => !selectedClassroom || d.assignedTo === selectedClassroom).map((d) => (
              <div key={d.id} className="py-2 px-2 bg-slate-800/40 rounded-md border border-slate-700/10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-indigo-100">{d.name} <span className="text-xs text-slate-400">({d.id})</span></div>
                    <div className="text-xs text-slate-400">Assigned: {d.assignedTo ? formatClassLabel(d.assignedTo) : '—'}</div>
                    <div className="text-xs text-slate-400 mt-1">Status: <span className="text-sm font-medium text-emerald-300">{Array.isArray(d.schedules) && d.schedules.some(s => s.enabled && nowIsBetween(s.start, s.end)) ? 'Scheduled OFF' : 'On'}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(d)} className="text-xs px-2 py-1 rounded-md bg-yellow-600/90">Edit</button>
                    <button onClick={() => handleDelete(d.id)} className="text-xs px-2 py-1 rounded-md bg-rose-600/90">Delete</button>
                  </div>
                </div>

                {/* Schedule list */}
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-300">Schedules</div>
                    <div className="flex gap-2">
                      <button onClick={() => { addScheduleToDevice(d.id); setOpenScheduleFor(d.id); }} className="text-xs px-2 py-1 rounded-md bg-indigo-600/90">Add Schedule</button>
                    </div>
                  </div>

                  <div className="mt-2 space-y-2">
                    {Array.isArray(d.schedules) && d.schedules.length > 0 ? d.schedules.map((sch) => (
                      <div key={sch.id} className="flex items-center justify-between bg-slate-800/30 px-2 py-1 rounded-md border border-slate-700/8">
                        <div className="text-xs text-slate-200">{sch.start} → {sch.end} {sch.enabled ? <span className="text-emerald-300">(enabled)</span> : <span className="text-rose-300">(disabled)</span>}</div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleScheduleEnabled(d.id, sch.id)} className="text-[11px] px-2 py-0.5 rounded bg-amber-600">Toggle</button>
                          <button onClick={() => removeSchedule(d.id, sch.id)} className="text-[11px] px-2 py-0.5 rounded bg-rose-600">Remove</button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-xs text-slate-400">No schedules</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </>
        ) : (
          <div className="text-sm text-indigo-200/70 text-center py-4">Please select a classroom to manage devices.</div>
        )}
      </div>
    </div>
  );
}
