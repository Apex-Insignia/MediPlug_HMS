"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchApi } from "@/lib/api/client";
import { ShieldCheck, Activity, Search, RefreshCw, AlertTriangle } from "lucide-react";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        const data = await fetchApi('/audit');
        setLogs(data);
      } catch (err: any) {
        if (err.status === 404) {
          setError("LIMITATION: The Audit Logs API endpoint is currently not implemented on the backend. This feature requires further backend development.");
        } else {
          setError(err.message || "Failed to load audit logs.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadAuditLogs();
  }, []);

  if (loading) return <LoadingState message="Connecting to secure audit trail..." />;
  
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="System Audit Logs" 
          description="View immutable records of all system access and clinical data modifications."
        />
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg flex items-start">
          <AlertTriangle className="h-6 w-6 text-amber-600 mr-4 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-amber-900">Feature Limitation</h3>
            <p className="text-sm text-amber-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="System Audit Logs" 
        description="View immutable records of all system access and clinical data modifications."
      />

      <div className="mt-8 clinical-card">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="heading-3 flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2 text-slate-500" />
            Security Trail
          </h2>
          <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Advanced Search
          </button>
        </div>
        
        {logs.length === 0 ? (
          <div className="p-12 text-sm text-slate-500 text-center flex flex-col items-center">
            <ShieldCheck className="h-10 w-10 text-slate-300 mb-3" />
            No audit logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table would go here */}
          </div>
        )}
      </div>
    </div>
  );
}
