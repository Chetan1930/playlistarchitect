import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Skill, Playlist } from '@/utils/types';
import PlaylistItem from './PlaylistItem';
import AddPlaylistForm from './AddPlaylistForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import InviteDialog from './InviteDialog';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface PlaylistManagerProps {
  skillId: string;
}

const PlaylistManager = ({ skillId }: PlaylistManagerProps) => {
  const queryClient = useQueryClient();
  
  const { data: skill, isLoading, isError, refetch } = useQuery({
    queryKey: ['skill', skillId],
    queryFn: () => api.getSkill(skillId),
  });
  
  const handleMovePlaylist = async (playlistId: string, direction: 'up' | 'down') => {
    if (!skill) return;
    const { playlists } = skill;
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);
    if (playlistIndex === -1) return;
    const newPosition = direction === 'up' ? Math.max(0, playlistIndex - 1) : Math.min(playlists.length - 1, playlistIndex + 1);
    if (newPosition === playlistIndex) return;
    const success = await api.updatePlaylistPosition(skillId, playlistId, newPosition);
    if (success) { refetch(); toast.success("Playlist order updated"); }
    else toast.error("Failed to update playlist order");
  };
  
  const handleDragEnd = async (result: DropResult) => {
    if (!skill || !result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;
    const playlistId = skill.playlists[source.index].id;
    const success = await api.updatePlaylistPosition(skillId, playlistId, destination.index);
    if (success) { refetch(); toast.success("Playlist order updated"); }
    else toast.error("Failed to update playlist order");
  };
  
  const handleDeletePlaylist = async (playlistId: string) => {
    const success = await api.deletePlaylist(skillId, playlistId);
    if (success) { refetch(); toast.success("Playlist removed"); }
    else toast.error("Failed to remove playlist");
  };
  
  const handleUpdatePlaylistTitle = async (playlistId: string, newTitle: string) => {
    const success = await api.updatePlaylistTitle(skillId, playlistId, newTitle);
    if (success) { refetch(); toast.success("Playlist title updated"); }
    else toast.error("Failed to update playlist title");
  };
  
  const handlePlaylistAdded = () => { refetch(); queryClient.invalidateQueries({ queryKey: ['skills'] }); };
  const handlePlaylistUpdated = () => { refetch(); queryClient.invalidateQueries({ queryKey: ['skills'] }); };
  
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-muted rounded-lg" />
        <div className="h-60 bg-muted rounded-lg" />
        <div className="h-16 bg-muted rounded-lg" />
      </div>
    );
  }
  
  if (isError || !skill) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-foreground mb-2">Error loading skill</h3>
        <p className="text-muted-foreground mb-6">Unable to load the skill details. Please try again later.</p>
        <Link to="/"><Button>Back to Dashboard</Button></Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to skills
          </Link>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{skill.name}</h2>
          <p className="text-muted-foreground text-sm">{skill.description}</p>
        </div>
        <InviteDialog skillId={skillId} skillName={skill.name} />
      </div>
      
      <div className="bg-accent/50 rounded-2xl p-4 sm:p-6 border border-border">
        <AddPlaylistForm skillId={skillId} onSuccess={handlePlaylistAdded} />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground mb-4">Learning Path</h3>
        
        {skill.playlists.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-accent/30">
            <h4 className="text-lg font-semibold text-foreground mb-2">No playlists yet</h4>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              Start building your learning path by adding your first playlist above
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="playlists">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {skill.playlists.sort((a, b) => a.position - b.position).map((playlist, index) => (
                    <Draggable key={playlist.id} draggableId={playlist.id} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className={`transition-all duration-150 ${snapshot.isDragging ? 'shadow-lg scale-[1.02]' : ''}`}>
                          <PlaylistItem
                            playlist={playlist} skillId={skillId} isFirst={index === 0} isLast={index === skill.playlists.length - 1}
                            onMove={handleMovePlaylist} onDelete={handleDeletePlaylist} onUpdate={handlePlaylistUpdated}
                            onUpdateTitle={handleUpdatePlaylistTitle} dragHandleProps={provided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default PlaylistManager;
