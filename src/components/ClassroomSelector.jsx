"use client";

import React from "react";

export default function ClassroomSelector({ selectedClassroom, onSelectClassroom, selectedFloor }) {
  // compute classrooms for the floor: floors 1-7 => 4 classes each, floor 8 => 29-30
  const getClassroomsForFloor = (floor) => {
    if (!floor) return [];
    if (floor <= 7) {
      const start = (floor - 1) * 4 + 1;
      return Array.from({ length: 4 }, (_, i) => start + i);
    }
    return [29, 30];
  };

  const classes = selectedFloor ? getClassroomsForFloor(selectedFloor) : [];

  const formatClassLabel = (classNum) => {
    // find floor
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
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/30 to-indigo-900/30 rounded-2xl shadow-2xl overflow-hidden border border-indigo-500/20 backdrop-blur-md">
      <div className="bg-gradient-to-r from-indigo-600/60 to-purple-600/60 px-5 py-4 border-b border-indigo-400/20">
        <h2 className="text-xl md:text-2xl font-semibold text-indigo-100">🏫 Select Classroom</h2>
        <p className="text-xs text-indigo-200/60 mt-1">Choose a classroom on the selected floor</p>
      </div>
      
      <div className="p-4">
        {selectedFloor ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 max-h-80 overflow-y-auto">
            {classes.map((classNum) => (
              <button
                key={classNum}
                onClick={() => onSelectClassroom(classNum)}
                className={`flex flex-col items-center gap-1 justify-center py-3 rounded-xl text-sm transition-all duration-200 transform hover:-translate-y-0.5 ${
                  selectedClassroom === classNum
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg ring-1 ring-indigo-300"
                    : "bg-slate-700/50 text-indigo-200 border border-slate-700/20 hover:bg-slate-700/60"
                }`}
              >
                <div className="text-xs text-indigo-200/70">{formatClassLabel(classNum)}</div>
                <div className="text-2xl font-extrabold">{classNum}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-sm text-indigo-200/80">Please select a floor to choose classrooms.</div>
        )}
      </div>
    </div>
  );
}
