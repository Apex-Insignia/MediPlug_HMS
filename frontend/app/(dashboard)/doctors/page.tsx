"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchApi } from "@/lib/api/client";
import { Stethoscope, Phone, Mail, Award, CheckCircle } from "lucide-react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const data = await fetchApi('/doctors');
        setDoctors(data);
      } catch (err: any) {
        setError(err.message || "Failed to load doctors.");
      } finally {
        setLoading(false);
      }
    }
    loadDoctors();
  }, []);

  if (loading) return <LoadingState message="Loading doctor directory..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Doctor Directory" 
        description="Manage hospital doctors, their specialties, and availability."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {doctors.length === 0 ? (
          <div className="col-span-full clinical-card p-12 text-center text-slate-500">
            No doctors found in the directory.
          </div>
        ) : (
          doctors.map((doc) => (
            <div key={doc.doctor_id} className="clinical-card group">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <Stethoscope className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Dr. {doc.first_name} {doc.last_name}
                      </h3>
                      <p className="text-sm font-medium text-blue-600">{doc.specialty}</p>
                    </div>
                  </div>
                  {doc.is_active && (
                    <span className="badge-success">Active</span>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-sm text-slate-500">
                    <Award className="h-4 w-4 mr-2 text-slate-400" />
                    License: <span className="ml-1 text-slate-700 font-medium">{doc.license_number}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <Phone className="h-4 w-4 mr-2 text-slate-400" />
                    {doc.contact_number || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    {doc.email || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500 uppercase">DEPT ID: {doc.department_id}</span>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View Details</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
