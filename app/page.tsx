import { DashboardView } from '@/components/DashboardView';
import { listInspections } from '@/lib/store';
import type { InspectionStats } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const inspections = await listInspections();

  const total = inspections.length;
  const passCount = inspections.filter((i) => i.status === 'PASS').length;
  const failCount = inspections.filter((i) => i.status === 'FAIL').length;
  const reviewCount = inspections.filter(
    (i) => i.status === 'NEEDS_REVIEW'
  ).length;
  const passRate = total > 0 ? (passCount / total) * 100 : 0;

  const stats: InspectionStats = {
    total,
    passCount,
    failCount,
    reviewCount,
    passRate,
  };

  return (
    <DashboardView stats={stats} recentInspections={inspections} />
  );
}
