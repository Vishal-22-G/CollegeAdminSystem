import { Link, useLocation } from "wouter";
import { NavigationItem } from "@/lib/types";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  FileSpreadsheet, 
  GraduationCap, 
  Settings, 
  LogOut,
  X,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "BarChart3", path: "/" },
  { id: "workload", label: "Staff Workload", icon: "UserCheck", path: "/workload" },
  { id: "faculty", label: "Faculty Tracker", icon: "Users", path: "/faculty" },
  { id: "timetable", label: "Timetable", icon: "Calendar", path: "/timetable" },
  { id: "excel", label: "Excel Import", icon: "FileSpreadsheet", path: "/excel" },
  { id: "student", label: "Student View", icon: "GraduationCap", path: "/student" },
];

const iconMap = {
  BarChart3,
  UserCheck,
  Users,
  Calendar,
  FileSpreadsheet,
  GraduationCap,
  Settings,
  LogOut,
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        w-64 bg-white shadow-sm border-r border-slate-200 flex flex-col
        fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">College CMS</h1>
                <p className="text-sm text-slate-500">Admin Panel</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              const isActive = location === item.path;
              
              return (
                <Link key={item.id} href={item.path}>
                  <a className={`cms-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-8 pt-4 border-t border-slate-200">
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account</p>
            </div>
            <a href="#" className="cms-nav-link" onClick={(e) => e.preventDefault()}>
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>
            <a href="#" className="cms-nav-link" onClick={(e) => e.preventDefault()}>
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </a>
          </div>
        </nav>
      </aside>
    </>
  );
}
