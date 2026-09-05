"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { FileBadge, Search, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClaims() {
      try {
        const data = await fetchApi("/claims");
        setClaims(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadClaims();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'bg-slate-100 text-slate-800',
      'VALIDATING': 'bg-blue-100 text-blue-800',
      'PREFLIGHT_BLOCKED': 'bg-red-100 text-red-800',
      'SUBMITTED': 'bg-indigo-100 text-indigo-800',
      'PROCESSING': 'bg-amber-100 text-amber-800',
      'APPROVED': 'bg-emerald-100 text-emerald-800',
      'REJECTED': 'bg-rose-100 text-rose-800'
    };
    const css = colors[status] || 'bg-slate-100 text-slate-800';
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${css}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <FileBadge className="w-6 h-6 mr-2 text-indigo-600" /> Claims Management
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            Track and process MJPJAY claims across the hospital.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/claims/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
            <Plus className="w-4 h-4 mr-2" />
            New Claim
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="relative rounded-md shadow-sm w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border"
              placeholder="Search claims by ID or patient..."
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading claims...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No claims found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Claim ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Package</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {claims.map((claim) => (
                  <tr key={claim.claim_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {claim.claim_id.substring(0,8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {claim.package_code || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      ₹{claim.claimed_amount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {getStatusBadge(claim.preauth_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/claims/${claim.claim_id}`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                        Details <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
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
