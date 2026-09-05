"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { encountersApi, Encounter, ClinicalNote, DiagnosticReport } from "@/lib/api/encounters";
import { patientsApi, Patient } from "@/lib/api/patients";
import { ArrowLeft, Stethoscope, FileText, Activity } from "lucide-react";

export default function EncounterDetail() {
  const params = useParams();
  const router = useRouter();
  const encounterId = params.id as string;
  
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const encData = await encountersApi.getEncounter(encounterId);
        setEncounter(encData);
        
        // Load associated patient data
        if (encData.patient_id) {
          try {
            const pData = await patientsApi.getPatient(encData.patient_id);
            setPatient(pData);
          } catch (e) {
            // patient might not exist or failed
          }
        }
        
        // Load notes and diagnostics
        const [notes, reports] = await Promise.all([
          encountersApi.getClinicalNotes(encounterId).catch(() => []),
          encountersApi.getDiagnosticReports(encounterId).catch(() => [])
        ]);
        
        setClinicalNotes(notes);
        setDiagnostics(reports);
        
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load encounter details");
      } finally {
        setLoading(false);
      }
    }
    
    if (encounterId) {
      loadData();
    }
  }, [encounterId]);

  if (loading) return <LoadingState message="Loading clinical workspace..." />;
  if (error || !encounter) return <ErrorState message={error || "Encounter not found"} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center text-sm text-slate-500 mb-2">
        <button onClick={() => router.push('/encounters')} className="hover:text-slate-800 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Encounters
        </button>
      </div>

      <PageHeader 
        title={`Encounter: ${encounter.encounter_id}`} 
        description={`Admitted: ${encounter.admission_date || 'Unknown'}`}
        action={
          <StatusBadge status={encounter.status || 'Unknown'} />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Meta */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Patient Details</h3>
            </div>
            <div className="p-4">
              {patient ? (
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Patient ID</dt>
                    <dd className="font-medium text-blue-600 cursor-pointer" onClick={() => router.push(`/patients/${patient.patient_id}`)}>{patient.patient_id}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Name</dt>
                    <dd className="font-medium text-slate-900">{patient.full_name}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Demographics</dt>
                    <dd className="text-slate-900">{patient.age ? `${patient.age}y` : '-'} / {patient.gender || '-'}</dd>
                  </div>
                </dl>
              ) : (
                <div className="text-sm text-slate-500">{encounter.patient_id} (Details unavailable)</div>
              )}
            </div>
          </div>
          
          <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Encounter Details</h3>
            </div>
            <div className="p-4">
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Admission Type</dt>
                  <dd className="font-medium text-slate-900">{encounter.admission_type || '-'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Attending Doctor</dt>
                  <dd className="font-medium text-slate-900">{encounter.attending_doctor || encounter.doctor_id || '-'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Right Column - Clinical Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-slate-400" />
                Clinical Notes
              </h3>
            </div>
            <div className="p-0">
              {clinicalNotes.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No clinical notes recorded yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {clinicalNotes.map(note => (
                    <div key={note.note_id} className="p-6">
                      {note.provisional_diagnosis && (
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Provisional Diagnosis</h4>
                          <p className="text-sm font-medium text-slate-900">{note.provisional_diagnosis}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Doctor's Note</h4>
                        <div className="text-sm text-slate-800 whitespace-pre-wrap bg-slate-50 p-3 rounded-md border border-slate-200 font-mono">
                          {note.doctor_note_raw || 'Empty note content.'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-slate-400" />
                Diagnostic Reports
              </h3>
            </div>
            <div className="p-0">
              {diagnostics.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No diagnostic reports uploaded.</div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Report ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">File</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {diagnostics.map(report => (
                      <tr key={report.report_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{report.report_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{report.report_type || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={report.file_status || ''} /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {report.file_url ? (
                            <a href={report.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-900">View</a>
                          ) : (
                            <span className="text-slate-400">Unavailable</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
