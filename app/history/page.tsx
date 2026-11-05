import { InspectionHistoryView } from '@/components/InspectionHistoryView';
import { getStorageMode, listInspections } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const inspections = await listInspections();

  return (
    <InspectionHistoryView
      inspections={inspections}
      storageMode={getStorageMode()}
    />
  );
}
