import { getSupabaseClient } from '../supabase';
import type {
  InspectionFilterParams,
  InspectionRecord,
  ProductCategory,
} from '../types';
import type { SaveInspectionInput } from './types';

const BUCKET = 'inspection-images';

function mapRow(row: any, imageUrl: string): InspectionRecord {
  return {
    id: row.id,
    image_name: row.image_name,
    image_path: row.image_path,
    image_url: imageUrl,
    product_category: row.product_category as ProductCategory,
    status: row.status,
    defects: row.defects || [],
    summary: row.summary,
    estimated_confidence: row.estimated_confidence,
    limitations: row.limitations,
    created_at: row.created_at,
  };
}

export async function listSupabaseInspections(
  filters: InspectionFilterParams = {}
): Promise<InspectionRecord[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  let query = client
    .from('inspections')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'ALL') {
    query = query.eq('status', filters.status);
  }
  if (filters.category && filters.category !== 'ALL') {
    query = query.eq('product_category', filters.category);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Supabase query error: ${error.message}`);
  }

  const records = await Promise.all(
    (data || []).map(async (row: any) => {
      let imgUrl = row.image_path;
      if (row.image_path && !row.image_path.startsWith('http')) {
        const { data: signed } = await client.storage
          .from(BUCKET)
          .createSignedUrl(row.image_path, 3600);
        if (signed?.signedUrl) imgUrl = signed.signedUrl;
      }
      return mapRow(row, imgUrl);
    })
  );

  if (filters.search) {
    const q = filters.search.toLowerCase();
    return records.filter(
      (r) =>
        r.image_name.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.product_category.toLowerCase().includes(q)
    );
  }

  return records;
}

export async function getSupabaseInspection(
  id: string
): Promise<InspectionRecord | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('inspections')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  let imgUrl = data.image_path;
  if (data.image_path && !data.image_path.startsWith('http')) {
    const { data: signed } = await client.storage
      .from(BUCKET)
      .createSignedUrl(data.image_path, 3600);
    if (signed?.signedUrl) imgUrl = signed.signedUrl;
  }

  return mapRow(data, imgUrl);
}

export async function saveSupabaseInspection(
  input: SaveInspectionInput
): Promise<InspectionRecord> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const rawExt = input.imageName.split('.').pop()?.toLowerCase();
  const ext =
    rawExt && ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt)
      ? rawExt
      : input.mimeType === 'image/png'
        ? 'png'
        : input.mimeType === 'image/webp'
          ? 'webp'
          : 'jpg';
  const storageFilename = `${input.id}.${ext}`;
  const storagePath = `inspections/${storageFilename}`;

  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(storagePath, input.imageBuffer, {
      contentType: input.mimeType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(
      `Supabase Storage upload failed: ${uploadError.message}. Check storage bucket and permissions.`
    );
  }

  const { data: signedData, error: signedError } = await client.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (signedError || !signedData?.signedUrl) {
    throw new Error(
      `Failed to generate signed URL from Supabase: ${signedError?.message || 'unknown error'}`
    );
  }

  const { error: dbError } = await client.from('inspections').insert([
    {
      id: input.id,
      image_name: input.imageName,
      image_path: storagePath,
      product_category: input.category,
      status: input.status,
      defects: input.defects,
      summary: input.summary,
      estimated_confidence: input.estimated_confidence,
      limitations: input.limitations,
      created_at: input.created_at,
    },
  ]);

  if (dbError) {
    throw new Error(
      `Failed to write inspection to Supabase database: ${dbError.message}`
    );
  }

  return {
    id: input.id,
    image_name: input.imageName,
    image_path: storagePath,
    image_url: signedData.signedUrl,
    product_category: input.category as ProductCategory,
    status: input.status,
    defects: input.defects,
    summary: input.summary,
    estimated_confidence: input.estimated_confidence,
    limitations: input.limitations,
    created_at: input.created_at,
  };
}

export async function deleteSupabaseInspection(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('inspections').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}
