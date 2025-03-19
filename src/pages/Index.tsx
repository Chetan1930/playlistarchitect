
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import SkillsList from '@/components/SkillsList';
import { api } from '@/utils/api';

const Index = () => {
  const { data: skills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: api.getSkills,
  });

  const hasSkills = skills.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 pt-24 pb-16">
        {!hasSkills && (
          <section className="mb-16">
            <div className="max-w-3xl mx-auto text-center py-12">
              <h1 className="text-4xl font-medium text-gray-900 mb-4 leading-tight">
                Organize your learning journey
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Create personalized learning paths by organizing your favorite courses and playlists
              </p>
              <div className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-800">
                Get Started
              </div>
            </div>
          </section>
        )}
        
        <SkillsList />
      </main>
      
      <footer className="mt-auto py-8 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} CourseTrack. Created by Chetan Chauhan. All rights reserved.
              </p>
            </div>
            
            <div className="flex space-x-6">
              <a 
                href="#" 
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Terms
              </a>
              <a 
                href="#" 
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Privacy
              </a>
              <a 
                href="#" 
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
