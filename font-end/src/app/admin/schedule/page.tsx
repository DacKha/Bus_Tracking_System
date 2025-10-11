"use client";

import { useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

export default function ScheduleTab() {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [search, setSearch] = useState("");

  // Tuần hiện tại
  const startWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // bắt đầu từ Thứ 2
  const daysInWeek = Array.from({ length: 7 }, (_, i) => addDays(startWeek, i));

  // Tháng hiện tại
  const startMonth = startOfMonth(new Date());
  const endMonth = endOfMonth(new Date());
  const daysInMonth = eachDayOfInterval({ start: startMonth, end: endMonth });

  return (
    <div className="p-4 w-full bg-white">
      {/* Search + Mode Switch */}
      <div className="flex items-center justify-between mb-4 ">
        <input
          type="text"
          placeholder="Tìm kiếm lịch trình..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg w-1/2 text-black"
        />

        <div className="space-x-2 text-black shadow-ml">
          <button
            className={`px-4 py-2 rounded-lg ${
              viewMode === "week" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setViewMode("week")}
          >
            Tuần
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              viewMode === "month" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setViewMode("month")}
          >
            Tháng
          </button>
        </div>
      </div>

      {/* Week View */}
      {viewMode === "week" && (
        <div className="grid grid-cols-7 gap-2 text-black text-center">
          {daysInWeek.map((day, idx) => (
            <div key={idx} className="border p-2 rounded-lg h-40">
              <div className="font-bold">{format(day, "EEE dd/MM")}</div>
              <div className="text-sm text-gray-600 mt-2">+ Thêm sự kiện</div>
            </div>
          ))}
        </div>
      )}

      {/* Month View */}
      {viewMode === "month" && (
        <div className="grid grid-cols-7 gap-2 text-center text-black">
          {daysInMonth.map((day, idx) => (
            <div key={idx} className="border p-2 rounded-lg h-24">
              <div className="font-bold">{format(day, "dd")}</div>
              <div className="text-xs text-gray-500">Sự kiện...</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
