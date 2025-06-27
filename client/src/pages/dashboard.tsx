import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Calendar, FileUp, TrendingUp, Users, Book, Clock, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AssignWorkloadDialog } from "@/components/forms/assign-workload-dialog";
import { CreateTimetableDialog } from "@/components/forms/create-timetable-dialog";
import type { DashboardStats } from "@/lib/types";
import type { Faculty } from "@shared/schema";

export default function Dashboard() {
  const [assignWorkloadOpen, setAssignWorkloadOpen] = useState(false);
  const [createTimetableOpen, setCreateTimetableOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: facultyList = [], isLoading: facultyLoading } = useQuery<Faculty[]>({
    queryKey: ["/api/faculty"],
  });

  const getWorkloadStatus = (currentHours: number, maxHours: number) => {
    const percentage = (currentHours / maxHours) * 100;
    if (percentage >= 100) return { status: "Over Limit", color: "bg-cms-danger", textColor: "text-cms-danger" };
    if (percentage >= 90) return { status: "At Limit", color: "bg-cms-warning", textColor: "text-cms-warning" };
    return { status: "Under Limit", color: "bg-cms-success", textColor: "text-cms-success" };
  };

  const getProgressColor = (currentHours: number, maxHours: number) => {
    const percentage = (currentHours / maxHours) * 100;
    if (percentage >= 100) return "bg-cms-danger";
    if (percentage >= 90) return "bg-cms-warning";
    return "bg-cms-success";
  };

  if (statsLoading || facultyLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Faculty</CardTitle>
            <Users className="h-5 w-5 text-cms-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalFaculty || 0}</div>
            <p className="text-xs text-cms-success mt-1">+4 this semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Courses</CardTitle>
            <Book className="h-5 w-5 text-cms-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.activeCourses || 0}</div>
            <p className="text-xs text-cms-success mt-1">+12 new courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Tasks</CardTitle>
            <Clock className="h-5 w-5 text-cms-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.pendingTasks || 0}</div>
            <p className="text-xs text-cms-danger mt-1">-8 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Avg. Workload</CardTitle>
            <BarChart3 className="h-5 w-5 text-cms-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.avgWorkload || 0}h</div>
            <p className="text-xs text-cms-success mt-1">Optimal workload balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faculty Workload Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Faculty Workload Overview</CardTitle>
              <Button variant="link" className="text-cms-primary hover:text-cms-primary/80 p-0">
                View All →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facultyList.slice(0, 3).map((faculty) => {
                const workloadStatus = getWorkloadStatus(faculty.currentHours, faculty.maxHours);
                const percentage = (faculty.currentHours / faculty.maxHours) * 100;
                
                return (
                  <div key={faculty.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-cms-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {faculty.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{faculty.name}</h4>
                        <p className="text-sm text-slate-500">{faculty.position.replace('_', ' ')}, {faculty.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {faculty.currentHours}/{faculty.maxHours} hours
                      </p>
                      <div className="w-24 h-2 bg-slate-200 rounded-full mt-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(faculty.currentHours, faculty.maxHours)}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start h-auto p-4 bg-cms-primary/5 border border-cms-primary/20 hover:bg-cms-primary/10 text-slate-900" 
              variant="outline"
              onClick={() => setAssignWorkloadOpen(true)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cms-primary rounded-lg flex items-center justify-center">
                  <Plus className="text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Assign Workload</h4>
                  <p className="text-sm text-slate-500">Create new assignments</p>
                </div>
              </div>
            </Button>

            <Button 
              className="w-full justify-start h-auto p-4 bg-cms-secondary/5 border border-cms-secondary/20 hover:bg-cms-secondary/10 text-slate-900" 
              variant="outline"
              onClick={() => setCreateTimetableOpen(true)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cms-secondary rounded-lg flex items-center justify-center">
                  <Calendar className="text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Create Timetable</h4>
                  <p className="text-sm text-slate-500">New schedule</p>
                </div>
              </div>
            </Button>

            <Button 
              className="w-full justify-start h-auto p-4 bg-cms-success/5 border border-cms-success/20 hover:bg-cms-success/10 text-slate-900" 
              variant="outline"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cms-success rounded-lg flex items-center justify-center">
                  <FileUp className="text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Import Data</h4>
                  <p className="text-sm text-slate-500">Upload Excel files</p>
                </div>
              </div>
            </Button>

            <Button 
              className="w-full justify-start h-auto p-4 bg-cms-warning/5 border border-cms-warning/20 hover:bg-cms-warning/10 text-slate-900" 
              variant="outline"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cms-warning rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Generate Report</h4>
                  <p className="text-sm text-slate-500">Workload analytics</p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-cms-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="w-4 h-4 text-cms-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-900">
                  <span className="font-medium">Dr. Sarah Wilson</span> was assigned to 
                  <span className="font-medium"> Advanced Algorithms (CS401)</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-cms-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Calendar className="w-4 h-4 text-cms-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-900">
                  Timetable for <span className="font-medium">Computer Engineering - Div A</span> was updated
                </p>
                <p className="text-xs text-slate-500 mt-1">5 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-cms-warning/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Clock className="w-4 h-4 text-cms-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-900">
                  <span className="font-medium">Prof. Rajesh Patel</span> exceeded workload limit
                </p>
                <p className="text-xs text-slate-500 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AssignWorkloadDialog 
        open={assignWorkloadOpen} 
        onOpenChange={setAssignWorkloadOpen} 
      />
      
      <CreateTimetableDialog 
        open={createTimetableOpen} 
        onOpenChange={setCreateTimetableOpen} 
      />
    </div>
  );
}
