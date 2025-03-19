
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Skill, Playlist } from '@/utils/types';
import PlaylistItem from './PlaylistItem';
import AddPlaylistForm from './AddPlaylistForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PlaylistManagerProps {
  skillId: string;
}

const PlaylistManager = ({ skillId }: PlaylistManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    data: skill, 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['skill', skillId],
    queryFn: () => api.getSkill(skillId),
  });
  
  const handleMovePlaylist = async (playlistId: string, direction: 'up' | 'down') => {
    if (!skill) return;
    
    const { playlists } = skill;
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);
    
    if (playlistIndex === -1) return;
    
    const newPosition = direction === 'up' 
      ? Math.max(0, playlistIndex - 1)
      : Math.min(playlists.length - 1, playlistIndex + 1);
    
    if (newPosition === playlistIndex) return;
    
    const success = await api.updatePlaylistPosition(
      skillId,
      playlistId,
      newPosition
    );
    
    if (success) {
      refetch();
    }
  };
  
  const handleDeletePlaylist = async (playlistId: string) => {
    const success = await api.deletePlaylist(skillId, playlistId);
    
    if (success) {
      refetch();
    }
  };
  
  const handlePlaylistAdded = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['skills'] });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-100 rounded-lg" />
        <div className="h-60 bg-gray-100 rounded-lg" />
        <div className="h-16 bg-gray-100 rounded-lg" />
      </div>
    );
  }
  
  if (isError || !skill) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading skill</h3>
        <p className="text-gray-500 mb-6">
          Unable to load the skill details. Please try again later.
        </p>
        <Link to="/">
          <Button>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to skills
          </Link>
          <h2 className="text-2xl font-medium text-gray-900">{skill.name}</h2>
          <p className="text-gray-500">{skill.description}</p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
        <AddPlaylistForm 
          skillId={skillId} 
          onSuccess={handlePlaylistAdded}
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium mb-4">Learning Path</h3>
        
        {skill.playlists.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <h4 className="text-lg font-medium text-gray-900 mb-2">No playlists yet</h4>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              Start building your learning path by adding your first playlist above
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {skill.playlists
              .sort((a, b) => a.position - b.position)
              .map((playlist, index) => (
                <PlaylistItem
                  key={playlist.id}
                  playlist={playlist}
                  skillId={skillId}
                  isFirst={index === 0}
                  isLast={index === skill.playlists.length - 1}
                  onMove={handleMovePlaylist}
                  onDelete={handleDeletePlaylist}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistManager;
