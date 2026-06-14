-- Create gallery_images table using gen_random_uuid()
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  url          text         NOT null,
  storage_path text         NOT null,
  tag          text         NOT null CHECK (tag IN ('before', 'after')),
  pair_id      uuid,
  service_type text,
  caption      text,
  uploaded_at  timestamptz  NOT null DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "gallery_images: public read"
  ON public.gallery_images FOR SELECT
  USING (true);

CREATE POLICY "gallery_images: admin all"
  ON public.gallery_images FOR ALL
  USING (exists (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));
