import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Eye, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AssignWorkloadDialog } from "@/components/forms/assign-workload-dialog";
import type { Faculty } from "@shared/schema";

export default function WorkloadManagement() {
  const [assignWorkloadOpen, setAssignWorkloadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  const { data: facultyList = [], isLoading } = useQuery<Faculty[]>({
    queryKey: ["/api/faculty"],
  });

  const filteredFaculty = facultyList.filter((faculty) => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faculty.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || faculty.department === departmentFilter;
    const matchesPosition = !positionFilter || faculty.position === positionFilter;
    
    return matchesSearch && matchesDepartment && matchesPosition;
  });

  const getWorkloadStatus = (currentHours: number, maxHours: number) => {
    const percentage = (currentHours / maxHours) * 100;
    if (percentage >= 100) {
      return { label: "Over Limit", variant: "destructive" as const };
    }
    if (percentage >= 90) {
      return { label: "At Limit", variant: "secondary" as const };
    }
    return { label: "Under Limit", variant: "default" as const };
  };

  const uniqueDepartments = Array.from(new Set(facultyList.map(f => f.department)));
  const uniquePositions = Array.from(new Set(facultyList.map(f => f.position)));

  if (isLoading) {
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
        <h2 className="text-2xl font-bold text-slate-900">Staff Workload Management</h2>
        <p className="text-slate-600 mt-1">Assign and manage faculty workload efficiently</p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search faculty..."
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

              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Positions</SelectItem>
                  {uniquePositions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={() => setAssignWorkloadOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Workload
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Workload Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faculty</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Current Load</TableHead>
                <TableHead>Max Load</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculty.map((faculty) => {
                const workloadStatus = getWorkloadStatus(faculty.currentHours, faculty.maxHours);
                
                return (
                  <TableRow key={faculty.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cms-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {faculty.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{faculty.name}</p>
                          <p className="text-sm text-slate-500">{faculty.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {faculty.position.replace('_', ' ')}
                    </TableCell>
                    <TableCell>{faculty.department}</TableCell>
                    <TableCell>{faculty.currentHours} hours</TableCell>
                    <TableCell>{faculty.maxHours} hours</TableCell>
                    <TableCell>
                      <Badge variant={workloadStatus.variant}>
                        {workloadStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AssignWorkloadDialog 
        open={assignWorkloadOpen} 
        onOpenChange={setAssignWorkloadOpen} 
      />
    </div>
  );
}
