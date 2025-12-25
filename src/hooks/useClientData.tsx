import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// Client data interface matching Supabase schema
export interface ClientData {
  id: string;
  user_id: string | null;
  name: string;
  mobile: string | null;
  email: string | null;
  pan_number: string | null;
  aadhar_number: string | null;
  address: string | null;
  school_name: string | null;
  pay_school: string | null;
  designation: string | null;
  bank_name: string | null;
  bank_account: string | null;
  ifsc_code: string | null;
  annual_income: number | null;
  form_status: string | null;
  notes: string | null;
  head_master: string | null;
  head_master_father: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ClientUpdateData {
  name?: string;
  mobile?: string;
  email?: string;
  pan_number?: string;
  aadhar_number?: string;
  address?: string;
  school_name?: string;
  pay_school?: string;
  designation?: string;
  bank_name?: string;
  bank_account?: string;
  ifsc_code?: string;
  annual_income?: number;
  form_status?: string;
  notes?: string;
  head_master?: string;
  head_master_father?: string;
}

export function useClientData() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user's client data
  const fetchClientData = useCallback(async () => {
    if (!user) {
      setClientData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching client data:', fetchError);
        setError(fetchError.message);
        return;
      }

      setClientData(data);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to fetch client data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update client data
  const updateClientData = useCallback(async (updates: ClientUpdateData) => {
    if (!user || !clientData) {
      return { success: false, error: 'No client data to update' };
    }

    try {
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating client data:', updateError);
        return { success: false, error: updateError.message };
      }

      // Refresh client data
      await fetchClientData();
      return { success: true };
    } catch (err) {
      console.error('Unexpected error updating:', err);
      return { success: false, error: 'Failed to update client data' };
    }
  }, [user, clientData, fetchClientData]);

  // Create client record for new user
  const createClientRecord = useCallback(async (initialData: Partial<ClientData>) => {
    if (!user) {
      return { success: false, error: 'No authenticated user' };
    }

    try {
      // Generate client ID (year + sequential)
      const year = new Date().getFullYear();
      const clientId = `${year}${Math.random().toString().slice(2, 6)}`;

      const { error: insertError } = await supabase
        .from('clients')
        .insert({
          id: clientId,
          user_id: user.id,
          name: initialData.name || user.user_metadata?.full_name || '',
          mobile: initialData.mobile || '',
          email: initialData.email || user.email || '',
          form_status: 'pending',
          ...initialData,
        });

      if (insertError) {
        console.error('Error creating client record:', insertError);
        return { success: false, error: insertError.message };
      }

      await fetchClientData();
      return { success: true };
    } catch (err) {
      console.error('Unexpected error creating:', err);
      return { success: false, error: 'Failed to create client record' };
    }
  }, [user, fetchClientData]);

  // Reset password via Supabase Auth
  const resetPassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Password reset error:', err);
      return { success: false, error: 'Failed to reset password' };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setClientData(null);
  }, []);

  // Fetch data when user changes
  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      fetchClientData();
    } else if (!user) {
      setClientData(null);
      setIsLoading(false);
    }
  }, [user, authLoading, isAdmin, fetchClientData]);

  return {
    clientData,
    isLoading: isLoading || authLoading,
    error,
    updateClientData,
    createClientRecord,
    resetPassword,
    logout,
    refetch: fetchClientData,
  };
}
