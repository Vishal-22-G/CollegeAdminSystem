import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { WorkloadAssignmentWithDetails } from "@shared/schema";

export default function FacultyTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const { data: assignments = [], isLoading } = useQuery<WorkloadAssignmentWithDetails[]>({
    queryKey: ["/api/workload-assignments"],
  });

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = 
      assignment.faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.division.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || assignment.status === statusFilter;
    const matchesDepartment = !departmentFilter || assignment.faculty.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'assigned': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-cms-success';
      case 'pending': return 'text-cms-warning';
      case 'assigned': return 'text-cms-primary';
      default: return 'text-slate-500';
    }
  };

  // Group assignments by faculty
  const assignmentsByFaculty = filteredAssignments.reduce((acc, assignment) => {
    const facultyId = assignment.faculty.id;
    if (!acc[facultyId]) {
      acc[facultyId] = {
        faculty: assignment.faculty,
        assignments: [],
        totalHours: 0,
        completedHours: 0,
      };
    }
    acc[facultyId].assignments.push(assignment);
    acc[facultyId].totalHours += assignment.hoursPerWeek;
    if (assignment.status === 'completed') {
      acc[facultyId].completedHours += assignment.hoursPerWeek;
    }
    return acc;
  }, {} as Record<number, any>);

  const uniqueDepartments = Array.from(new Set(assignments.map(a => a.faculty.department)));

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Faculty Tracker</h2>
        <p className="text-slate-600 mt-1">Track faculty assignments and completion status</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search by faculty, subject, or division..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {uniqueDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(assignmentsByFaculty).map((facultyData: any) => {
          const completionPercentage = facultyData.totalHours > 0 
            ? (facultyData.completedHours / facultyData.totalHours) * 100 
            : 0;

          return (
            <Card key={facultyData.faculty.id}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-cms-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {facultyData.faculty.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{facultyData.faculty.name}</CardTitle>
                    <p className="text-sm text-slate-500">
                      {facultyData.faculty.position.replace('_', ' ')} • {facultyData.faculty.department}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Overview */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completion Progress</span>
                      <span>{Math.round(completionPercentage)}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                  </div>

                  {/* Workload Summary */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">{facultyData.totalHours}</div>
                      <div className="text-xs text-slate-500">Total Hours</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-cms-success">{facultyData.completedHours}</div>
                      <div className="text-xs text-slate-500">Completed</div>
                    </div>
                  </div>

                  {/* Recent Assignments */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Recent Assignments</h4>
                    <div className="space-y-2">
                      {facultyData.assignments.slice(0, 3).map((assignment: WorkloadAssignmentWithDetails) => (
                        <div key={assignment.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{assignment.subject.name}</p>
                            <p className="text-xs text-slate-500">
                              {assignment.type} • {assignment.hoursPerWeek}h/week
                            </p>
                          </div>
                          <Badge variant={getStatusVariant(assignment.status)} className="ml-2">
                            {assignment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Object.keys(assignmentsByFaculty).length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Filter className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No assignments found</h3>
            <p className="text-slate-500">
              {searchTerm || statusFilter || departmentFilter
                ? "Try adjusting your filters to see more results."
                : "No workload assignments have been created yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
