import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  Clock, 
  BarChart3, 
  Plus, 
  CalendarPlus, 
  FolderInput, 
  TrendingUp,
  UserPlus,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { DashboardStats, Faculty } from "@/lib/types";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: faculty, isLoading: facultyLoading } = useQuery<Faculty[]>({
    queryKey: ["/api/faculty"],
  });

  const getFacultyWorkloadStatus = (faculty: Faculty) => {
    const percentage = (faculty.currentHours / faculty.maxHours) * 100;
    if (percentage >= 100) return { status: 'over', color: 'bg-red-500', label: 'Over Limit' };
    if (percentage >= 90) return { status: 'warning', color: 'bg-yellow-500', label: 'Near Limit' };
    return { status: 'under', color: 'bg-green-500', label: 'Under Limit' };
  };

  return (
    <Layout title="Dashboard Overview" subtitle="Manage staff workload and academic schedules">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="cms-stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-500">Total Faculty</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {statsLoading ? "..." : stats?.totalFaculty || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+4</span>
              <span className="text-slate-500 ml-1">this semester</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cms-stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-500">Active Courses</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {statsLoading ? "..." : stats?.activeCourses || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-purple-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+12</span>
              <span className="text-slate-500 ml-1">new courses</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cms-stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-500">Pending Tasks</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {statsLoading ? "..." : stats?.pendingTasks || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium">-8</span>
              <span className="text-slate-500 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cms-stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-500">Avg. Workload</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {statsLoading ? "..." : stats?.avgWorkload || "0.0h"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-green-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">Optimal</span>
              <span className="text-slate-500 ml-1">workload balance</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faculty Workload Overview */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Faculty Workload Overview</h3>
                <Link href="/workload">
                  <Button variant="ghost" size="sm">
                    View All <TrendingUp className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                {facultyLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-32"></div>
                            <div className="h-3 bg-slate-200 rounded w-48"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-16"></div>
                          <div className="w-24 h-2 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  faculty?.slice(0, 3).map((f) => {
                    const workloadStatus = getFacultyWorkloadStatus(f);
                    const percentage = (f.currentHours / f.maxHours) * 100;
                    
                    return (
                      <div key={f.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            workloadStatus.status === 'over' ? 'bg-red-600' :
                            workloadStatus.status === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
                          }`}>
                            <span className="text-white font-medium text-sm">
                              {f.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{f.name}</h4>
                            <p className="text-sm text-slate-500">
                              {f.position.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}, {f.department}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">
                            {f.currentHours}/{f.maxHours} hours
                          </p>
                          <div className="w-24 h-2 bg-slate-200 rounded-full mt-2">
                            <div 
                              className={`h-2 rounded-full ${workloadStatus.color}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
            </div>
            <CardContent className="p-6 space-y-4">
              <Link href="/workload">
                <Button className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <Plus className="text-white h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Assign Workload</h4>
                    <p className="text-sm opacity-80">Create new assignments</p>
                  </div>
                </Button>
              </Link>

              <Link href="/timetable">
                <Button className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <CalendarPlus className="text-white h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Create Timetable</h4>
                    <p className="text-sm opacity-80">New schedule</p>
                  </div>
                </Button>
              </Link>

              <Link href="/excel">
                <Button className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-900 border border-green-200">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <FolderInput className="text-white h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Import Data</h4>
                    <p className="text-sm opacity-80">Upload Excel files</p>
                  </div>
                </Button>
              </Link>

              <Button 
                className="w-full justify-start bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-200"
                onClick={() => alert("Report generation feature coming soon!")}
              >
                <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="text-white h-5 w-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Generate Report</h4>
                  <p className="text-sm opacity-80">Workload analytics</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <Card>
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <UserPlus className="text-blue-600 text-sm" />
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
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="text-green-600 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">
                    Timetable for <span className="font-medium">Computer Engineering - Div A</span> was updated
                  </p>
                  <p className="text-xs text-slate-500 mt-1">5 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <AlertTriangle className="text-yellow-600 text-sm" />
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
      </div>
    </Layout>
  );
}
