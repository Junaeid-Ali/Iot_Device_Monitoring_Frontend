"use client";

import React from "react";

export default function ClassroomSelector({ selectedClassroom, onSelectClassroom }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-indigo-900/40 rounded-2xl shadow-2xl overflow-hidden border border-indigo-500/30 backdrop-blur-sm">
      <div className="bg-gradient-to-r from-indigo-600/60 to-purple-600/60 backdrop-blur-sm px-6 py-5 border-b border-indigo-400/30">
        <h2 className="text-2xl font-bold text-indigo-100">🏫 Select Classroom</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 max-h-96 overflow-y-auto">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((classNum) => (
            <button
              key={classNum}
              onClick={() => onSelectClassroom(classNum)}
              className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 border ${
                selectedClassroom === classNum
                  ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/50"
                  : "bg-slate-700/60 border-slate-600/40 text-indigo-200 hover:bg-slate-600/80 hover:border-indigo-400/60"
              }`}
            >
              Class {classNum}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
