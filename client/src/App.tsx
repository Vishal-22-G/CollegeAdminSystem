import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { LoginDialog } from "@/components/auth/login-dialog";
import Dashboard from "@/pages/dashboard";
import WorkloadManagement from "@/pages/workload-management";
import FacultyTracker from "@/pages/faculty-tracker";
import TimetableManagement from "@/pages/timetable-management";
import ExcelImport from "@/pages/excel-import";
import ExcelDataViewer from "@/pages/excel-data";
import StudentDashboard from "@/pages/student-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <LoginDialog open={true} onSuccess={login} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <Switch>
          <Route path="/">
            <Header title="Dashboard Overview" description="Manage staff workload and academic schedules" />
            <Dashboard />
          </Route>
          <Route path="/workload">
            <Header title="Staff Workload Management" description="Assign and manage faculty workload efficiently" />
            <WorkloadManagement />
          </Route>
          <Route path="/faculty">
            <Header title="Faculty Tracker" description="Track faculty assignments and completion status" />
            <FacultyTracker />
          </Route>
          <Route path="/timetable">
            <Header title="Timetable Management" description="Create and manage academic schedules" />
            <TimetableManagement />
          </Route>
          <Route path="/excel">
            <Header title="Excel Data Import" description="Upload and process Excel files for bulk data operations" />
            <ExcelImport />
          </Route>
          <Route path="/excel-data/:id">
            <ExcelDataViewer />
          </Route>
          <Route path="/student">
            <Header title="Student Timetable View" description="View your class schedule and room assignments" />
            <StudentDashboard />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
