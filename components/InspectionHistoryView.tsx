'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  Plus,
} from 'lucide-react';
import { deleteInspectionRecord } from '@/lib/api-client';
import { useNotification } from './NotificationProvider';
import type { InspectionRecord } from '@/lib/types';

interface InspectionHistoryViewProps {
  inspections: InspectionRecord[];
  storageMode: string;
}

export function InspectionHistoryView({
  inspections,
  storageMode,
}: InspectionHistoryViewProps) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredInspections = inspections.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false;
    }
    if (
      categoryFilter !== 'ALL' &&
      item.product_category !== categoryFilter
    ) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = item.image_name.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchCategory = item.product_category.toLowerCase().includes(q);
      if (!matchName && !matchSummary && !matchCategory) return false;
    }
    return true;
  });

  const categories = [
    'ALL',
    'Metal Part',
    'Bottle / Packaging',
    'Electronic Component',
    'Clothing / Fabric',
    'Other',
  ];

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inspection record from history?')) return;
    try {
      const ok = await deleteInspectionRecord(id);
      if (ok) {
        showNotification('success', 'Inspection record deleted.');
        router.refresh();
      } else {
        showNotification('error', 'Failed to delete record.');
      }
    } catch (err: any) {
      showNotification(
        'error',
        err.message || 'Failed to delete record.'
      );
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
            Inspection History &amp; Audit Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Traceable visual quality inspection records persisted in{' '}
            <span className="font-semibold text-slate-700">
              {storageMode === 'supabase'
                ? 'Supabase PostgreSQL'
                : 'Persistent Local Storage'}
            </span>
            .
          </p>
        </div>

        <Link
          href="/inspect"
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 font-display self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Inspection</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by filename, defect, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="sm:col-span-4 flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('PASS')}
              className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'PASS'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pass
            </button>
            <button
              onClick={() => setStatusFilter('FAIL')}
              className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'FAIL'
                  ? 'bg-white text-rose-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fail
            </button>
            <button
              onClick={() => setStatusFilter('NEEDS_REVIEW')}
              className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'NEEDS_REVIEW'
                  ? 'bg-white text-amber-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Review
            </button>
          </div>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
            >
              <option value="ALL">All Categories</option>
              {categories
                .filter((c) => c !== 'ALL')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredInspections.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Filter className="w-5 h-5" />
            </div>
            <div className="font-semibold text-slate-900">
              No matching inspections found
            </div>
            <p className="text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold font-display">
                  <th className="py-3 px-4">Product Image</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Audit Outcome</th>
                  <th className="py-3 px-4">Findings &amp; Defects</th>
                  <th className="py-3 px-4">Inspection Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInspections.map((item) => {
                  const defectCount = item.defects?.length || 0;
                  const dateStr = new Date(item.created_at).toLocaleString(
                    [],
                    {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  );

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/results/${item.id}`)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image_url}
                            alt={item.image_name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 max-w-[160px] sm:max-w-xs">
                            <div className="font-semibold text-slate-900 truncate">
                              {item.image_name}
                            </div>
                            <div className="text-[11px] font-mono-numbers text-slate-400 truncate">
                              {item.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {item.product_category}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.status === 'PASS' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            PASS
                          </span>
                        )}
                        {item.status === 'FAIL' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            FAIL ({defectCount})
                          </span>
                        )}
                        {item.status === 'NEEDS_REVIEW' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            NEEDS REVIEW
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <div className="line-clamp-2 text-slate-600">
                          {item.summary}
                        </div>
                        {defectCount > 0 && (
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                            <span className="font-medium text-slate-700">
                              Flaws:
                            </span>
                            {item.defects.slice(0, 2).map((d, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium"
                              >
                                {d.type}
                              </span>
                            ))}
                            {defectCount > 2 && (
                              <span className="text-[10px] text-slate-400">
                                +{defectCount - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono-numbers whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/results/${item.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          >
                            Details &rarr;
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
