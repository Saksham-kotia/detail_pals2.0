// ─── Detail Pals V2 — Gallery Service ───────────────────────────────
// Before/after gallery: upload to Supabase Storage, pair images, fetch pairs.

import { supabase } from '../lib/supabase';
import type { GalleryImage, GalleryPair, GalleryTag } from '../lib/types';

// ── Public: fetch gallery pairs (before + after grouped) ─────────────

export async function getGalleryPairs(): Promise<{
  pairs: GalleryPair[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .not('pair_id', 'is', null)
    .order('uploaded_at', { ascending: false });

  if (error) return { pairs: [], error: error.message };

  const images = data as GalleryImage[];

  // Group by pair_id
  const pairMap = new Map<string, { before: GalleryImage | null; after: GalleryImage | null }>();

  for (const img of images) {
    if (!img.pair_id) continue;
    if (!pairMap.has(img.pair_id)) {
      pairMap.set(img.pair_id, { before: null, after: null });
    }
    const pair = pairMap.get(img.pair_id)!;
    if (img.tag === 'before') pair.before = img;
    if (img.tag === 'after')  pair.after  = img;
  }

  const pairs: GalleryPair[] = Array.from(pairMap.entries())
    .filter(([, p]) => p.before && p.after)
    .map(([pair_id, p]) => ({
      pair_id,
      before:  p.before,
      after:   p.after,
      caption: p.after?.caption ?? p.before?.caption ?? '',
      service: p.after?.service_type ?? p.before?.service_type ?? '',
    }));

  return { pairs, error: null };
}

// ── Public: fetch both paired and unpaired gallery items ─────────────

export async function getPublicGallery(): Promise<{
  pairs: GalleryPair[];
  singles: GalleryImage[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) return { pairs: [], singles: [], error: error.message };

  const images = data as GalleryImage[];

  // Group by pair_id
  const pairMap = new Map<string, { before: GalleryImage | null; after: GalleryImage | null }>();
  const singles: GalleryImage[] = [];

  for (const img of images) {
    if (img.pair_id) {
      if (!pairMap.has(img.pair_id)) {
        pairMap.set(img.pair_id, { before: null, after: null });
      }
      const pair = pairMap.get(img.pair_id)!;
      if (img.tag === 'before') pair.before = img;
      if (img.tag === 'after')  pair.after  = img;
    } else {
      singles.push(img);
    }
  }

  const pairs: GalleryPair[] = Array.from(pairMap.entries())
    .filter(([, p]) => p.before && p.after)
    .map(([pair_id, p]) => ({
      pair_id,
      before:  p.before!,
      after:   p.after!,
      caption: p.after?.caption ?? p.before?.caption ?? '',
      service: p.after?.service_type ?? p.before?.service_type ?? '',
    }));

  // Add incomplete pairs (where only before or after is present) back to singles
  for (const [, p] of pairMap.entries()) {
    if (!p.before || !p.after) {
      if (p.before) singles.push(p.before);
      if (p.after) singles.push(p.after);
    }
  }

  return { pairs, singles, error: null };
}

// ── Public: fetch all gallery images ─────────────────────────────────

export async function getGalleryImages(): Promise<{
  images: GalleryImage[];
  error:  string | null;
}> {
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .order('uploaded_at', { ascending: false });

  return {
    images: (data as GalleryImage[]) ?? [],
    error:  error?.message ?? null,
  };
}

// ── Admin: upload a gallery image ─────────────────────────────────────

export async function uploadGalleryImage(
  file:         File,
  tag:          GalleryTag,
  serviceType?: string,
  caption?:     string,
  pairId?:      string
): Promise<{ image: GalleryImage | null; error: string | null }> {
  // 1. Upload file to Supabase Storage
  const ext          = file.name.split('.').pop() ?? 'jpg';
  const fileName     = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storagePath  = `gallery/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(storagePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    return { image: null, error: uploadError.message };
  }

  // 2. Get public URL
  const { data: urlData } = supabase.storage
    .from('gallery')
    .getPublicUrl(storagePath);

  const url = urlData.publicUrl;

  // 3. Insert DB record
  const { data, error: dbError } = await supabase
    .from('gallery_images')
    .insert({
      url,
      storage_path: storagePath,
      tag,
      pair_id:      pairId ?? null,
      service_type: serviceType ?? '',
      caption:      caption ?? '',
    })
    .select()
    .single();

  if (dbError) {
    return { image: null, error: dbError.message };
  }

  return { image: data as GalleryImage, error: null };
}

// ── Admin: pair two images (set same pair_id on both) ────────────────

export async function pairGalleryImages(
  beforeId: string,
  afterId:  string
): Promise<{ error: string | null }> {
  const pairId = crypto.randomUUID();

  const { error } = await supabase
    .from('gallery_images')
    .update({ pair_id: pairId })
    .in('id', [beforeId, afterId]);

  return { error: error?.message ?? null };
}

// ── Admin: delete gallery image (storage + DB) ────────────────────────

export async function deleteGalleryImage(
  id:          string,
  storagePath: string
): Promise<{ error: string | null }> {
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('gallery')
    .remove([storagePath]);

  if (storageError) {
    return { error: storageError.message };
  }

  // Delete DB record
  const { error: dbError } = await supabase
    .from('gallery_images')
    .delete()
    .eq('id', id);

  return { error: dbError?.message ?? null };
}
