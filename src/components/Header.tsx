import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { LogOut, User, Sun, Moon, Menu, BookmarkIcon } from 'lucide-react';
import InvitationBell from './InvitationBell';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

/**
 * Youdemy-inspired minimal header:
 * - Warm amber "§" mark + italic serif wordmark on left
 * - Text-only nav (SkillUp / LinkVault) with amber underline for active route
 * - Theme + notifications + auth actions on the right
 */
const Header = () => {
  const { user, signOut, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (active: boolean) =>
    cn(
      'relative text-sm transition-colors px-1 py-1',
      active ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
      active &&
        "after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px after:bg-primary"
    );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          onClick={() => setMobileOpen(false)}
        >
          <span className="font-display italic text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors">
            SkillUp
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={navLinkClass(isActive('/'))}>
            Library
          </Link>
          <Link to="/links" className={navLinkClass(isActive('/links'))}>
            LinkVault
          </Link>

          <div className="h-4 w-px bg-border mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
          {!loading && user && <InvitationBell />}

          {!loading &&
            (user ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[160px] truncate">{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button
                  size="sm"
                  className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-4"
                >
                  Sign in
                </Button>
              </Link>
            ))}
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-10 h-10 text-muted-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
          {!loading && user && <InvitationBell />}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" aria-label="Menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-80 p-0 border-l border-border bg-background">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <span className="font-display italic text-xl text-foreground">SkillUp</span>
                  </div>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 rounded-lg text-base transition-colors',
                      isActive('/') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
                    )}
                  >
                    Library
                  </Link>
                  <Link
                    to="/links"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 rounded-lg text-base transition-colors',
                      isActive('/links') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
                    )}
                  >
                    <BookmarkIcon className="w-5 h-5" /> LinkVault
                  </Link>
                </nav>
                <div className="p-6 border-t border-border space-y-4">
                  {!loading &&
                    (user ? (
                      <>
                        <div className="flex items-center gap-3 px-4 py-3 bg-accent rounded-lg">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate text-foreground">{user.email}</span>
                        </div>
                        <Button variant="outline" className="w-full justify-start gap-2 h-11" onClick={handleSignOut}>
                          <LogOut className="w-4 h-4" /> Sign out
                        </Button>
                      </>
                    ) : (
                      <Link to="/auth" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">
                          Sign in
                        </Button>
                      </Link>
                    ))}
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
