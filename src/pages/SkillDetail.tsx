import { useParams, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import PlaylistManager from '@/components/PlaylistManager';

/**
 * Skill (course) detail — thin page wrapper that renders the header plus
 * the two-column PlaylistManager layout. The warm amber glow lives on the
 * page background so the course card sits cleanly on top.
 */
const SkillDetail = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div aria-hidden className="absolute inset-x-0 top-0 h-[380px] amber-glow pointer-events-none" />
      <Header />

      <main className="relative max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        <PlaylistManager skillId={id} />
      </main>
    </div>
  );
};

export default SkillDetail;
