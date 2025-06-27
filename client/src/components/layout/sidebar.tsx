import { Link, useLocation } from "wouter";
import { GraduationCap, ChartLine, ListTodo, Users, Calendar, FileSpreadsheet, UserRound, Settings, LogOut } from "lucide-react";
import { NAVIGATION_ITEMS } from "@/lib/types";

const iconMap = {
  'chart-line': ChartLine,
  'tasks': ListTodo,
  'users': Users,
  'calendar-alt': Calendar,
  'file-excel': FileSpreadsheet,
  'user-graduate': UserRound,
};

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cms-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">College CMS</h1>
            <p className="text-sm text-slate-500">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = location === item.path;

            return (
              <Link key={item.id} href={item.path} className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-cms-primary/10 text-cms-primary font-medium' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}>
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-200">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account</p>
          </div>
          <Link href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <Link href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}