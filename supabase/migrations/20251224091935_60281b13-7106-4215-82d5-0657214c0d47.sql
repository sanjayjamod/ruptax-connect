-- Add headMaster and headMasterFather columns to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS head_master TEXT,
ADD COLUMN IF NOT EXISTS head_master_father TEXT;