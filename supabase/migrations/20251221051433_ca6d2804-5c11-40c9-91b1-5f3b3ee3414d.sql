
-- Create tax_forms table for storing submitted tax form data
CREATE TABLE public.tax_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  financial_year TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(client_id, financial_year)
);

-- Create sample_templates table for storing reusable form templates
CREATE TABLE public.sample_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.tax_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for tax_forms (admin only)
CREATE POLICY "Admins can view all tax forms" 
ON public.tax_forms 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create tax forms" 
ON public.tax_forms 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tax forms" 
ON public.tax_forms 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tax forms" 
ON public.tax_forms 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for sample_templates (admin only)
CREATE POLICY "Admins can view all templates" 
ON public.sample_templates 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create templates" 
ON public.sample_templates 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update templates" 
ON public.sample_templates 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete templates" 
ON public.sample_templates 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_tax_forms_updated_at
BEFORE UPDATE ON public.tax_forms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sample_templates_updated_at
BEFORE UPDATE ON public.sample_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
