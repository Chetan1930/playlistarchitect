import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import SkillsList from '@/components/SkillsList';
import { api } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  
  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['skills', user?.id],
    queryFn: api.getSkills,
    enabled: !!user,
  });

  const hasSkills = skills.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 pt-24 pb-16">
        {!authLoading && !user && (
          <section className="mb-16">
            <div className="max-w-3xl mx-auto text-center py-12">
              <h1 className="text-4xl font-medium text-gray-900 mb-4 leading-tight">
                Organize your learning journey
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Create personalized learning paths by organizing your favorite courses and playlists. Sign in to sync your progress across devices.
              </p>
              <Link to="/auth">
                <Button className="px-8 py-3 h-auto bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </section>
        )}

        {user && !hasSkills && !isLoading && (
          <section className="mb-16">
            <div className="max-w-3xl mx-auto text-center py-12">
              <h1 className="text-4xl font-medium text-gray-900 mb-4 leading-tight">
                Welcome to CourseTrack
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Start by creating your first skill category to organize your learning resources.
              </p>
            </div>
          </section>
        )}
        
        {user && <SkillsList />}
      </main>
      
      <footer className="mt-auto py-8 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} CourseTrack. Created by Chetan Chauhan.
              </p>
            </div>
            
            <div className="flex space-x-6">
              <a 
                href="#" 
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Privacy
              </a>
              <a 
                href="https://www.linkedin.com/in/chetan71/" target='_blank' 
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
