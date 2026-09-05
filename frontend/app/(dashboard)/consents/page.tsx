"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchApi } from "@/lib/api/client";
import { ClipboardCheck, FileSignature, CheckCircle } from "lucide-react";

export default function ConsentsPage() {
  const [consents, setConsents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConsents() {
      try {
        const data = await fetchApi('/consents');
        setConsents(data);
      } catch (err: any) {
        if (err.status === 404) {
          setError("The Consents API endpoint is currently unavailable or not implemented.");
        } else {
          setError(err.message || "Failed to load patient consents.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadConsents();
  }, []);

  if (loading) return <LoadingState message="Loading consent records..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Patient Consents" 
        description="Manage patient consent forms, agreements, and digital signatures."
      />

      <div className="mt-8 clinical-card">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="heading-3 flex items-center">
            <ClipboardCheck className="h-5 w-5 mr-2 text-slate-500" />
            Signed Consents
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center">
            <FileSignature className="h-4 w-4 mr-2" />
            New Consent Form
          </button>
        </div>
        
        {consents.length === 0 ? (
          <div className="p-12 text-sm text-slate-500 text-center flex flex-col items-center">
            <FileSignature className="h-10 w-10 text-slate-300 mb-3" />
            No consent records found in the system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr>
                  <th scope="col" className="table-header">Consent ID</th>
                  <th scope="col" className="table-header">Patient ID</th>
                  <th scope="col" className="table-header">Type</th>
                  <th scope="col" className="table-header">Signed At</th>
                  <th scope="col" className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {consents.map((consent) => (
                  <tr key={consent.consent_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-blue-600">{consent.consent_id}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900">{consent.patient_id}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {consent.consent_type}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          {new Date(consent.signed_at).toLocaleString()}
                        </span>
                        {consent.is_signed && (
                          <span className="text-xs text-emerald-600 flex items-center mt-1 font-medium">
                            <CheckCircle className="h-3 w-3 mr-1" /> Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 font-semibold inline-flex items-center">
                        <FileSignature className="h-3.5 w-3.5 mr-1" /> View PDF
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
