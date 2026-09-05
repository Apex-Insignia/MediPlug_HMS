"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchApi } from "@/lib/api/client";
import { Hospital, MapPin, Phone, Mail, Building2, CheckCircle, Globe } from "lucide-react";

export default function HospitalPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHospitalInfo() {
      try {
        const data = await fetchApi('/hospitals');
        setHospitals(data);
      } catch (err: any) {
        setError(err.message || "Failed to load hospital configuration.");
      } finally {
        setLoading(false);
      }
    }
    loadHospitalInfo();
  }, []);

  if (loading) return <LoadingState message="Loading hospital profile..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Hospital Configuration" 
        description="Manage your facility profile, contact information, and registry details."
      />

      <div className="mt-6">
        {hospitals.length === 0 ? (
          <div className="clinical-card p-12 text-center text-slate-500">
            No hospital configuration found.
          </div>
        ) : (
          hospitals.map((hospital) => (
            <div key={hospital.hospital_id} className="clinical-card">
              <div className="p-8 border-b border-slate-100 flex items-start space-x-6">
                <div className="h-24 w-24 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 flex-shrink-0 shadow-sm">
                  <Hospital className="h-10 w-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{hospital.name}</h2>
                    {hospital.is_active && <span className="badge-success text-sm px-3 py-1">Active Registry</span>}
                  </div>
                  <div className="mt-2 flex items-center text-slate-500">
                    <MapPin className="h-4 w-4 mr-1.5 text-slate-400" />
                    {hospital.address || 'Address not configured'}
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-sm font-medium text-slate-700 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100">
                      <Phone className="h-4 w-4 mr-2.5 text-blue-500" />
                      {hospital.contact_number || 'N/A'}
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-700 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100">
                      <Mail className="h-4 w-4 mr-2.5 text-blue-500" />
                      {hospital.email || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50/50 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                    Registry Information
                  </h3>
                  <dl className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-slate-200 border-dashed">
                      <dt className="text-sm font-medium text-slate-500">Hospital ID</dt>
                      <dd className="text-sm font-semibold text-slate-900">{hospital.hospital_id}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 border-dashed">
                      <dt className="text-sm font-medium text-slate-500">Type</dt>
                      <dd className="text-sm font-semibold text-slate-900">General Medical Center</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 border-dashed">
                      <dt className="text-sm font-medium text-slate-500">Region</dt>
                      <dd className="text-sm font-semibold text-slate-900">Primary Network</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-slate-400" />
                    Integration Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                      <div className="flex items-center text-sm font-medium text-slate-700">
                        <Globe className="h-4 w-4 mr-2 text-emerald-500" />
                        Payer Network
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Connected</span>
                    </div>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                      <div className="flex items-center text-sm font-medium text-slate-700">
                        <Activity className="h-4 w-4 mr-2 text-emerald-500" />
                        Audit Sync
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Real-time</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
                <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                  Edit Configuration
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
