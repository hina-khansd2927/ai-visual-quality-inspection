import type { DemoSampleItem, ProductCategory } from './types';

export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Auto Detect / General',
  'Metal Part',
  'Bottle / Packaging',
  'Electronic Component',
  'Clothing / Fabric',
  'Other',
];

export const HISTORY_CATEGORIES: string[] = [
  'ALL',
  'Metal Part',
  'Bottle / Packaging',
  'Electronic Component',
  'Clothing / Fabric',
  'Other',
];

export const DEMO_SAMPLES: DemoSampleItem[] = [
  {
    id: 'sample-metal-scratch',
    title: 'Machined Shaft Collar (Gouge & Dent)',
    category: 'Metal Part',
    imagePath: '/samples/sample_metal_scratch_1793910617988.jpg',
    expectedOutcome: 'FAIL',
    defectSummary: 'Deep diagonal surface scratch and edge rim impact damage',
  },
  {
    id: 'sample-metal-bearing',
    title: 'Precision Ball Bearing (Flawless)',
    category: 'Metal Part',
    imagePath: '/samples/sample_metal_pass_1793910632138.jpg',
    expectedOutcome: 'PASS',
    defectSummary: 'Pristine mirror-finish polished steel raceway & balls',
  },
  {
    id: 'sample-bottle-crack',
    title: 'HDPE Container (Shoulder Fracture)',
    category: 'Bottle / Packaging',
    imagePath: '/samples/sample_bottle_crack_1793910631980.jpg',
    expectedOutcome: 'FAIL',
    defectSummary: 'Long stress fracture along bottle body and tilted cap',
  },
  {
    id: 'sample-pcb-bridge',
    title: 'SMD Circuit Board (Solder Bridge)',
    category: 'Electronic Component',
    imagePath: '/samples/sample_pcb_bridge_1793910632249.jpg',
    expectedOutcome: 'FAIL',
    defectSummary: 'Solder bridge short between IC leads and unpopulated C14 pad',
  },
  {
    id: 'sample-fabric-tear',
    title: 'Industrial Canvas Swatch (Tear & Stain)',
    category: 'Clothing / Fabric',
    imagePath: '/samples/sample_fabric_tear_1793910647261.jpg',
    expectedOutcome: 'FAIL',
    defectSummary: 'Circular fiber tear with surrounding dark industrial grease stain',
  },
];

export function getDemoSamples(): DemoSampleItem[] {
  return DEMO_SAMPLES;
}
