import type {
  DefectItem,
  InspectionStatus,
  ProductCategory,
} from '../types';

export interface SaveInspectionInput {
  id: string;
  imageName: string;
  imageBuffer: Buffer;
  mimeType: string;
  category: ProductCategory | string;
  status: InspectionStatus;
  defects: DefectItem[];
  summary: string;
  estimated_confidence: number;
  limitations: string;
  created_at: string;
}
