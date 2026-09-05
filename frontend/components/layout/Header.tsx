"use client";

import { useAuth } from "@/lib/auth-context";
import { User, Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export function Header() {
  const { role, user } = useAuth();
  const pathname = usePathname();
  
  // Create a nice breadcrumb from pathname
  const pathParts = pathname.split('/').filter(Boolean);
  const currentPage = pathParts.length > 0 
    ? pathParts[pathParts.length - 1].charAt(0).toUpperCase() + pathParts[pathParts.length - 1].slice(1)
    : 'Dashboard';
  
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">{currentPage.replace('-', ' ')}</h2>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search records..." 
            className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      
        <button className="text-slate-400 hover:text-blue-600 relative transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
        
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-sm text-white font-bold text-sm">
            {user?.email?.[0].toUpperCase() || "U"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {user?.email || "User"}
            </span>
            <span className="text-xs text-blue-600 leading-tight mt-0.5 font-semibold uppercase tracking-wider">
              {role?.replace('_', ' ') || "Unknown"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
