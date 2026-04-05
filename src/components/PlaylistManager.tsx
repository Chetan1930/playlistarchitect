import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Skill, Playlist } from '@/utils/types';
import { useAuth } from '@/hooks/useAuth';
import PlaylistItem from './PlaylistItem';
import AddPlaylistForm from './AddPlaylistForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import InviteDialog from './InviteDialog';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { supabase } from '@/integrations/supabase/client';

interface PlaylistManagerProps {
  skillId: string;
}

const PlaylistManager = ({ skillId }: PlaylistManagerProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Start as false to prevent flashing editor tools to unauthorized users
  const [canEdit, setCanEdit] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  
  const { data: skill, isLoading, isError, refetch } = useQuery({
    queryKey: ['skill', skillId],
    queryFn: () => api.getSkill(skillId),
  });

  // Check if user owns this skill or has write access
  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !skill) {
        if (skill) setAccessChecked(true);
        return;
      }
      
      // If user owns the skill, they can edit
      const { data: ownsSkill } = await (supabase as any).rpc('user_owns_skill', { _user_id: user.id, _skill_id: skillId });
      if (ownsSkill) { 
        setCanEdit(true); 
        setAccessChecked(true);
        return; 
      }
      
      // Check share access level
      const { data: hasWrite } = await (supabase as any).rpc('user_has_skill_share_write', { _user_id: user.id, _skill_id: skillId });
      setCanEdit(!!hasWrite);
      setAccessChecked(true);
    };
    
    if (skill) {
      checkAccess();
    }
  }, [user, skill, skillId]);
  
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
  
  // Show loading skeleton if the skill is loading OR if we're still checking permissions
  if (isLoading || (skill && !accessChecked)) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-60 bg-muted rounded-xl" />
        <div className="h-16 bg-muted rounded-xl" />
      </div>
    );
  }
  
  if (isError || !skill) {
    return (
      <div className="text-center py-16 px-4">
        <h3 className="text-xl font-semibold text-foreground mb-3">Error loading skill</h3>
        <p className="text-muted-foreground mb-8">Unable to load the skill details. Please try again later.</p>
        <Link to="/"><Button className="rounded-full px-6 py-5 h-auto text-base">Back to SkillUp</Button></Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div className="w-full sm:w-auto">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-3 transition-colors py-2 sm:py-0">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to skills
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{skill.name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <p className="text-muted-foreground text-sm sm:text-base">{skill.description}</p>
            {!canEdit && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 rounded-full">
                <Eye className="w-3.5 h-3.5" /> Read Only
              </span>
            )}
          </div>
        </div>
        <div className="w-full sm:w-auto flex justify-start sm:justify-end">
          {canEdit && <InviteDialog skillId={skillId} skillName={skill.name} />}
        </div>
      </div>
      
      {canEdit && (
        <div className="bg-accent/40 rounded-2xl p-5 sm:p-8 border border-border/60 shadow-sm">
          <AddPlaylistForm skillId={skillId} onSuccess={handlePlaylistAdded} />
        </div>
      )}
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground mb-4">Learning Path</h3>
        
        {skill.playlists.length === 0 ? (
          <div className="text-center py-16 px-4 border-2 border-dashed border-border rounded-2xl bg-accent/20">
            <h4 className="text-xl font-semibold text-foreground mb-3">No playlists yet</h4>
            <p className="text-muted-foreground max-w-md mx-auto mb-6 text-base">
              Start building your learning path by adding your first playlist or resource above.
            </p>
          </div>
        ) : (
          canEdit ? (
            // Editor View: Wrapped in Drag Drop functionality
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="playlists">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3.5">
                    {skill.playlists.sort((a, b) => a.position - b.position).map((playlist, index) => (
                      <Draggable key={playlist.id} draggableId={playlist.id} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} className={`transition-all duration-200 ${snapshot.isDragging ? 'shadow-xl scale-[1.03] z-50 ring-2 ring-primary/20 rounded-xl' : ''}`}>
                            <PlaylistItem
                              playlist={playlist} skillId={skillId} isFirst={index === 0} isLast={index === skill.playlists.length - 1}
                              onMove={handleMovePlaylist} onDelete={handleDeletePlaylist} onUpdate={handlePlaylistUpdated}
                              onUpdateTitle={handleUpdatePlaylistTitle} dragHandleProps={provided.dragHandleProps}
                              canEdit={canEdit}
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
          ) : (
            // Read-Only View: Simple list mapped without Drag Drop overhead
            <div className="space-y-3.5">
              {skill.playlists.sort((a, b) => a.position - b.position).map((playlist, index) => (
                <div key={playlist.id} className="transition-all duration-200">
                  <PlaylistItem
                    playlist={playlist} skillId={skillId} isFirst={index === 0} isLast={index === skill.playlists.length - 1}
                    onMove={handleMovePlaylist} onDelete={handleDeletePlaylist} onUpdate={handlePlaylistUpdated}
                    onUpdateTitle={handleUpdatePlaylistTitle} dragHandleProps={null}
                    canEdit={canEdit}
                  />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PlaylistManager;