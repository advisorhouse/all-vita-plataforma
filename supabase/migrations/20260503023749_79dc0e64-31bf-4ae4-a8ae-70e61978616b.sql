-- Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-clips', 'voice-clips', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for public reading
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Public Access Voice Clips'
    ) THEN
        CREATE POLICY "Public Access Voice Clips" 
        ON storage.objects FOR SELECT 
        USING (bucket_id = 'voice-clips');
    END IF;
END $$;

-- Policies for internal uploading (service role)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Internal Upload Voice Clips'
    ) THEN
        CREATE POLICY "Internal Upload Voice Clips" 
        ON storage.objects FOR INSERT 
        WITH CHECK (bucket_id = 'voice-clips');
    END IF;
END $$;