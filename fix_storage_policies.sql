-- 1. Create the storage bucket for attachments (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Add columns to the messages table (idempotent)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_url text,
ADD COLUMN IF NOT EXISTS attachment_type text,
ADD COLUMN IF NOT EXISTS is_view_once boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_viewed boolean DEFAULT false;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public access to attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete attachments" ON storage.objects;

-- 4. Re-create Storage Policies
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'chat-attachments' );

CREATE POLICY "Public access to attachments"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'chat-attachments' );

CREATE POLICY "Authenticated users can delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'chat-attachments' );
