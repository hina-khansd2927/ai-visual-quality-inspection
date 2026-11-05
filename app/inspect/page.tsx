import { InspectionUploadView } from '@/components/InspectionUploadView';
import { getDemoSamples } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default function InspectPage() {
  return <InspectionUploadView samples={getDemoSamples()} />;
}
