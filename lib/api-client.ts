import type {
  DemoSampleItem,
  HealthResponse,
  InspectionRecord,
  ProductCategory,
} from './types';

async function parseError(res: Response, fallback: string): Promise<never> {
  const errorData = await res.json().catch(() => ({}));
  throw new Error(errorData.error || `${fallback} (HTTP ${res.status})`);
}

export async function uploadAndInspect(
  file: File | null,
  category: ProductCategory | string,
  samplePath?: string
): Promise<{ inspection: InspectionRecord; storageMode: string }> {
  const formData = new FormData();
  formData.append('category', category);

  if (samplePath) {
    formData.append('samplePath', samplePath);
  } else if (file) {
    formData.append('image', file);
  } else {
    throw new Error('Please select an image file or a demo sample.');
  }

  const res = await fetch('/api/inspections', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    await parseError(res, 'Inspection failed');
  }

  return res.json();
}

export async function deleteInspectionRecord(id: string): Promise<boolean> {
  const res = await fetch(`/api/inspections/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function fetchSamples(): Promise<DemoSampleItem[]> {
  const res = await fetch('/api/samples');
  if (!res.ok) return [];
  const data = await res.json();
  return data.samples || [];
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    return {
      status: 'error',
      storageMode: 'local_persistent',
      model: 'gemini-3.8-flash',
      timestamp: new Date().toISOString(),
    };
  }
  return res.json();
}
