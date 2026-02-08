import { Link, useLocation } from 'react-router-dom';
import { Dribbble, Music, Users, Target, Shield, Menu, X, BarChart3, FileText, Share2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const navItems = [
  { path: '/category/ball_games', label: 'Ball Games', icon: Dribbble },
  { path: '/category/athletics', label: 'Athletics', icon: Users },
  { path: '/category/music', label: 'Music', icon: Music },
  { path: '/category/other', label: 'Other Games', icon: Target },
  { path: '/rankings', label: 'Rankings', icon: BarChart3 },
  { path: '/qualified-teams', label: 'Qualified', icon: CheckCircle2 },
  { path: '/circulars', label: 'Circulars', icon: FileText },
];

const handleShare = async () => {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Zaroda Sports', url });
    } catch {}
  } else {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  }
};

export const Navbar = () => {
  const location = useLocation();
  const { isAdmin, logout } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-primary font-display text-xl">Z</span>
            </div>
            <span className="text-primary-foreground font-display text-2xl tracking-wider hidden sm:inline">
              ZARODA SPORTS
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary/80">
              <Share2 className="w-4 h-4 mr-1" />Share
            </Button>
            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/90 transition-all"
                >
                  <Shield className="w-4 h-4" />Dashboard
                </Link>
                <Button variant="outline" size="sm" onClick={logout} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Logout
                </Button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-3 py-2 border border-primary-foreground/30 text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary-foreground/10 transition-all"
              >
                <Shield className="w-4 h-4" />Admin
              </Link>
            )}
          </div>

          <button className="lg:hidden text-primary-foreground p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-primary-foreground/20 animate-fade-in">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive ? 'bg-secondary text-secondary-foreground' : 'text-primary-foreground/80 hover:text-primary-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />{item.label}
                </Link>
              );
            })}
            <button
              onClick={() => { handleShare(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 text-primary-foreground/80 hover:text-primary-foreground rounded-lg font-medium w-full"
            >
              <Share2 className="w-5 h-5" />Share
            </button>
            <div className="mt-4 pt-4 border-t border-primary-foreground/20">
              {isAdmin ? (
                <div className="flex flex-col gap-2">
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium">
                    <Shield className="w-5 h-5" />Dashboard
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-primary-foreground/80 hover:text-primary-foreground rounded-lg font-medium">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-primary-foreground/80 hover:text-primary-foreground rounded-lg font-medium">
                  <Shield className="w-5 h-5" />Admin Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
