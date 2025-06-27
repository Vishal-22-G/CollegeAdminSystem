import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DAYS_OF_WEEK } from "@/lib/types";
import type { TimetableSlotWithDetails, Division } from "@shared/schema";

const TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00", 
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00"
];

const SLOT_COLORS = [
  'bg-blue-50 border-l-4 border-blue-400 text-blue-600',
  'bg-green-50 border-l-4 border-green-400 text-green-600', 
  'bg-purple-50 border-l-4 border-purple-400 text-purple-600',
  'bg-orange-50 border-l-4 border-orange-400 text-orange-600',
  'bg-red-50 border-l-4 border-red-400 text-red-600',
  'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-600',
  'bg-indigo-50 border-l-4 border-indigo-400 text-indigo-600',
];

export default function StudentDashboard() {
  const [selectedDivision, setSelectedDivision] = useState<string>("");

  const { data: divisions = [], isLoading: divisionsLoading } = useQuery<Division[]>({
    queryKey: ["/api/divisions"],
  });

  const { data: timetableSlots = [], isLoading: slotsLoading } = useQuery<TimetableSlotWithDetails[]>({
    queryKey: selectedDivision ? ["/api/timetable", { divisionId: selectedDivision }] : ["/api/timetable"],
    enabled: !!selectedDivision,
  });

  const selectedDivisionData = divisions.find(d => d.id.toString() === selectedDivision);

  // Create timetable grid
  const createTimetableGrid = () => {
    const grid: Record<string, Record<number, TimetableSlotWithDetails[]>> = {};

    TIME_SLOTS.forEach(timeSlot => {
      grid[timeSlot] = {};
      DAYS_OF_WEEK.forEach(day => {
        grid[timeSlot][day.value] = [];
      });
    });

    timetableSlots.forEach(slot => {
      const timeSlot = `${slot.startTime} - ${slot.endTime}`;
      if (grid[timeSlot] && grid[timeSlot][slot.dayOfWeek] !== undefined) {
        grid[timeSlot][slot.dayOfWeek].push(slot);
      }
    });

    return grid;
  };

  const timetableGrid = createTimetableGrid();

  const getSlotColor = (subjectName: string) => {
    const hash = subjectName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return SLOT_COLORS[Math.abs(hash) % SLOT_COLORS.length];
  };

  const handleDownload = () => {
    // In a real implementation, this would generate and download a PDF
    console.log("Download timetable as PDF");
  };

  const handlePrint = () => {
    window.print();
  };

  if (divisionsLoading || slotsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-96 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Division Selector */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-slate-700">Select Division:</label>
            <Select value={selectedDivision} onValueChange={setSelectedDivision}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((division) => (
                  <SelectItem key={division.id} value={division.id.toString()}>
                    {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Student Timetable */}
      <Card>
        {selectedDivisionData ? (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedDivisionData.name}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Academic Year {selectedDivisionData.academicYear} | Semester {selectedDivisionData.semester}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4 text-left text-sm font-medium text-slate-900 border-r border-slate-200 min-w-[120px]">
                        Time
                      </th>
                      {DAYS_OF_WEEK.slice(0, 5).map((day) => (
                        <th key={day.value} className="p-4 text-center text-sm font-medium text-slate-900 border-r border-slate-200 min-w-[200px]">
                          {day.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {TIME_SLOTS.map((timeSlot, timeIndex) => {
                      // Add break time after 11:00 - 12:00
                      const isBreakAfter = timeSlot === "11:00 - 12:00";

                      return (
                        <>
                          <tr key={timeSlot}>
                            <td className="p-4 border-r border-slate-200 bg-slate-50">
                              <div className="text-sm font-medium text-slate-900">
                                {timeSlot}
                              </div>
                            </td>
                            {DAYS_OF_WEEK.slice(0, 5).map((day) => {
                              const slots = timetableGrid[timeSlot]?.[day.value] || [];

                              return (
                                <td key={day.value} className="p-3 border-r border-slate-200">
                                  {slots.length > 0 ? (
                                    <div className="space-y-1">
                                      {slots.map((slot) => (
                                        <div
                                          key={slot.id}
                                          className={`rounded-lg p-3 ${getSlotColor(slot.subject.name)}`}
                                        >
                                          <div className="font-medium text-slate-900 text-sm">
                                            {slot.subject.name}
                                          </div>
                                          <div className="text-xs text-slate-600 mt-1">
                                            {slot.faculty.name}
                                          </div>
                                          <div className="text-xs font-medium mt-1">
                                            Room: {slot.classroom}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-3 text-center">
                                      <div className="text-sm text-slate-500">Free Period</div>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                          {isBreakAfter && (
                            <tr className="bg-yellow-50">
                              <td className="p-4 border-r border-slate-200 bg-yellow-100">
                                <div className="text-sm font-medium text-slate-900">11:00 - 11:15</div>
                              </td>
                              <td colSpan={5} className="p-4 text-center">
                                <div className="text-sm font-medium text-yellow-800">Break Time</div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Select Your Division</h3>
            <p className="text-slate-500">Choose your division from the dropdown above to view your timetable.</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}