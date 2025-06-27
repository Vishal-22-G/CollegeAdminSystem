import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Share, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateTimetableDialog } from "@/components/forms/create-timetable-dialog";
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
  'bg-blue-50 border-blue-400',
  'bg-green-50 border-green-400', 
  'bg-purple-50 border-purple-400',
  'bg-orange-50 border-orange-400',
  'bg-red-50 border-red-400',
  'bg-yellow-50 border-yellow-400',
  'bg-indigo-50 border-indigo-400',
];

export default function TimetableManagement() {
  const [createTimetableOpen, setCreateTimetableOpen] = useState(false);
  const [viewType, setViewType] = useState("division");
  const [selectedDivision, setSelectedDivision] = useState<string>("");

  const { data: divisions = [], isLoading: divisionsLoading } = useQuery<Division[]>({
    queryKey: ["/api/divisions"],
  });

  const { data: timetableSlots = [], isLoading: slotsLoading } = useQuery<TimetableSlotWithDetails[]>({
    queryKey: ["/api/timetable", selectedDivision ? { divisionId: selectedDivision } : {}],
    queryKey: selectedDivision ? ["/api/timetable", { divisionId: selectedDivision }] : ["/api/timetable"],
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Timetable Management</h2>
        <p className="text-slate-600 mt-1">Create and manage academic schedules</p>
      </div>

      {/* Timetable Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Select value={viewType} onValueChange={setViewType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="division">View by Division</SelectItem>
                  <SelectItem value="faculty">View by Faculty</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select division" />
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
            
            <div className="flex space-x-3">
              <Button variant="outline">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={() => setCreateTimetableOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>
              {selectedDivisionData ? selectedDivisionData.name : "Select a division to view timetable"}
            </span>
          </CardTitle>
          {selectedDivisionData && (
            <p className="text-sm text-slate-500">
              Academic Year {selectedDivisionData.academicYear} | Semester {selectedDivisionData.semester}{['th', 'st', 'nd', 'rd'][selectedDivisionData.semester % 10] || 'th'}
            </p>
          )}
        </CardHeader>
        
        {selectedDivisionData ? (
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
                  {TIME_SLOTS.map((timeSlot) => (
                    <tr key={timeSlot}>
                      <td className="p-4 border-r border-slate-200 bg-slate-50">
                        <div className="text-sm font-medium text-slate-900">
                          {timeSlot}
                        </div>
                      </td>
                      {DAYS_OF_WEEK.slice(0, 5).map((day) => {
                        const slots = timetableGrid[timeSlot]?.[day.value] || [];
                        
                        return (
                          <td key={day.value} className="p-2 border-r border-slate-200">
                            {slots.length > 0 ? (
                              <div className="space-y-1">
                                {slots.map((slot) => (
                                  <div
                                    key={slot.id}
                                    className={`border-l-4 rounded-lg p-3 ${getSlotColor(slot.subject.name)}`}
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Division Selected</h3>
            <p className="text-slate-500">Please select a division to view its timetable.</p>
          </CardContent>
        )}
      </Card>

      <CreateTimetableDialog 
        open={createTimetableOpen} 
        onOpenChange={setCreateTimetableOpen} 
      />
    </div>
  );
}
