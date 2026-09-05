"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchApi } from "@/lib/api/client";
import { ClipboardList, DollarSign, Activity } from "lucide-react";

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPackages() {
      try {
        const data = await fetchApi('/packages');
        setPackages(data);
      } catch (err: any) {
        setError(err.message || "Failed to load packages.");
      } finally {
        setLoading(false);
      }
    }
    loadPackages();
  }, []);

  if (loading) return <LoadingState message="Loading hospital packages..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Medical Packages" 
        description="View and manage hospital treatment packages and standard pricing."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {packages.length === 0 ? (
          <div className="col-span-full clinical-card p-12 text-center text-slate-500">
            No medical packages found.
          </div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.package_id} className="clinical-card group flex flex-col h-full">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                      <ClipboardList className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {pkg.name}
                    </h3>
                  </div>
                  {pkg.is_active && (
                    <span className="badge-success ml-2 flex-shrink-0">Active</span>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-sm text-slate-600 line-clamp-3 min-h-[4rem]">
                    {pkg.description || "No description provided for this package."}
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Standard Price</span>
                  <span className="font-bold text-emerald-600 flex items-center">
                    <DollarSign className="h-4 w-4" />
                    {pkg.price?.toLocaleString()}
                  </span>
                </div>
                {pkg.days_included && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Duration</span>
                    <span className="font-medium text-slate-700">{pkg.days_included} Days</span>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t border-slate-200/60 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PKG ID: {pkg.package_id}</span>
                  <button className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:text-blue-800">Edit</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
