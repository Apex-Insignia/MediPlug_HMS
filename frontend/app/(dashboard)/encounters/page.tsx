"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Stethoscope } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { encountersApi, Encounter } from "@/lib/api/encounters";
import { useAuth } from "@/lib/auth-context";

export default function EncountersList() {
  const { role } = useAuth();
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const canCreate = role === "ADMIN" || role === "RECEPTIONIST" || role === "DOCTOR";

  useEffect(() => {
    loadEncounters();
  }, []);

  async function loadEncounters(search?: string) {
    try {
      setLoading(true);
      const data = await encountersApi.getEncounters(search);
      setEncounters(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load encounters");
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEncounters(searchTerm);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Encounters" 
        description="Active and historical patient admissions."
        action={
          canCreate ? (
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Encounter
            </button>
          ) : null
        }
      />

      <div className="bg-white shadow-sm rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Patient ID..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-200 text-sm font-medium shadow-sm">
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <LoadingState message="Loading encounters..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadEncounters(searchTerm)} />
        ) : encounters.length === 0 ? (
          <EmptyState 
            title="No encounters found" 
            description={searchTerm ? "Try adjusting your search terms." : "There are currently no encounters registered in the system."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Encounter ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Admission Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {encounters.map((encounter) => (
                  <tr key={encounter.encounter_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link href={`/encounters/${encounter.encounter_id}`} className="flex items-center gap-2 hover:underline">
                        <Stethoscope className="h-4 w-4 text-slate-400" />
                        {encounter.encounter_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                      <Link href={`/patients/${encounter.patient_id}`} className="hover:underline">
                        {encounter.patient_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {encounter.admission_date || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {encounter.attending_doctor || encounter.doctor_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {encounter.admission_type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={encounter.status || 'Unknown'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end">
                        <Link href={`/encounters/${encounter.encounter_id}`} className="text-blue-600 hover:text-blue-900" title="View Encounter">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
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
