import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import bcrypt from 'bcryptjs';
import { supabase } from '@/integrations/supabase/client';
import { sendPasswordResetNotification } from '@/integrations/email/passwordResetNotification';

interface ResetPasswordResult {
  success: boolean;
  error?: string;
  resetSummary?: {
    username: string;
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
  resetPassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<ResetPasswordResult>;
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
      const { data: admin, error } = await supabase
        .from('admins')
        .select('id, username, password_hash, email')
        .eq('username', username)
        .single();

      if (error || !admin) {
        return { success: false, error: 'Invalid credentials' };
      }

      const storedHash: string = admin.password_hash || '';

      // Detect whether stored value is a bcrypt hash (starts with $2a$ or $2b$ or $2y$)
      const isBcrypt = storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$');

      let passwordMatches = false;

      if (isBcrypt) {
        passwordMatches = await bcrypt.compare(password, storedHash);
      } else {
        // Fallback for legacy plain-text passwords: compare directly
        passwordMatches = password === storedHash;
        // If it matches, migrate the password to a bcrypt hash
        if (passwordMatches) {
          try {
            const newHash = await bcrypt.hash(password, 10);
            await supabase.from('admins').update({ password_hash: newHash }).eq('id', admin.id);
          } catch (e) {
            console.warn('Failed to migrate plain-text password to bcrypt hash', e);
          }
        }
      }

      if (!passwordMatches) {
        return { success: false, error: 'Invalid credentials' };
      }

      setIsAdmin(true);
      sessionStorage.setItem('zaroda_admin', 'true');
      // store username for future operations like password reset
      sessionStorage.setItem('zaroda_admin_username', admin.username);
      return { success: true };
    } catch {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('zaroda_admin');
    sessionStorage.removeItem('zaroda_admin_username');
  };

  const resetPassword = async (
    currentPassword: string,
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

      // Determine current admin by stored username
      const storedUsername = sessionStorage.getItem('zaroda_admin_username');
      if (!storedUsername) {
        return { success: false, error: 'Not authenticated as admin' };
      }

      const { data: admin, error: fetchError } = await supabase
        .from('admins')
        .select('id, email, username, password_hash')
        .eq('username', storedUsername)
        .single();

      if (fetchError || !admin) {
        return { success: false, error: 'Admin account not found' };
      }

      const storedHash: string = admin.password_hash || '';
      const isBcrypt = storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$');

      let currentMatches = false;
      if (isBcrypt) {
        currentMatches = await bcrypt.compare(currentPassword, storedHash);
      } else {
        currentMatches = currentPassword === storedHash;
      }

      if (!currentMatches) {
        return { success: false, error: 'Invalid current password' };
      }

      // Hash new password before saving
      const newHash = await bcrypt.hash(newPassword, 10);
      const { error: updateError } = await supabase.from('admins').update({ password_hash: newHash }).eq('id', admin.id);

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

      const notifyUsername = admin.username || 'admin';

      // Send notification (best-effort)
      try {
        await sendPasswordResetNotification({
          adminEmail: notifyUsername,
          resetDate,
          resetTime,
          ipAddress: 'local',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        });
      } catch (e) {
        console.log('Failed to send password reset notification', e);
      }

      const resetSummary = {
        username: notifyUsername,
        resetDate,
        resetTime,
        adminNotified: true,
      };

      // Invalidate current session so admin must sign in with the new password
      logout();

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
