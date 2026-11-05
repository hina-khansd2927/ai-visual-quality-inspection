'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldAlert,
  Info,
} from 'lucide-react';
import type {
  InspectionRecord,
  DefectSeverity,
} from '@/lib/types';

interface InspectionResultViewProps {
  inspection: InspectionRecord;
  storageMode: string;
}

export function InspectionResultView({
  inspection,
  storageMode,
}: InspectionResultViewProps) {
  const [activeDefectIndex, setActiveDefectIndex] = useState<number | null>(
    null
  );
  const [showOverlays, setShowOverlays] = useState<boolean>(true);

  const defects = inspection.defects || [];
  const hasBoundingBoxes = defects.some(
    (d) => d.box_2d && d.box_2d.length === 4
  );

  const getSeverityBadge = (severity: DefectSeverity) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Critical
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Moderate
          </span>
        );
      case 'Minor':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Minor
          </span>
        );
    }
  };

  const getSeverityBoxColor = (
    severity: DefectSeverity,
    isActive: boolean
  ) => {
    switch (severity) {
      case 'Critical':
        return isActive
          ? 'border-rose-600 bg-rose-500/25 ring-2 ring-rose-400'
          : 'border-rose-500 bg-rose-500/15';
      case 'Moderate':
        return isActive
          ? 'border-amber-600 bg-amber-500/25 ring-2 ring-amber-400'
          : 'border-amber-500 bg-amber-500/15';
      case 'Minor':
      default:
        return isActive
          ? 'border-blue-600 bg-blue-500/25 ring-2 ring-blue-400'
          : 'border-blue-500 bg-blue-500/15';
    }
  };

  const confidencePercentage = inspection.estimated_confidence
    ? Math.round(inspection.estimated_confidence * 100)
    : 85;

  const dateFormatted = new Date(inspection.created_at).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inspection History</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/inspect"
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 font-display"
          >
            Start Another Inspection
          </Link>
        </div>
      </div>

      <div
        className={`rounded-2xl p-6 sm:p-7 border shadow-xs transition-colors ${
          inspection.status === 'PASS'
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : inspection.status === 'FAIL'
              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                inspection.status === 'PASS'
                  ? 'bg-emerald-600 text-white'
                  : inspection.status === 'FAIL'
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-600 text-white'
              }`}
            >
              {inspection.status === 'PASS' && (
                <CheckCircle2 className="w-7 h-7" />
              )}
              {inspection.status === 'FAIL' && (
                <XCircle className="w-7 h-7" />
              )}
              {inspection.status === 'NEEDS_REVIEW' && (
                <AlertTriangle className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-75 font-display">
                  Inspection Outcome
                </span>
                <span className="text-[11px] font-mono-numbers opacity-60">
                  ID: {inspection.id}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display mt-0.5">
                {inspection.status === 'PASS' &&
                  'QUALITY PASSED \u2014 NOMINAL'}
                {inspection.status === 'FAIL' &&
                  `DEFECTS DETECTED \u2014 REJECT (${defects.length})`}
                {inspection.status === 'NEEDS_REVIEW' &&
                  'UNCERTAIN \u2014 NEEDS HUMAN AUDIT'}
              </h1>
              <p className="text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed opacity-90">
                {inspection.summary}
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3.5 border border-slate-200/60 shrink-0 min-w-44 text-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span title="Model-estimated confidence heuristic; not calibrated industrial measurement.">
                <Info className="w-3 h-3 text-slate-400" />
              </span>
            </div>
            <div className="text-2xl font-bold font-mono-numbers text-slate-900">
              {confidencePercentage}%
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${
                  inspection.status === 'PASS'
                    ? 'bg-emerald-600'
                    : inspection.status === 'FAIL'
                      ? 'bg-rose-600'
                      : 'bg-amber-600'
                }`}
                style={{ width: `${confidencePercentage}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Assistive AI heuristic rating
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 font-display">
                Inspected Part Viewport
              </span>
              <span className="text-[11px] text-slate-500">
                ({inspection.product_category})
              </span>
            </div>

            {hasBoundingBoxes && (
              <button
                type="button"
                onClick={() => setShowOverlays(!showOverlays)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  showOverlays
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {showOverlays ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
                <span>
                  {showOverlays ? 'Defect Boxes: On' : 'Defect Boxes: Off'}
                </span>
              </button>
            )}
          </div>

          <div className="relative p-4 bg-slate-900/5 flex items-center justify-center min-h-[380px]">
            <div className="relative inline-block max-w-full">
              <img
                src={inspection.image_url}
                alt={inspection.image_name}
                className="max-h-[520px] w-auto max-w-full rounded-lg object-contain shadow-xs block"
                referrerPolicy="no-referrer"
              />

              {showOverlays &&
                defects.map((defect, idx) => {
                  if (!defect.box_2d || defect.box_2d.length !== 4) {
                    return null;
                  }
                  const [ymin, xmin, ymax, xmax] = defect.box_2d;

                  const top = ymin / 10;
                  const left = xmin / 10;
                  const width = (xmax - xmin) / 10;
                  const height = (ymax - ymin) / 10;
                  const isActive = activeDefectIndex === idx;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setActiveDefectIndex(idx)}
                      onMouseLeave={() => setActiveDefectIndex(null)}
                      style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                      }}
                      className={`absolute border-2 rounded transition-all cursor-pointer ${getSeverityBoxColor(
                        defect.severity,
                        isActive
                      )}`}
                    >
                      <div
                        className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-xs whitespace-nowrap pointer-events-none ${
                          defect.severity === 'Critical'
                            ? 'bg-rose-600'
                            : defect.severity === 'Moderate'
                              ? 'bg-amber-600'
                              : 'bg-blue-600'
                        }`}
                      >
                        #{idx + 1} {defect.type}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">
                {inspection.image_name}
              </span>
              <span>&middot;</span>
              <span className="font-mono-numbers">{dateFormatted}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Storage:{' '}
              {storageMode === 'supabase'
                ? 'Supabase S3 Signed'
                : 'Local Disk Persistent'}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Identified Defects ({defects.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Surface, structural, and component abnormalities
                </p>
              </div>
            </div>

            {defects.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="font-semibold text-slate-900">
                  Zero Detectable Flaws
                </div>
                <p className="text-slate-500 max-w-xs mx-auto">
                  The part surface meets standard inspection tolerances for
                  this visual pass.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {defects.map((defect, idx) => {
                  const isActive = activeDefectIndex === idx;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setActiveDefectIndex(idx)}
                      onMouseLeave={() => setActiveDefectIndex(null)}
                      className={`p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-600/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center font-mono-numbers">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900 font-display">
                            {defect.type}
                          </span>
                        </div>
                        {getSeverityBadge(defect.severity)}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed pl-7">
                        {defect.description}
                      </p>

                      {defect.box_2d && (
                        <div className="pl-7 mt-2 text-[10px] font-mono-numbers text-slate-400">
                          Coords: [{defect.box_2d.join(', ')}]
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-2 text-slate-900 font-bold font-display">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Inspection Limitations &amp; Disclaimer</span>
            </div>
            <p className="leading-relaxed text-slate-600 text-[11px]">
              {inspection.limitations ||
                'Analysis is bounded by the single photograph viewpoint, resolution, and ambient lighting conditions.'}
            </p>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/70">
              Note: This tool is an automated, assistive first-pass prototype
              for screening and does not replace certified industrial quality
              calibration or physical destructive testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
