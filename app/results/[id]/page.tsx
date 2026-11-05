import { notFound } from 'next/navigation';
import { InspectionResultView } from '@/components/InspectionResultView';
import { getInspectionById, getStorageMode } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inspection = await getInspectionById(id);

  if (!inspection) {
    notFound();
  }

  return (
    <InspectionResultView
      inspection={inspection}
      storageMode={getStorageMode()}
    />
  );
}
