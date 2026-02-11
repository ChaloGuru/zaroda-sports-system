import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, ChevronLeft, Lock, User, Mail } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { PasswordResetSummary } from '@/components/PasswordResetSummary';
import { toast } from 'sonner';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [resetSummary, setResetSummary] = useState<any>(null);
  
  const { login, resetPassword } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    const result = await login(trimmedUsername, trimmedPassword);
    setIsLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  const handleResetPassword = async () => {
    if (!currentPassword.trim()) {
      toast.error('Please enter the current password');
      return;
    }
    if (!newPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }
    if (!confirmPassword.trim()) {
      toast.error('Please confirm your password');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setResetLoading(true);
    const result = await resetPassword(currentPassword.trim(), newPassword.trim(), confirmPassword.trim());
    setResetLoading(false);

    if (result.success) {
      toast.success('Password updated successfully');
      setResetSummary(result.resetSummary);
      setShowSummary(true);
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(result.error || 'Failed to reset password');
    }
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setResetSummary(null);
    setForgotPasswordOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="bg-card rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl text-foreground">ADMIN LOGIN</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to manage the sports system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="pl-10"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pl-10"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setForgotPasswordOpen(true)}
              className="text-sm text-secondary hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="max-w-md" aria-describedby="reset-desc">
          {!showSummary ? (
            <>
              <DialogHeader>
                <DialogTitle>Reset Admin Password</DialogTitle>
                <p id="reset-desc" className="text-muted-foreground text-sm mt-1">Enter your current password, then set a new password.</p>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Step 1: Verify current credentials */}
                {!resetSummary && !resetLoading && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="verify_username">Current Username</Label>
                      <Input
                        id="verify_username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter current username"
                        autoComplete="username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verify_password">Current Password</Label>
                      <Input
                        id="verify_password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setForgotPasswordOpen(false)}>Cancel</Button>
                      <Button onClick={async () => {
                        setResetLoading(true);
                        const result = await login(username.trim(), password.trim());
                        setResetLoading(false);
                        if (result.success) {
                          setResetSummary({ verified: true });
                          toast.success('Verified! Now enter your email and new password.');
                        } else {
                          toast.error(result.error || 'Invalid credentials');
                        }
                      }} disabled={resetLoading || !username || !password}>
                        {resetLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Verify
                      </Button>
                    </DialogFooter>
                  </>
                )}
                {/* Step 2: Show reset fields if verified */}
                {resetSummary?.verified && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="current_password_reset">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="current_password_reset"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="new_password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min. 6 characters)"
                          className="pl-10"
                        />
                      </div>
                      {newPassword && newPassword.length < 6 && (
                        <p className="text-xs text-red-500">Password must be at least 6 characters</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirm_password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="pl-10"
                        />
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setForgotPasswordOpen(false)}>Cancel</Button>
                      <Button onClick={handleResetPassword} disabled={resetLoading}>
                        {resetLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Reset Password
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Password Reset Complete</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                {resetSummary && (
                  <PasswordResetSummary
                    username={resetSummary.username}
                    resetDate={resetSummary.resetDate}
                    resetTime={resetSummary.resetTime}
                    adminNotified={resetSummary.adminNotified}
                    onClose={handleCloseSummary}
                  />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
