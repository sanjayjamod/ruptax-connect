-- Create storage bucket for client PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('client-pdfs', 'client-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for client PDFs bucket
CREATE POLICY "Admins can upload PDFs" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'client-pdfs' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view all PDFs" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'client-pdfs' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete PDFs" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'client-pdfs' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Public can view client PDFs" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'client-pdfs');

-- Create table to track client PDFs
CREATE TABLE public.client_pdfs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  financial_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.client_pdfs ENABLE ROW LEVEL SECURITY;

-- Admins can manage all PDFs
CREATE POLICY "Admins can manage client PDFs" 
ON public.client_pdfs 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for faster lookups
CREATE INDEX idx_client_pdfs_client_id ON public.client_pdfs(client_id);
CREATE INDEX idx_client_pdfs_financial_year ON public.client_pdfs(financial_year);