"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Eye, FileBadge, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { claimsApi, Claim } from "@/lib/api/claims";

export default function ClaimsList() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadClaims();
  }, []);

  async function loadClaims() {
    try {
      setLoading(true);
      const data = await claimsApi.getClaims();
      setClaims(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load claims");
    } finally {
      setLoading(false);
    }
  }

  const filteredClaims = claims.filter(c => 
    c.claim_id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.encounter_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.package_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Claims Workbench" 
        description="Manage patient claims, run preflight validation, and monitor approval status."
      />

      <div className="bg-white shadow-sm rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex gap-2 max-w-md">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search claims, encounters, packages..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-200 text-sm font-medium shadow-sm inline-flex items-center">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading claims..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadClaims()} />
        ) : filteredClaims.length === 0 ? (
          <EmptyState 
            title="No claims found" 
            description={searchTerm ? "Try adjusting your search terms." : "There are currently no claims registered in the system."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Claim ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient / Encounter</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Package</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredClaims.map((claim) => (
                  <tr key={claim.claim_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link href={`/claims/${claim.claim_id}`} className="flex items-center gap-2 hover:underline">
                        <FileBadge className="h-4 w-4 text-slate-400" />
                        {claim.claim_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div className="font-medium">{claim.patient_id || '-'}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{claim.encounter_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                      {claim.package_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      ₹{claim.claimed_amount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={claim.preauth_status || 'Unknown'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end">
                        <Link href={`/claims/${claim.claim_id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md" title="View Claim">
                          Workbench
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
