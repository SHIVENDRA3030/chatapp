-- 1. Create the storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Add columns to the messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_url text,
ADD COLUMN IF NOT EXISTS attachment_type text,
ADD COLUMN IF NOT EXISTS is_view_once boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_viewed boolean DEFAULT false;

-- 3. Set up Storage Policies (RLS)

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'chat-attachments' );

-- Allow public access to view files (so they can be loaded in the chat)
CREATE POLICY "Public access to attachments"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'chat-attachments' );

-- Allow authenticated users to delete files (needed for View Once)
CREATE POLICY "Authenticated users can delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'chat-attachments' );
