"use client";

import { useAuth } from "@/lib/auth-context";
import { Activity, Users, FileBadge, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const { user, role } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="text-sm text-slate-500">
          Welcome back, <span className="font-semibold text-slate-700">{user?.email}</span>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value="1,248" icon={Users} color="bg-indigo-500" />
        <StatCard title="Active Encounters" value="32" icon={Activity} color="bg-emerald-500" />
        <StatCard title="Processing Claims" value="18" icon={FileBadge} color="bg-amber-500" />
        <StatCard title="Approved Claims" value="142" icon={CheckCircle} color="bg-blue-500" />
      </div>

      <div className="mt-8 bg-white shadow rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Recent Activity</h2>
        <div className="text-slate-500 text-sm">
          No recent activity to display.
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${color} text-white`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-slate-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
