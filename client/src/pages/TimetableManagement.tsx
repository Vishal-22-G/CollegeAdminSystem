import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTimetableSlotSchema } from "@shared/schema";
import { Faculty, Subject, Division, TimetableSlot } from "@/lib/types";
import { Plus, Share, CalendarPlus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const timetableFormSchema = insertTimetableSlotSchema.extend({
  divisionId: z.coerce.number(),
  subjectId: z.coerce.number().optional(),
  facultyId: z.coerce.number().optional(),
});

const timeSlots = [
  "9:00-10:00",
  "10:00-11:00", 
  "11:00-11:15", // Break
  "11:15-12:15",
  "12:15-1:15",
  "1:15-2:00", // Lunch
  "2:00-3:00",
  "3:00-4:00",
  "4:00-5:00"
];

const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

const slotColors = [
  "cms-timetable-slot primary",
  "cms-timetable-slot secondary", 
  "cms-timetable-slot success",
  "cms-timetable-slot warning",
  "cms-timetable-slot danger"
];

export default function TimetableManagement() {
  const [viewType, setViewType] = useState("division");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: divisions } = useQuery<Division[]>({
    queryKey: ["/api/divisions"],
  });

  const { data: faculty } = useQuery<Faculty[]>({
    queryKey: ["/api/faculty"],
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: timetableSlots, isLoading: slotsLoading } = useQuery<TimetableSlot[]>({
    queryKey: ["/api/timetable"],
  });

  const form = useForm<z.infer<typeof timetableFormSchema>>({
    resolver: zodResolver(timetableFormSchema),
    defaultValues: {
      type: "lecture",
    },
  });

  const createSlotMutation = useMutation({
    mutationFn: (data: z.infer<typeof timetableFormSchema>) =>
      apiRequest("POST", "/api/timetable", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Timetable slot created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create timetable slot",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof timetableFormSchema>) => {
    createSlotMutation.mutate(data);
  };

  const getSlotForDayAndTime = (day: string, timeSlot: string, divisionId?: number, facultyId?: number) => {
    return timetableSlots?.find(slot => 
      slot.day === day && 
      slot.timeSlot === timeSlot && 
      (divisionId ? slot.divisionId === divisionId : true) &&
      (facultyId ? slot.facultyId === facultyId : true)
    );
  };

  const getSubjectName = (subjectId?: number) => {
    if (!subjectId) return "";
    return subjects?.find(s => s.id === subjectId)?.name || "";
  };

  const getFacultyName = (facultyId?: number) => {
    if (!facultyId) return "";
    return faculty?.find(f => f.id === facultyId)?.name || "";
  };

  const getDivisionName = (divisionId: number) => {
    return divisions?.find(d => d.id === divisionId)?.name || "";
  };

  const currentDivision = divisions?.find(d => d.id.toString() === selectedDivision);
  const currentFaculty = faculty?.find(f => f.id.toString() === selectedFaculty);

  const getSlotClassName = (slot: TimetableSlot | undefined, timeSlot: string) => {
    if (timeSlot === "11:00-11:15" || timeSlot === "1:15-2:00") {
      return "cms-timetable-slot bg-yellow-50 border-2 border-dashed border-yellow-300 text-yellow-800";
    }
    if (!slot || !slot.subjectId) {
      return "cms-timetable-slot free";
    }
    // Cycle through colors based on subject ID
    const colorIndex = (slot.subjectId - 1) % slotColors.length;
    return slotColors[colorIndex];
  };

  return (
    <Layout title="Timetable Management" subtitle="Create and manage academic schedules">
      {/* Timetable Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Select value={viewType} onValueChange={setViewType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="division">View by Division</SelectItem>
                  <SelectItem value="faculty">View by Faculty</SelectItem>
                </SelectContent>
              </Select>

              {viewType === "division" ? (
                <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions?.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculty?.map((f) => (
                      <SelectItem key={f.id} value={f.id.toString()}>
                        {f.name} - {f.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline">
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Timetable Slot</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="divisionId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Division</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select division" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {divisions?.map((d) => (
                                  <SelectItem key={d.id} value={d.id.toString()}>
                                    {d.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="day"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Day</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {days.map((day) => (
                                  <SelectItem key={day} value={day}>
                                    {day.charAt(0).toUpperCase() + day.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timeSlot"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Slot</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time slot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeSlots.map((slot) => (
                                  <SelectItem key={slot} value={slot}>
                                    {slot}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subjectId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subjects?.map((s) => (
                                  <SelectItem key={s.id} value={s.id.toString()}>
                                    {s.name} ({s.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="facultyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Faculty (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select faculty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {faculty?.map((f) => (
                                  <SelectItem key={f.id} value={f.id.toString()}>
                                    {f.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="classroom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Classroom (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., CS-101" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createSlotMutation.isPending}>
                          {createSlotMutation.isPending ? "Creating..." : "Create Slot"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      {(selectedDivision || selectedFaculty) && (
        <Card>
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              {viewType === "division" 
                ? currentDivision?.name || "Division Timetable"
                : currentFaculty?.name || "Faculty Timetable"
              }
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Academic Year 2024-25 | Semester VI
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-slate-900 border-r border-slate-200">
                    Time
                  </th>
                  {days.map((day) => (
                    <th key={day} className="p-4 text-center text-sm font-medium text-slate-900 border-r border-slate-200 last:border-r-0">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="p-4 border-r border-slate-200 bg-slate-50">
                      <div className="text-sm font-medium text-slate-900">{timeSlot}</div>
                    </td>
                    {days.map((day) => {
                      const slot = getSlotForDayAndTime(
                        day, 
                        timeSlot, 
                        viewType === "division" ? parseInt(selectedDivision) : undefined,
                        viewType === "faculty" ? parseInt(selectedFaculty) : undefined
                      );

                      if (timeSlot === "11:00-11:15") {
                        return day === "monday" ? (
                          <td key={day} colSpan={5} className="p-4 text-center bg-yellow-50">
                            <div className="text-sm font-medium text-yellow-800">Break Time</div>
                          </td>
                        ) : null;
                      }

                      if (timeSlot === "1:15-2:00") {
                        return day === "monday" ? (
                          <td key={day} colSpan={5} className="p-4 text-center bg-orange-50">
                            <div className="text-sm font-medium text-orange-800">Lunch Break</div>
                          </td>
                        ) : null;
                      }

                      return (
                        <td key={day} className="p-2 border-r border-slate-200 last:border-r-0">
                          <div className={getSlotClassName(slot, timeSlot)}>
                            {slot && slot.subjectId ? (
                              <>
                                <div className="text-sm font-medium text-slate-900">
                                  {getSubjectName(slot.subjectId)}
                                </div>
                                <div className="text-xs text-slate-600 mt-1">
                                  {getFacultyName(slot.facultyId)}
                                </div>
                                {slot.classroom && (
                                  <div className="text-xs font-medium mt-1">
                                    Room: {slot.classroom}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-sm text-slate-500">Free Period</div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!selectedDivision && !selectedFaculty && (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarPlus className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Division or Faculty</h3>
            <p className="text-slate-600">
              Choose a division or faculty member from the dropdown above to view their timetable.
            </p>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
