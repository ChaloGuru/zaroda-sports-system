import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('zaroda_admin');
    if (stored === 'true') {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid credentials' };
      }

      setIsAdmin(true);
      sessionStorage.setItem('zaroda_admin', 'true');
      return { success: true };
    } catch {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('zaroda_admin');
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verify the email belongs to an admin
      const { data: admin, error: fetchError } = await supabase
        .from('admins')
        .select('id')
        .eq('email', email)
        .single();

      if (fetchError || !admin) {
        return { success: false, error: 'No admin account found with that email' };
      }

      // Update password
      const { error: updateError } = await supabase
        .from('admins')
        .update({ password_hash: newPassword })
        .eq('id', admin.id);

      if (updateError) {
        return { success: false, error: 'Failed to update password' };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Password reset failed' };
    }
  };

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading, login, logout, resetPassword }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
