-- Yenni Crochet — allow custom request reference image uploads
-- Run in Supabase Dashboard -> SQL Editor.
--
-- Bucket name is case-sensitive. This project currently uses the public
-- Storage bucket named "Products".
--
-- The app uploads custom request images to:
-- Products/custom-requests/<random-file-name>
--
-- Public bucket lets users read public URLs, but uploads still need an
-- insert policy on storage.objects.

drop policy if exists "custom_requests_reference_images_upload" on storage.objects;
create policy "custom_requests_reference_images_upload"
  on storage.objects for insert
  to anon
  with check (
    bucket_id = 'Products'
    and name like 'custom-requests/%'
  );
