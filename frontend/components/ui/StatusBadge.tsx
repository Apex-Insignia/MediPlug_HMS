import React from "react";

export function StatusBadge({ status }: { status: string }) {
  let colorClass = "bg-slate-100 text-slate-800 border-slate-200"; // default neutral
  
  const s = status?.toLowerCase() || "";

  if (s === "approved" || s === "passed" || s === "active" || s === "verified") {
    colorClass = "bg-green-50 text-green-700 border-green-200";
  } else if (s === "draft" || s === "pending" || s === "pending_verification") {
    colorClass = "bg-slate-100 text-slate-700 border-slate-200";
  } else if (s === "blocked" || s === "failed" || s === "rejected" || s === "revoked") {
    colorClass = "bg-red-50 text-red-700 border-red-200";
  } else if (s === "requires review" || s === "query raised" || s === "processing") {
    colorClass = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (s === "discharged") {
    colorClass = "bg-blue-50 text-blue-700 border-blue-200";
  }

  // Format text nicely (e.g., PENDING_VERIFICATION -> Pending Verification)
  const displayStatus = (status || "Unknown").split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {displayStatus}
    </span>
  );
}
