
import { useParams, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import PlaylistManager from '@/components/PlaylistManager';

const SkillDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 pt-24 pb-16">
        <PlaylistManager skillId={id} />
      </main>
    </div>
  );
};

export default SkillDetail;
