
import { useParams, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import PlaylistManager from '@/components/PlaylistManager';

const SkillDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute top-20 right-[5%] w-64 h-64 rounded-full bg-purple-100 opacity-60 animate-pulse-subtle"></div>
      <div className="absolute top-40 left-[10%] w-32 h-32 rounded-full bg-blue-100 opacity-60 animate-float"></div>
      <div className="absolute bottom-20 right-[15%] w-48 h-48 rounded-full bg-pink-100 opacity-60 animate-pulse-subtle"></div>
      
      <Header />
      
      <main className="container mx-auto px-6 pt-24 pb-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 animate-fade-in">
          <PlaylistManager skillId={id} />
        </div>
      </main>
    </div>
  );
};

export default SkillDetail;
