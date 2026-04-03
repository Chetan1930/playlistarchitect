
import { useParams, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import PlaylistManager from '@/components/PlaylistManager';

const SkillDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute top-20 right-[5%] w-64 h-64 rounded-full bg-primary/5 animate-pulse-subtle" />
      <div className="absolute top-40 left-[10%] w-32 h-32 rounded-full bg-accent animate-float" />
      <div className="absolute bottom-20 right-[15%] w-48 h-48 rounded-full bg-primary/5 animate-pulse-subtle" />
      
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 pt-20 pb-16 relative z-10">
        <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-border animate-fade-in">
          <PlaylistManager skillId={id} />
        </div>
      </main>
    </div>
  );
};

export default SkillDetail;
