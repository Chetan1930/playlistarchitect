import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) { toast.error(validation.error.errors[0].message); return; }
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) toast.error(error.message.includes('Invalid login') ? 'Invalid email or password' : error.message);
        else toast.success('Welcome back!');
      } else {
        const { error } = await signUp(email, password);
        if (error) toast.error(error.message.includes('already registered') ? 'This email is already registered.' : error.message);
        else toast.success('Account created successfully!');
      }
    } catch { toast.error('An unexpected error occurred'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      {/* Background decoration */}
      <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-primary/5 animate-pulse-subtle" />
      <div className="absolute bottom-20 left-[10%] w-48 h-48 rounded-full bg-accent animate-float" />
      
      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to home
        </Link>
        <div className="bg-card rounded-2xl shadow-xl p-6 sm:p-8 border border-border">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <rect x="7" y="7" width="10" height="10" rx="2" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
            <p className="text-muted-foreground mt-2">{isLogin ? 'Sign in to sync your learning progress' : 'Start organizing your learning journey'}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-11" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-11" required />
            </div>
            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-primary-foreground font-medium" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
