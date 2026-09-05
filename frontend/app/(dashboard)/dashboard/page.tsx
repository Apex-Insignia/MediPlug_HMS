"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Activity, Users, FileBadge, CheckCircle, Clock, Calendar } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { patientsApi } from "@/lib/api/patients";
import { encountersApi, Encounter } from "@/lib/api/encounters";
import { claimsApi } from "@/lib/api/claims";

export default function Dashboard() {
  const { user, role } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    activeEncounters: 0,
    processingClaims: 0,
    approvedClaims: 0,
  });
  const [recentEncounters, setRecentEncounters] = useState<Encounter[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        
        const [patients, encounters, claims] = await Promise.all([
          patientsApi.getPatients(),
          encountersApi.getEncounters(),
          claimsApi.getClaims()
        ]);
        
        setMetrics({
          totalPatients: patients.length,
          activeEncounters: encounters.filter(e => e.status !== "DISCHARGED").length,
          processingClaims: claims.filter(c => c.preauth_status === "Processing" || c.preauth_status === "Submitted").length,
          approvedClaims: claims.filter(c => c.preauth_status === "Approved").length,
        });

        setRecentEncounters(encounters.slice(0, 5));
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  // Render different dashboards based on role
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard overview" 
        description={`Welcome back to your workspace. You are logged in as ${role?.replace('_', ' ')}.`} 
      />

      {role === 'ADMIN' && <AdminDashboard metrics={metrics} recentEncounters={recentEncounters} />}
      {role === 'DOCTOR' && <DoctorDashboard metrics={metrics} recentEncounters={recentEncounters} />}
      {role === 'RECEPTIONIST' && <ReceptionistDashboard metrics={metrics} recentEncounters={recentEncounters} />}
      {(role === 'CLAIM_OFFICER' || role === 'AUDITOR') && <FinanceDashboard metrics={metrics} recentEncounters={recentEncounters} />}
      {role === 'NURSE' && <ReceptionistDashboard metrics={metrics} recentEncounters={recentEncounters} />}
      
    </div>
  );
}

function AdminDashboard({ metrics, recentEncounters }: { metrics: any, recentEncounters: Encounter[] }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={metrics.totalPatients} icon={Users} color="text-medical-600" bgColor="bg-medical-50" />
        <StatCard title="Active Encounters" value={metrics.activeEncounters} icon={Activity} color="text-teal-600" bgColor="bg-teal-50" />
        <StatCard title="Processing Claims" value={metrics.processingClaims} icon={FileBadge} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard title="Approved Claims" value={metrics.approvedClaims} icon={CheckCircle} color="text-emerald-600" bgColor="bg-emerald-50" />
      </div>
      <RecentEncountersTable encounters={recentEncounters} />
    </>
  );
}

function DoctorDashboard({ metrics, recentEncounters }: { metrics: any, recentEncounters: Encounter[] }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="My Patients" value={metrics.totalPatients} icon={Users} color="text-medical-600" bgColor="bg-medical-50" />
        <StatCard title="Active Cases" value={metrics.activeEncounters} icon={Activity} color="text-rose-600" bgColor="bg-rose-50" />
        <StatCard title="Today's Appointments" value={5} icon={Calendar} color="text-teal-600" bgColor="bg-teal-50" />
      </div>
      <RecentEncountersTable encounters={recentEncounters} />
    </>
  );
}

function ReceptionistDashboard({ metrics, recentEncounters }: { metrics: any, recentEncounters: Encounter[] }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Queue" value={12} icon={Users} color="text-medical-600" bgColor="bg-medical-50" />
        <StatCard title="Wait Time (avg)" value={"15m"} icon={Clock} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard title="Active Encounters" value={metrics.activeEncounters} icon={Activity} color="text-teal-600" bgColor="bg-teal-50" />
        <StatCard title="Discharged Today" value={3} icon={CheckCircle} color="text-emerald-600" bgColor="bg-emerald-50" />
      </div>
      <RecentEncountersTable encounters={recentEncounters} />
    </>
  );
}

function FinanceDashboard({ metrics, recentEncounters }: { metrics: any, recentEncounters: Encounter[] }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pending Pre-Auths" value={metrics.processingClaims} icon={FileBadge} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard title="Approved Today" value={metrics.approvedClaims} icon={CheckCircle} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard title="Rejected Claims" value={0} icon={Activity} color="text-rose-600" bgColor="bg-rose-50" />
        <StatCard title="Total Claims" value={metrics.processingClaims + metrics.approvedClaims} icon={FileBadge} color="text-medical-600" bgColor="bg-medical-50" />
      </div>
      <RecentEncountersTable encounters={recentEncounters} />
    </>
  );
}


function StatCard({ title, value, icon: Icon, color, bgColor }: { title: string, value: any, icon: any, color: string, bgColor: string }) {
  return (
    <div className="clinical-card">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-xl ${bgColor} ${color} shadow-sm border border-slate-100`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{title}</dt>
              <dd>
                <div className="text-2xl font-bold text-slate-800 tracking-tight">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentEncountersTable({ encounters }: { encounters: Encounter[] }) {
  return (
    <div className="mt-8 clinical-card">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="heading-3">Recent Encounters</h2>
      </div>
      
      {encounters.length === 0 ? (
        <div className="p-8 text-sm text-slate-500 text-center flex flex-col items-center">
          <Activity className="h-10 w-10 text-slate-300 mb-3" />
          No recent encounters found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr>
                <th scope="col" className="table-header">Encounter ID</th>
                <th scope="col" className="table-header">Patient ID</th>
                <th scope="col" className="table-header">Date</th>
                <th scope="col" className="table-header">Type</th>
                <th scope="col" className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {encounters.map((enc) => (
                <tr key={enc.encounter_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="table-cell font-medium text-medical-600">{enc.encounter_id}</td>
                  <td className="table-cell text-slate-600 font-medium">{enc.patient_id}</td>
                  <td className="table-cell text-slate-500">{new Date(enc.admission_date || '').toLocaleDateString()}</td>
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      {enc.admission_type}
                    </span>
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={enc.status || 'Unknown'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
