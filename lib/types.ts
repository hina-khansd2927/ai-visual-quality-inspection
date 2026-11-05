export type DefectSeverity = 'Critical' | 'Moderate' | 'Minor';

export type InspectionStatus = 'PASS' | 'FAIL' | 'NEEDS_REVIEW';

export type ProductCategory =
  | 'Auto Detect / General'
  | 'Metal Part'
  | 'Bottle / Packaging'
  | 'Electronic Component'
  | 'Clothing / Fabric'
  | 'Other';

export type StorageMode = 'supabase' | 'local_persistent';

export interface DefectItem {
  type: string;
  severity: DefectSeverity;
  description: string;
  box_2d?: [number, number, number, number];
}

export interface InspectionRecord {
  id: string;
  image_name: string;
  image_path: string;
  image_url: string;
  product_category: ProductCategory;
  status: InspectionStatus;
  defects: DefectItem[];
  summary: string;
  estimated_confidence: number | null;
  limitations: string;
  created_at: string;
}

export interface InspectionStats {
  total: number;
  passCount: number;
  failCount: number;
  reviewCount: number;
  passRate: number;
}

export interface DemoSampleItem {
  id: string;
  title: string;
  category: ProductCategory;
  imagePath: string;
  expectedOutcome: 'FAIL' | 'PASS';
  defectSummary: string;
}

export interface InspectionFilterParams {
  status?: string;
  category?: string;
  search?: string;
}

export interface HealthResponse {
  status: string;
  storageMode: StorageMode;
  model: string;
  timestamp: string;
  warning?: string;
}
