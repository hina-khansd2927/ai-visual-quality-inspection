import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto py-20 text-center space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 font-display">
        Inspection not found
      </h1>
      <p className="text-sm text-slate-600">
        The record you are looking for does not exist or was deleted.
      </p>
      <Link
        href="/history"
        className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        Back to Inspection History
      </Link>
    </div>
  );
}
