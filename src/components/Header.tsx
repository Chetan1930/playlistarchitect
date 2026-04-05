import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { LogOut, User, Sun, Moon, Menu, X, BookmarkIcon } from 'lucide-react';
import InvitationBell from './InvitationBell';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const { user, signOut, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
              <path d="M5 3a2 2 0 0 0-2 2" /><path d="M19 3a2 2 0 0 1 2 2" /><path d="M21 19a2 2 0 0 1-2 2" /><path d="M5 21a2 2 0 0 1-2-2" />
              <path d="M9 3h1" /><path d="M9 21h1" /><path d="M14 3h1" /><path d="M14 21h1" />
              <path d="M3 9v1" /><path d="M21 9v1" /><path d="M3 14v1" /><path d="M21 14v1" />
              <rect x="7" y="7" width="10" height="10" rx="2" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            CourseTrack
          </h1>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent">
            Dashboard
          </Link>
          <div className="h-5 w-px bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
          {!loading && user && <InvitationBell />}
          {!loading && (
            user ? (
              <div className="flex items-center gap-2 ml-1">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-accent rounded-full px-3 py-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[130px] truncate text-xs">{user.email}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-primary-foreground rounded-full px-5">
                  Sign in
                </Button>
              </Link>
            )
          )}
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
          {!loading && user && <InvitationBell />}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <rect x="7" y="7" width="10" height="10" rx="2" />
                      </svg>
                    </div>
                    <span className="font-semibold text-foreground">CourseTrack</span>
                  </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-colors">
                    Dashboard
                  </Link>
                </nav>
                <div className="p-4 border-t border-border space-y-3">
                  {!loading && (
                    user ? (
                      <>
                        <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-xl">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate text-foreground">{user.email}</span>
                        </div>
                        <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
                          <LogOut className="w-4 h-4" /> Sign out
                        </Button>
                      </>
                    ) : (
                      <Link to="/auth" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-primary to-purple-600 text-primary-foreground">
                          Sign in
                        </Button>
                      </Link>
                    )
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
