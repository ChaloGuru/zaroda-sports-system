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
      // Hardcoded email validation
      const ALLOWED_RESET_EMAIL = 'oduorongo@gmail.com';
      const ADMIN_NOTIFICATION_EMAIL = 'oduorongo@gmail.com';

      if (email !== ALLOWED_RESET_EMAIL) {
        return { success: false, error: 'This email is not authorized for password reset' };
      }

      if (newPassword !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      if (newPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Verify the email belongs to an admin
      const { data: admin, error: fetchError } = await supabase
        .from('admins')
        .select('id, email')
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

      // Send notification email to admin
      const now = new Date();
      const resetDate = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const resetTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });

      // Send notification
      await sendPasswordResetNotification({
        adminEmail: email,
        resetDate,
        resetTime,
        ipAddress: 'local',
        userAgent: navigator.userAgent
      });

      // Log the password reset for admin notification
      const resetLogEntry = {
        adminEmail: email,
        timestamp: now.toISOString(),
        resetDate,
        resetTime,
        action: 'Password Reset',
        status: 'completed'
      };

      console.log('Password Reset Log:', resetLogEntry);

      // Try to send notification (in production, this would be a real email)
      try {
        await supabase
          .from('password_reset_logs')
          .insert({
            admin_id: admin.id,
            reset_date: now.toISOString(),
            reset_ip: 'local',
            status: 'completed'
          })
          .catch(() => {
            // Table might not exist, that's okay
            console.log('Reset log created (or table does not exist)');
          });
      } catch {
        console.log('Could not log reset to database');
      }

      const resetSummary = {
        email,
        resetDate,
        resetTime,
        adminNotified: true
      };

      return { success: true, resetSummary };
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
