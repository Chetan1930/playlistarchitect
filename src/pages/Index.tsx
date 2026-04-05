import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import SkillsList from '@/components/SkillsList';
import SkillCard from '@/components/SkillCard';
import { api } from '@/utils/api';
import { invitationApi } from '@/utils/invitationApi';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  
  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['skills', user?.id],
    queryFn: api.getSkills,
    enabled: !!user,
  });

  const { data: sharedSkills = [] } = useQuery({
    queryKey: ['shared-skills', user?.id],
    queryFn: invitationApi.getSharedSkills,
    enabled: !!user,
  });

  const hasSkills = skills.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16 flex-1">
        {!authLoading && !user && (
          <section className="mb-16 mt-4">
            <div className="max-w-3xl mx-auto text-center py-12 sm:py-20 px-2">
              <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4" />
                Organize your learning journey
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight animate-slide-in tracking-tight">
                Track courses, playlists & resources in one place
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-xl mx-auto animate-fade-in leading-relaxed">
                Create personalized learning paths by organizing your favorite courses and playlists. Sign in to sync your progress across devices.
              </p>
              <Link to="/auth">
                <Button className="px-8 py-6 h-auto bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-primary-foreground rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in w-full sm:w-auto">
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {user && !hasSkills && !isLoading && (
          <section className="mb-12 mt-4">
            <div className="max-w-3xl mx-auto text-center py-10 px-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                Welcome to SkillUp
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-8">
                Start by creating your first skill category to organize your learning resources.
              </p>
            </div>
          </section>
        )}
        
        {user && <SkillsList />}
        
        {user && sharedSkills.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Shared with you</h2>
              <Badge variant="secondary" className="text-sm px-2.5 py-0.5">{sharedSkills.length}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {sharedSkills.map((skill: any) => (
                <div key={skill.id} className="relative">
                  <Badge className="absolute top-3 left-3 z-20 bg-primary text-primary-foreground shadow-sm">Shared</Badge>
                  <SkillCard skill={skill} onUpdate={() => {}} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      
      <footer className="py-8 bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SkillUp. Created by Chetan Chauhan.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2 sm:p-0">Privacy</a>
              <a href="https://www.linkedin.com/in/chetan71/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2 sm:p-0">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;