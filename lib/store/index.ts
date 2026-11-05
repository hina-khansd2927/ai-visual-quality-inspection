import { GEMINI_VISION_MODEL } from '../server-config';
import { isSupabaseConfigured } from '../supabase';
import type {
  HealthResponse,
  InspectionFilterParams,
  InspectionRecord,
  StorageMode,
} from '../types';
import {
  deleteLocalInspection,
  getLocalInspection,
  isLocalPersistenceWritable,
  listLocalInspections,
  saveLocalInspection,
} from './local';
import {
  deleteSupabaseInspection,
  getSupabaseInspection,
  listSupabaseInspections,
  saveSupabaseInspection,
} from './supabase';
import type { SaveInspectionInput } from './types';

export type { SaveInspectionInput } from './types';

export function getStorageMode(): StorageMode {
  return isSupabaseConfigured ? 'supabase' : 'local_persistent';
}

export function isLocalModeOnVercel(): boolean {
  return !isSupabaseConfigured && !isLocalPersistenceWritable();
}

export async function listInspections(
  filters: InspectionFilterParams = {}
): Promise<InspectionRecord[]> {
  if (isSupabaseConfigured) {
    return listSupabaseInspections(filters);
  }
  return listLocalInspections(filters);
}

export async function getInspectionById(
  id: string
): Promise<InspectionRecord | null> {
  if (isSupabaseConfigured) {
    return getSupabaseInspection(id);
  }
  return getLocalInspection(id);
}

export async function saveInspection(
  input: SaveInspectionInput
): Promise<InspectionRecord> {
  if (isSupabaseConfigured) {
    return saveSupabaseInspection(input);
  }
  return saveLocalInspection(input);
}

export async function deleteInspection(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await deleteSupabaseInspection(id);
    return;
  }
  deleteLocalInspection(id);
}

export function getHealth(): HealthResponse {
  const storageMode = getStorageMode();
  return {
    status: 'ok',
    storageMode,
    model: GEMINI_VISION_MODEL,
    timestamp: new Date().toISOString(),
    ...(storageMode === 'local_persistent' && !isLocalPersistenceWritable()
      ? {
          warning:
            'Local persistent storage is not writable on Vercel. Configure Supabase credentials for persistent records.',
        }
      : {}),
  };
}
