import fs from 'fs';
import path from 'path';
import type {
  InspectionFilterParams,
  InspectionRecord,
  ProductCategory,
} from '../types';
import type { SaveInspectionInput } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'inspections.json');

export function isLocalPersistenceWritable(): boolean {
  return !process.env.VERCEL;
}

function ensureLocalStorage(): void {
  if (!isLocalPersistenceWritable()) return;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
  }
}

export function readLocalInspections(): InspectionRecord[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      ensureLocalStorage();
    }
    if (!fs.existsSync(DB_FILE)) return [];
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading local inspections DB:', err);
    return [];
  }
}

function writeLocalInspections(records: InspectionRecord[]): void {
  if (!isLocalPersistenceWritable()) {
    throw new Error(
      'Local persistent storage is not writable on Vercel. Configure Supabase credentials to persist inspection records.'
    );
  }
  ensureLocalStorage();
  fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

const SEED_RECORDS: InspectionRecord[] = [
  {
    id: 'insp-seed-01',
    image_name: 'machined_bearing_sample.jpg',
    image_path: '/samples/sample_metal_pass_1793910632138.jpg',
    image_url: '/samples/sample_metal_pass_1793910632138.jpg',
    product_category: 'Metal Part',
    status: 'PASS',
    defects: [],
    summary:
      'Precision stainless steel ball bearing assembly inspected with zero surface aberrations, uniform ball clearances, and pristine mirror finish.',
    estimated_confidence: 0.96,
    limitations: 'Single perspective top-down macro view.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'insp-seed-02',
    image_name: 'shaft_collar_gouge.jpg',
    image_path: '/samples/sample_metal_scratch_1793910617988.jpg',
    image_url: '/samples/sample_metal_scratch_1793910617988.jpg',
    product_category: 'Metal Part',
    status: 'FAIL',
    defects: [
      {
        type: 'Surface Gouge',
        severity: 'Critical',
        description:
          'Deep diagonal mechanical scoring across shaft collar face penetrating into core material.',
        box_2d: [180, 360, 750, 680],
      },
      {
        type: 'Impact Dent',
        severity: 'Moderate',
        description: 'Deformation notch on shaft tip rim.',
        box_2d: [500, 660, 730, 740],
      },
    ],
    summary:
      'Shaft collar failed inspection due to a severe structural surface gouge and rim notch damage.',
    estimated_confidence: 0.94,
    limitations: 'Angle permits face inspection; rear face unseen.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'insp-seed-03',
    image_name: 'industrial_solvent_bottle.jpg',
    image_path: '/samples/sample_bottle_crack_1793910631980.jpg',
    image_url: '/samples/sample_bottle_crack_1793910631980.jpg',
    product_category: 'Bottle / Packaging',
    status: 'FAIL',
    defects: [
      {
        type: 'Body Fracture',
        severity: 'Critical',
        description:
          'Continuous vertical stress crack propagating from neck seam down through body.',
        box_2d: [250, 570, 660, 710],
      },
      {
        type: 'Cap Misalignment',
        severity: 'Moderate',
        description:
          'Tamper closure cross-threaded and tilted off container neck axis.',
        box_2d: [90, 540, 240, 680],
      },
    ],
    summary:
      'Container rejected for packaging seal breach: severe shoulder stress fracture and tilted cap.',
    estimated_confidence: 0.92,
    limitations: 'Fluid containment not pressurized during test.',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

function seedLocalInspectionsIfEmpty(): void {
  if (!isLocalPersistenceWritable()) return;
  ensureLocalStorage();
  const existing = readLocalInspections();
  if (existing.length === 0) {
    writeLocalInspections(SEED_RECORDS);
  }
}

function applyFilters(
  records: InspectionRecord[],
  filters: InspectionFilterParams
): InspectionRecord[] {
  let filtered = records;
  if (filters.status && filters.status !== 'ALL') {
    filtered = filtered.filter((r) => r.status === filters.status);
  }
  if (filters.category && filters.category !== 'ALL') {
    filtered = filtered.filter(
      (r) => r.product_category === filters.category
    );
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.image_name.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.product_category.toLowerCase().includes(q)
    );
  }
  return filtered;
}

export function listLocalInspections(
  filters: InspectionFilterParams = {}
): InspectionRecord[] {
  seedLocalInspectionsIfEmpty();
  return applyFilters(readLocalInspections(), filters);
}

export function getLocalInspection(id: string): InspectionRecord | null {
  seedLocalInspectionsIfEmpty();
  return readLocalInspections().find((r) => r.id === id) || null;
}

export function saveLocalInspection(
  input: SaveInspectionInput
): InspectionRecord {
  if (!isLocalPersistenceWritable()) {
    throw new Error(
      'Local persistent storage is not writable on Vercel. Configure Supabase credentials to persist inspection records.'
    );
  }
  ensureLocalStorage();

  const rawExt = path.extname(input.imageName).toLowerCase();
  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = allowedExt.includes(rawExt)
    ? rawExt
    : input.mimeType === 'image/png'
      ? '.png'
      : input.mimeType === 'image/webp'
        ? '.webp'
        : '.jpg';
  const storageFilename = `${input.id}${ext}`;
  const localDest = path.join(UPLOADS_DIR, storageFilename);
  fs.writeFileSync(localDest, input.imageBuffer);

  const record: InspectionRecord = {
    id: input.id,
    image_name: input.imageName,
    image_path: `/uploads/${storageFilename}`,
    image_url: `/uploads/${storageFilename}`,
    product_category: input.category as ProductCategory,
    status: input.status,
    defects: input.defects,
    summary: input.summary,
    estimated_confidence: input.estimated_confidence,
    limitations: input.limitations,
    created_at: input.created_at,
  };

  const currentList = readLocalInspections();
  currentList.unshift(record);
  writeLocalInspections(currentList);
  return record;
}

export function deleteLocalInspection(id: string): void {
  const records = readLocalInspections();
  writeLocalInspections(records.filter((r) => r.id !== id));
}
