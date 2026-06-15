-- Create gallery storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Set up row-level security policies on storage objects
-- Allow public read access to the gallery bucket
CREATE POLICY "Allow public select on gallery bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Allow authenticated admin to insert files into the gallery bucket
CREATE POLICY "Allow admins to insert into gallery bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery' AND (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
);

-- Allow authenticated admin to update files in the gallery bucket
CREATE POLICY "Allow admins to update in gallery bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gallery' AND (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
);

-- Allow authenticated admin to delete files from the gallery bucket
CREATE POLICY "Allow admins to delete from gallery bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery' AND (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
);
