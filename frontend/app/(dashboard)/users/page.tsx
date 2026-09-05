"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchApi } from "@/lib/api/client";
import { ShieldAlert, UserCog, Mail, Key } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchApi('/users');
        setUsers(data);
      } catch (err: any) {
        setError(err.message || "Failed to load staff users.");
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  if (loading) return <LoadingState message="Loading staff directory..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Staff Access Control" 
        description="Manage hospital staff accounts, roles, and system permissions."
      />

      <div className="mt-8 clinical-card">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="heading-3 flex items-center">
            <ShieldAlert className="h-5 w-5 mr-2 text-slate-500" />
            System Users
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Invite User
          </button>
        </div>
        
        {users.length === 0 ? (
          <div className="p-12 text-sm text-slate-500 text-center flex flex-col items-center">
            <UserCog className="h-10 w-10 text-slate-300 mb-3" />
            No staff users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr>
                  <th scope="col" className="table-header">User Info</th>
                  <th scope="col" className="table-header">Role</th>
                  <th scope="col" className="table-header">Auth ID (Supabase)</th>
                  <th scope="col" className="table-header">Status</th>
                  <th scope="col" className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shadow-sm border border-slate-200">
                          {u.email?.[0].toUpperCase() || '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-slate-900">{u.email}</div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center">
                            <Mail className="h-3 w-3 mr-1" /> Registered Account
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded w-max">
                        <Key className="h-3 w-3 mr-1.5 text-slate-400" />
                        {u.auth_user_id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {u.is_active ? (
                        <span className="badge-success">Active</span>
                      ) : (
                        <span className="badge-error">Suspended</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 font-semibold mr-4">Edit</button>
                      {u.is_active ? (
                        <button className="text-rose-600 hover:text-rose-900 font-semibold">Suspend</button>
                      ) : (
                        <button className="text-emerald-600 hover:text-emerald-900 font-semibold">Activate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
