import { FileSearch } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px] bg-white border border-slate-200 rounded-lg shadow-sm text-center">
      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
        <FileSearch className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
    </div>
  );
}
