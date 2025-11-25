"use client";

import React from "react";

export default function FloorSelector({ selectedFloor, onSelectFloor }) {
  const floors = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="bg-gradient-to-br from-slate-800/20 to-indigo-900/20 rounded-2xl shadow-lg overflow-hidden border border-indigo-500/10 backdrop-blur-md">
      <div className="px-4 py-3 border-b border-indigo-400/8 bg-gradient-to-r from-indigo-800/10 to-purple-800/8">
        <h3 className="text-lg font-semibold text-indigo-100">🏢 Select Floor</h3>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-4 gap-3">
          {floors.map((f) => (
            <button
              key={f}
              onClick={() => onSelectFloor(f)}
              aria-pressed={selectedFloor === f}
              className={`py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                selectedFloor === f
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-inner ring-1 ring-indigo-300"
                  : "bg-slate-700/40 text-indigo-200 border border-transparent hover:bg-slate-700/60"
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm">Floor</span>
                <span className="text-lg font-extrabold">{f}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
