-- Create storage bucket for form templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('form-templates', 'form-templates', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for form-templates bucket
CREATE POLICY "Admins can upload templates"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'form-templates' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update templates"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'form-templates' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete templates"
ON storage.objects
FOR DELETE
USING (bucket_id = 'form-templates' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view templates"
ON storage.objects
FOR SELECT
USING (bucket_id = 'form-templates');

-- Create table to track form templates
CREATE TABLE public.form_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(form_type, is_active) -- Only one active template per form type
);

-- Enable RLS
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage templates"
ON public.form_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active templates"
ON public.form_templates
FOR SELECT
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_form_templates_updated_at
BEFORE UPDATE ON public.form_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();