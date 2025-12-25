-- Make storage buckets private to prevent unauthorized access
UPDATE storage.buckets 
SET public = false 
WHERE id IN ('client-pdfs', 'form-templates');