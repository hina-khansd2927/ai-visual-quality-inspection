import { RefreshCw } from 'lucide-react';

export default function Loading() {
  return (
    <div className="py-24 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      <span>Loading inspection history...</span>
    </div>
  );
}
