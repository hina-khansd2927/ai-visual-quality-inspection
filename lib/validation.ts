import type { DefectSeverity, InspectionStatus } from './types';

export function validateBoundingBox(
  box: unknown
): [number, number, number, number] | undefined {
  if (!Array.isArray(box) || box.length !== 4) return undefined;
  const [ymin, xmin, ymax, xmax] = box.map(Number);
  if (isNaN(ymin) || isNaN(xmin) || isNaN(ymax) || isNaN(xmax)) return undefined;
  if (ymin < 0 || ymin > 1000 || ymax < 0 || ymax > 1000) return undefined;
  if (xmin < 0 || xmin > 1000 || xmax < 0 || xmax > 1000) return undefined;
  if (ymin >= ymax || xmin >= xmax) return undefined;
  return [
    Math.round(ymin),
    Math.round(xmin),
    Math.round(ymax),
    Math.round(xmax),
  ];
}

export function normalizeSeverity(value: unknown): DefectSeverity {
  const s = String(value || '').toLowerCase();
  if (s.includes('crit') || s.includes('high') || s.includes('severe')) {
    return 'Critical';
  }
  if (s.includes('min') || s.includes('low') || s.includes('cosmetic')) {
    return 'Minor';
  }
  return 'Moderate';
}

export function normalizeStatus(
  value: unknown,
  hasDefects: boolean
): InspectionStatus {
  const s = String(value || '').toUpperCase().trim();
  if (s === 'PASS' && !hasDefects) return 'PASS';
  if (s === 'FAIL' || hasDefects) return 'FAIL';
  if (s === 'NEEDS_REVIEW' || s === 'REVIEW' || s === 'UNCERTAIN') {
    return 'NEEDS_REVIEW';
  }
  return hasDefects ? 'FAIL' : 'PASS';
}
