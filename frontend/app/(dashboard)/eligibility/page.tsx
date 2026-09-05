"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchApi } from "@/lib/api/client";
import { ShieldCheck, Activity, Search, RefreshCw } from "lucide-react";

export default function EligibilityPage() {
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEligibilityChecks() {
      try {
        const data = await fetchApi('/eligibility');
        setChecks(data);
      } catch (err: any) {
        if (err.status === 404) {
          setError("The Eligibility API endpoint is currently unavailable or not implemented.");
        } else {
          setError(err.message || "Failed to load eligibility records.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadEligibilityChecks();
  }, []);

  if (loading) return <LoadingState message="Loading eligibility records..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Insurance Eligibility" 
        description="Verify patient insurance coverage and view active network integrations."
      />

      <div className="mt-8 clinical-card">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="heading-3 flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2 text-slate-500" />
            Verification History
          </h2>
          <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center">
            <Search className="h-4 w-4 mr-2" />
            New Verification
          </button>
        </div>
        
        {checks.length === 0 ? (
          <div className="p-12 text-sm text-slate-500 text-center flex flex-col items-center">
            <ShieldCheck className="h-10 w-10 text-slate-300 mb-3" />
            No eligibility checks found in the system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr>
                  <th scope="col" className="table-header">Check ID</th>
                  <th scope="col" className="table-header">Patient ID</th>
                  <th scope="col" className="table-header">Date</th>
                  <th scope="col" className="table-header">Payer Response</th>
                  <th scope="col" className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {checks.map((check) => (
                  <tr key={check.check_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-blue-600">{check.check_id}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900">{check.patient_id}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">
                        {new Date(check.check_date).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {check.is_eligible ? (
                        <span className="badge-success text-xs px-2.5 py-1">Eligible</span>
                      ) : (
                        <span className="badge-error text-xs px-2.5 py-1">Ineligible</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 font-semibold inline-flex items-center">
                        <RefreshCw className="h-3.5 w-3.5 mr-1" /> Re-verify
                      </button>
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
