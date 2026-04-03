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
      
      <main className="container mx-auto px-4 sm:px-6 pt-20 pb-16 flex-1">
        {!authLoading && !user && (
          <section className="mb-16">
            <div className="max-w-3xl mx-auto text-center py-16 sm:py-20">
              <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4" />
                Organize your learning journey
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 leading-tight animate-slide-in">
                Track courses, playlists & resources in one place
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto animate-fade-in">
                Create personalized learning paths by organizing your favorite courses and playlists. Sign in to sync your progress across devices.
              </p>
              <Link to="/auth">
                <Button className="px-8 py-3 h-auto bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-primary-foreground rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {user && !hasSkills && !isLoading && (
          <section className="mb-16">
            <div className="max-w-3xl mx-auto text-center py-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                Welcome to CourseTrack
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Start by creating your first skill category to organize your learning resources.
              </p>
            </div>
          </section>
        )}
        
        {user && <SkillsList />}
        
        {user && sharedSkills.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-semibold text-foreground">Shared with you</h2>
              <Badge variant="secondary">{sharedSkills.length}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sharedSkills.map((skill: any) => (
                <div key={skill.id} className="relative">
                  <Badge className="absolute top-2 left-2 z-20 bg-primary text-primary-foreground">Shared</Badge>
                  <SkillCard skill={skill} onUpdate={() => {}} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      
      <footer className="py-6 bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CourseTrack. Created by Chetan Chauhan.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="https://www.linkedin.com/in/chetan71/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
