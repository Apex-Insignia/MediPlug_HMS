import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px] text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function LoadingSpinner() {
  return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
}
