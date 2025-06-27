import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, User, BookOpen, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Faculty, Subject, Division, WorkloadAssignmentWithDetails } from "@shared/schema";

export default function FacultyTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const { data: faculty, isLoading: facultyLoading } = useQuery<Faculty[]>({
    queryKey: ["/api/faculty"],
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: divisions } = useQuery<Division[]>({
    queryKey: ["/api/divisions"],
  });

  const { data: workloadAssignments } = useQuery<WorkloadAssignmentWithDetails[]>({
    queryKey: ["/api/workload-assignments"],
  });

  const getAssignmentsForFaculty = (facultyId: number) => {
    return workloadAssignments?.filter(a => a.facultyId === facultyId) || [];
  };

  const getCompletionStatus = (assignments: WorkloadAssignmentWithDetails[]) => {
    if (assignments.length === 0) return { label: "No Tasks", variant: "secondary" as const };
    const completed = assignments.filter(a => a.status === "completed").length;
    const total = assignments.length;
    const percentage = (completed / total) * 100;
    
    if (percentage === 100) return { label: "All Complete", variant: "default" as const };
    if (percentage >= 50) return { label: "In Progress", variant: "outline" as const };
    return { label: "Pending", variant: "destructive" as const };
  };

  const filteredFaculty = faculty?.filter((f) => {
    const assignments = getAssignmentsForFaculty(f.id);
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || f.department === departmentFilter;
    const matchesSubject = subjectFilter === "all" || assignments.some(a => a.subjectId.toString() === subjectFilter);
    return matchesSearch && matchesDepartment && matchesSubject;
  });

  const uniqueDepartments = Array.from(new Set(faculty?.map(f => f.department) || []));

  return (
    <div className="p-6">
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search by staff name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects?.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {facultyLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div>
                      <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-40"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-20"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredFaculty?.map((f) => {
            const assignments = getAssignmentsForFaculty(f.id);
            const completionStatus = getCompletionStatus(assignments);
            const completedTasks = assignments.filter(a => a.status === "completed").length;
            const totalTasks = assignments.length;

            return (
              <Card key={f.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {f.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{f.name}</h3>
                        <p className="text-sm text-slate-500">{f.email}</p>
                      </div>
                    </div>
                    <Badge variant={completionStatus.variant}>
                      {completionStatus.label}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-slate-600">
                      <User className="w-4 h-4 mr-2" />
                      <span className="capitalize">{f.position.replace('_', ' ')}</span>
                      <span className="mx-2">•</span>
                      <span>{f.department}</span>
                    </div>

                    <div className="flex items-center text-sm text-slate-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>{completedTasks} of {totalTasks} tasks completed</span>
                    </div>

                    {assignments.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs font-medium text-slate-500 mb-2">Recent Assignments:</div>
                        <div className="space-y-1">
                          {assignments.slice(0, 3).map((assignment) => (
                            <div key={assignment.id} className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">{assignment.subject.name}</span>
                              <Badge size="sm" variant={assignment.status === 'completed' ? 'default' : 'outline'}>
                                {assignment.status}
                              </Badge>
                            </div>
                          ))}
                          {assignments.length > 3 && (
                            <div className="text-xs text-slate-400">+{assignments.length - 3} more...</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}