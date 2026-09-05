"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { patientsApi, Patient } from "@/lib/api/patients";
import { encountersApi, Encounter } from "@/lib/api/encounters";
import { claimsApi, Claim } from "@/lib/api/claims";
import { ArrowLeft, UserSquare, Calendar, Stethoscope, FileBadge, Activity, FileText } from "lucide-react";
import Link from "next/link";

export default function PatientDetail() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [pData, eData, cData] = await Promise.all([
          patientsApi.getPatient(patientId),
          encountersApi.getEncounters(patientId),
          claimsApi.getClaims() // We filter below since backend might not have patient_id filter for claims yet
        ]);
        
        setPatient(pData);
        setEncounters(eData);
        // Map claims to encounters for this patient
        const patientClaimList = cData.filter(c => eData.some(e => e.encounter_id === c.encounter_id) || c.patient_id === patientId);
        setClaims(patientClaimList);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load patient details");
      } finally {
        setLoading(false);
      }
    }
    
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  if (loading) return <LoadingState message="Loading patient workspace..." />;
  if (error || !patient) return <ErrorState message={error || "Patient not found"} onRetry={() => window.location.reload()} />;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserSquare },
    { id: 'encounters', label: 'Encounters', count: encounters.length, icon: Stethoscope },
    { id: 'claims', label: 'Claims', count: claims.length, icon: FileBadge },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-slate-500 mb-2">
        <button onClick={() => router.push('/patients')} className="hover:text-slate-800 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Patients
        </button>
      </div>

      <PageHeader 
        title={patient.full_name} 
        description={`Patient ID: ${patient.patient_id}`}
      />

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className={`mr-2 h-5 w-5 ${isActive ? "text-blue-500" : "text-slate-400 group-hover:text-slate-500"}`} />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                    isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-900"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="py-4">
        {activeTab === 'overview' && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-lg leading-6 font-medium text-slate-900">Demographics</h3>
            </div>
            <div className="px-6 py-5">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-slate-900">{patient.full_name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">Age / Gender</dt>
                  <dd className="mt-1 text-sm text-slate-900">{patient.age ? `${patient.age} years` : '-'} / {patient.gender || '-'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">Contact Number</dt>
                  <dd className="mt-1 text-sm text-slate-900">{patient.contact_number || '-'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">ABHA ID</dt>
                  <dd className="mt-1 text-sm text-slate-900">{patient.abha_id || '-'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">Address</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {[patient.address, patient.district, patient.state_domicile].filter(Boolean).join(', ') || '-'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">Ration Card Type</dt>
                  <dd className="mt-1 text-sm text-slate-900">{patient.ration_card_type || '-'}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'encounters' && (
          <div className="space-y-4">
            {encounters.length === 0 ? (
              <EmptyState title="No encounters" description="This patient has no recorded encounters." />
            ) : (
              encounters.map(enc => (
                <div key={enc.encounter_id} className="bg-white shadow-sm border border-slate-200 rounded-lg p-5 flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Stethoscope className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {enc.encounter_id}
                        <StatusBadge status={enc.status || ''} />
                      </h4>
                      <div className="mt-1 text-sm text-slate-500">
                        Admission: {enc.admission_date || '-'} • Type: {enc.admission_type || '-'}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Attending: {enc.attending_doctor || enc.doctor_id || '-'}
                      </div>
                    </div>
                  </div>
                  <Link href={`/encounters/${enc.encounter_id}`} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm">
                    View Encounter
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="space-y-4">
            {claims.length === 0 ? (
              <EmptyState title="No claims" description="No claims have been generated for this patient." />
            ) : (
              claims.map(claim => (
                <div key={claim.claim_id} className="bg-white shadow-sm border border-slate-200 rounded-lg p-5 flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <FileBadge className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {claim.claim_id}
                        <StatusBadge status={claim.preauth_status || ''} />
                      </h4>
                      <div className="mt-1 text-sm text-slate-500">
                        Encounter: {claim.encounter_id} • Package: <span className="font-medium text-slate-700">{claim.package_code}</span>
                      </div>
                      <div className="mt-1 text-sm text-slate-900 font-medium">
                        Amount: ₹{claim.claimed_amount?.toLocaleString('en-IN') || 0}
                      </div>
                    </div>
                  </div>
                  <Link href={`/claims/${claim.claim_id}`} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm">
                    View Claim
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
