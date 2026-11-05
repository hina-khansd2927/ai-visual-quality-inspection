'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Package,
  Layers,
  Wrench,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { InspectionRecord, InspectionStats } from '@/lib/types';

interface DashboardViewProps {
  stats: InspectionStats;
  recentInspections: InspectionRecord[];
}

export function DashboardView({
  stats,
  recentInspections,
}: DashboardViewProps) {
  const router = useRouter();

  const categoryCounts = recentInspections.reduce<Record<string, number>>(
    (acc, item) => {
      const cat = item.product_category || 'General';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {}
  );

  const categoryList = [
    {
      label: 'Metal Parts',
      key: 'Metal Part',
      icon: Wrench,
      count: categoryCounts['Metal Part'] || 0,
    },
    {
      label: 'Bottles & Packaging',
      key: 'Bottle / Packaging',
      icon: Package,
      count: categoryCounts['Bottle / Packaging'] || 0,
    },
    {
      label: 'Electronics & PCBs',
      key: 'Electronic Component',
      icon: Cpu,
      count: categoryCounts['Electronic Component'] || 0,
    },
    {
      label: 'Clothing & Fabric',
      key: 'Clothing / Fabric',
      icon: Layers,
      count: categoryCounts['Clothing / Fabric'] || 0,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-gradient-to-r from-[#142B4A] to-[#1E3A8A] rounded-2xl p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Computer Vision First-Pass Quality Audit
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display mb-3">
            Industrial Visual Quality Assurance
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed mb-6">
            Upload product photos across metal, packaging, electronics, or
            textiles. The multimodal AI engine inspects surface integrity,
            classifies defects by severity, and logs traceable compliance
            records in real time.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/inspect"
              className="px-5 py-2.5 text-sm font-semibold text-slate-900 bg-white hover:bg-blue-50 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-white flex items-center gap-2"
            >
              <span>Start New Inspection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/history"
              className="px-4 py-2.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-blue-300/30"
            >
              Browse Full Audit History
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Audits</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono-numbers tracking-tight">
            {stats.total}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Pass Rate:</span>
            <span className="font-semibold text-slate-700 font-mono-numbers">
              {stats.passRate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-medium text-slate-500">
              Passed Quality
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 font-mono-numbers tracking-tight">
            {stats.passCount}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            No critical flaws detected
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-medium text-slate-500">
              Defects Flagged (Fail)
            </span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 font-mono-numbers tracking-tight">
            {stats.failCount}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Confirmed surface or part flaws
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-medium text-slate-500">
              Needs Human Review
            </span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 font-mono-numbers tracking-tight">
            {stats.reviewCount}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Blur, lighting, or ambiguity
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 font-display mb-1">
            Category Coverage
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Distribution of inspected manufacturing assets
          </p>

          <div className="space-y-4">
            {categoryList.map((cat) => {
              const Icon = cat.icon;
              const percentage =
                stats.total > 0 ? (cat.count / stats.total) * 100 : 0;
              return (
                <div key={cat.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                      <Icon className="w-3.5 h-3.5 text-blue-600" />
                      {cat.label}
                    </span>
                    <span className="font-mono-numbers text-slate-500">
                      {cat.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Recent Inspections
                </h2>
                <p className="text-xs text-slate-500">
                  Latest inspection records stored in the audit trail
                </p>
              </div>
              <Link
                href="/history"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentInspections.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No inspections recorded yet. Click &quot;Start New
                Inspection&quot; to run your first check.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                {recentInspections.slice(0, 5).map((item) => {
                  const defectCount = item.defects?.length || 0;
                  const dateStr = new Date(item.created_at).toLocaleTimeString(
                    [],
                    {
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric',
                    }
                  );

                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        router.push(`/results/${item.id}`)
                      }
                      className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 rounded-lg px-2 -mx-2 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image_url}
                          alt={item.image_name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {item.image_name}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>{item.product_category}</span>
                            <span>&middot;</span>
                            <span className="flex items-center gap-0.5 font-mono-numbers">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {dateStr}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {item.status === 'PASS' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            PASS
                          </span>
                        )}
                        {item.status === 'FAIL' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            FAIL ({defectCount})
                          </span>
                        )}
                        {item.status === 'NEEDS_REVIEW' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            REVIEW
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Audit integrity guaranteed via server-verified vision models.
            </span>
            <Link
              href="/inspect"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Inspect Another Image &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
