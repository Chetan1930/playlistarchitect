
import { Link } from 'react-router-dom';
import { Skill } from '@/utils/types';

interface SkillCardProps {
  skill: Skill;
}

const SkillCard = ({ skill }: SkillCardProps) => {
  const playlistCount = skill.playlists.length;

  return (
    <Link 
      to={`/skill/${skill.id}`}
      className="group transition-all duration-300 flex flex-col h-full overflow-hidden bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md animate-scale will-change-transform"
    >
      <div className="w-full h-48 overflow-hidden">
        <img 
          src={skill.thumbnailUrl || `https://source.unsplash.com/random/800x600?${encodeURIComponent(skill.name.toLowerCase())}`} 
          alt={skill.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      <div className="flex-1 flex flex-col p-5">
        <div className="flex items-center mb-2">
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
            {playlistCount} {playlistCount === 1 ? 'playlist' : 'playlists'}
          </span>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-black transition-colors">
          {skill.name}
        </h3>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
          {skill.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {new Date(skill.updatedAt).toLocaleDateString()}
          </span>
          
          <span className="inline-flex items-center text-sm text-gray-900 font-medium group-hover:translate-x-0.5 transition-transform duration-300">
            View skill
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              className="w-4 h-4 ml-1 group-hover:ml-2 transition-all duration-300"
            >
              <path 
                fillRule="evenodd" 
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" 
                clipRule="evenodd" 
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SkillCard;
