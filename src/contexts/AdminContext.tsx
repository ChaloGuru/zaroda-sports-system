import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sendPasswordResetNotification } from '@/integrations/email/passwordResetNotification';

interface ResetPasswordResult {
  success: boolean;
  error?: string;
  resetSummary?: {
    email: string;
    resetDate: string;
    resetTime: string;
    adminNotified: boolean;
  };
}

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string, newPassword: string, confirmPassword: string) => Promise<ResetPasswordResult>;
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

  const resetPassword = async (
    email: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ResetPasswordResult> => {
    try {
      if (newPassword !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      if (newPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Try to find admin by email first; if not found, fallback to username
      const ident = email.trim();
      let admin: any = null;
      let fetchError: any = null;

      if (ident.includes('@')) {
        const res = await supabase
          .from('admins')
          .select('id, email, username')
          .eq('email', ident)
          .single();
        admin = (res as any).data;
        fetchError = (res as any).error;
      }

      if (!admin) {
        // If user typed an email but the DB stores username only (e.g. 'oduorongo'),
        // try using the part before @ as username. Also try the identifier as-is.
        const possibleUser = ident.includes('@') ? ident.split('@')[0] : ident;
        const res2 = await supabase
          .from('admins')
          .select('id, email, username')
          .or(`username.eq.${possibleUser},username.eq.${ident}`)
          .single();
        admin = (res2 as any).data;
        fetchError = (res2 as any).error;
      }

      if (fetchError || !admin) {
        return { success: false, error: 'No admin account found with that email/username' };
      }

      // Update password
      const { error: updateError } = await supabase
        .from('admins')
        .update({ password_hash: newPassword })
        .eq('id', admin.id);

      if (updateError) {
        return { success: false, error: 'Failed to update password' };
      }

      // Prepare notification details
      const now = new Date();
      const resetDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const resetTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const notifyEmail = admin.email || identifier;

      // Send notification (best-effort)
      try {
        await sendPasswordResetNotification({
          adminEmail: notifyEmail,
          resetDate,
          resetTime,
          ipAddress: 'local',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        });
      } catch (e) {
        console.log('Failed to send password reset notification', e);
      }

      // Log the password reset for admin notification (best-effort)
      try {
        await supabase
          .from('password_reset_logs')
          .insert({
            admin_id: admin.id,
            reset_date: now.toISOString(),
            reset_ip: 'local',
            status: 'completed',
          });
      } catch (e) {
        console.log('Could not log reset to database', e);
      }

      const resetSummary = {
        email: notifyEmail,
        resetDate,
        resetTime,
        adminNotified: !!notifyEmail,
      };

      return { success: true, resetSummary };
    } catch (err) {
      console.error('resetPassword error', err);
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
