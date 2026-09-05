"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState, LoadingSpinner } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { claimsApi, Claim, ClaimEvent, PreflightResponse } from "@/lib/api/claims";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Play } from "lucide-react";

export default function ClaimDetail() {
  const params = useParams();
  const router = useRouter();
  const claimId = params.id as string;
  
  const [claim, setClaim] = useState<Claim | null>(null);
  const [timeline, setTimeline] = useState<ClaimEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [preflightLoading, setPreflightLoading] = useState(false);
  const [preflightResult, setPreflightResult] = useState<PreflightResponse | null>(null);

  useEffect(() => {
    loadData();
  }, [claimId]);

  async function loadData() {
    try {
      setLoading(true);
      const [cData, tData] = await Promise.all([
        claimsApi.getClaim(claimId),
        claimsApi.getTimeline(claimId).catch(() => [])
      ]);
      setClaim(cData);
      setTimeline(tData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load claim details");
    } finally {
      setLoading(false);
    }
  }

  const handlePreflight = async () => {
    try {
      setPreflightLoading(true);
      const result = await claimsApi.runPreflight(claimId);
      setPreflightResult(result);
      // Reload claim to get new status
      const updatedClaim = await claimsApi.getClaim(claimId);
      setClaim(updatedClaim);
      const updatedTimeline = await claimsApi.getTimeline(claimId);
      setTimeline(updatedTimeline);
    } catch (err: any) {
      alert(`Preflight failed: ${err.message || 'Unknown error'}`);
    } finally {
      setPreflightLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading claim workbench..." />;
  if (error || !claim) return <ErrorState message={error || "Claim not found"} onRetry={loadData} />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center text-sm text-slate-500 mb-2">
        <button onClick={() => router.push('/claims')} className="hover:text-slate-800 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Claims
        </button>
      </div>

      <PageHeader 
        title={`Claim: ${claim.claim_id}`} 
        description={`Submitted: ${claim.submission_timestamp || 'Not submitted'}`}
        action={
          <StatusBadge status={claim.preauth_status || 'Unknown'} />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Claim Summary & Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Summary</h3>
            </div>
            <div className="p-4">
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Patient ID</dt>
                  <dd className="font-medium text-slate-900">{claim.patient_id || '-'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Encounter ID</dt>
                  <dd className="font-medium text-blue-600 cursor-pointer" onClick={() => router.push(`/encounters/${claim.encounter_id}`)}>{claim.encounter_id}</dd>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <dt className="text-slate-500">Package Code</dt>
                  <dd className="font-medium text-slate-900">{claim.package_code}</dd>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-100">
                  <div>
                    <dt className="text-slate-500">Claimed Amount</dt>
                    <dd className="font-medium text-slate-900 text-lg">₹{claim.claimed_amount?.toLocaleString('en-IN') || 0}</dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-slate-500">Approved</dt>
                    <dd className="font-medium text-green-600 text-lg">₹{claim.approved_amount?.toLocaleString('en-IN') || 0}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>

          {/* Timeline Component */}
          <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Claim Timeline</h3>
            </div>
            <div className="p-4">
              {timeline.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-4">No events recorded.</div>
              ) : (
                <div className="flow-root">
                  <ul role="list" className="-mb-8">
                    {timeline.map((event, eventIdx) => (
                      <li key={event.event_id}>
                        <div className="relative pb-8">
                          {eventIdx !== timeline.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                                <ShieldCheck className="h-4 w-4 text-blue-600" aria-hidden="true" />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-slate-900 font-medium">
                                  {event.event_type.replace(/_/g, ' ')}
                                </p>
                                {event.description && <p className="mt-0.5 text-sm text-slate-500">{event.description}</p>}
                              </div>
                              <div className="whitespace-nowrap text-right text-xs text-slate-500">
                                {event.timestamp ? new Date(event.timestamp).toLocaleString('en-IN') : '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Preflight Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-900">Preflight Validation</h3>
              <button
                onClick={handlePreflight}
                disabled={preflightLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400"
              >
                {preflightLoading ? (
                  <><LoadingSpinner /> <span className="ml-2">Running...</span></>
                ) : (
                  <><Play className="h-4 w-4 mr-2" /> Run Preflight Check</>
                )}
              </button>
            </div>
            <div className="p-6">
              {!preflightResult ? (
                <div className="text-center py-12">
                  <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-slate-900">Ready for validation</h3>
                  <p className="mt-1 text-sm text-slate-500">Run a preflight check to validate claim constraints deterministically.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`p-4 rounded-md flex items-start ${
                    preflightResult.status === 'Failed' ? 'bg-red-50' : 'bg-green-50'
                  }`}>
                    {preflightResult.status === 'Failed' ? (
                      <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
                    )}
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        preflightResult.status === 'Failed' ? 'text-red-800' : 'text-green-800'
                      }`}>
                        Validation {preflightResult.status}
                      </h3>
                    </div>
                  </div>

                  {preflightResult.errors.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Errors</h4>
                      <ul className="space-y-2">
                        {preflightResult.errors.map((err, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-700">
                            <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {preflightResult.missing_documents.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Missing Mandatory Documents</h4>
                      <ul className="space-y-2">
                        {preflightResult.missing_documents.map((doc, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-700">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {preflightResult.warnings.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Warnings</h4>
                      <ul className="space-y-2">
                        {preflightResult.warnings.map((warn, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-700">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                            {warn}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {preflightResult.errors.length === 0 && preflightResult.missing_documents.length === 0 && (
                    <div className="flex items-start text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      All validation rules passed successfully.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
