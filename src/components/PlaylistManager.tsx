import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import PlaylistItem from './PlaylistItem';
import AddPlaylistForm from './AddPlaylistForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import InviteDialog from './InviteDialog';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { supabase } from '@/integrations/supabase/client';

interface PlaylistManagerProps {
  skillId: string;
}

/**
 * Youdemy course-view layout:
 *  - Left: "Today's Lesson" hero for the current step with the giant amber
 *    "Mark complete · +325 XP" CTA.
 *  - Right: sticky Contents sidebar (numbered list of all steps).
 * On mobile the contents list stacks below the hero.
 */
const PlaylistManager = ({ skillId }: PlaylistManagerProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [canEdit, setCanEdit] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  const { data: skill, isLoading, isError, refetch } = useQuery({
    queryKey: ['skill', skillId],
    queryFn: () => api.getSkill(skillId),
  });

  // Owner / editor / viewer resolution
  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !skill) {
        if (skill) setAccessChecked(true);
        return;
      }
      const { data: ownsSkill } = await (supabase as any).rpc('user_owns_skill', {
        _user_id: user.id,
        _skill_id: skillId,
      });
      if (ownsSkill) {
        setCanEdit(true);
        setAccessChecked(true);
        return;
      }
      const { data: hasWrite } = await (supabase as any).rpc('user_has_skill_share_write', {
        _user_id: user.id,
        _skill_id: skillId,
      });
      setCanEdit(!!hasWrite);
      setAccessChecked(true);
    };
    if (skill) checkAccess();
  }, [user, skill, skillId]);

  const handleMovePlaylist = async (playlistId: string, direction: 'up' | 'down') => {
    if (!skill) return;
    const idx = skill.playlists.findIndex((p) => p.id === playlistId);
    if (idx === -1) return;
    const newPos = direction === 'up' ? Math.max(0, idx - 1) : Math.min(skill.playlists.length - 1, idx + 1);
    if (newPos === idx) return;
    const success = await api.updatePlaylistPosition(skillId, playlistId, newPos);
    if (success) {
      refetch();
      toast.success('Order updated');
    } else toast.error('Failed to reorder');
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!skill || !result.destination) return;
    if (result.source.index === result.destination.index) return;
    const playlistId = skill.playlists[result.source.index].id;
    const success = await api.updatePlaylistPosition(skillId, playlistId, result.destination.index);
    if (success) {
      refetch();
      toast.success('Order updated');
    } else toast.error('Failed to reorder');
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    const success = await api.deletePlaylist(skillId, playlistId);
    if (success) {
      refetch();
      toast.success('Step removed');
    } else toast.error('Failed to remove');
  };

  const handleUpdatePlaylistTitle = async (playlistId: string, newTitle: string) => {
    const success = await api.updatePlaylistTitle(skillId, playlistId, newTitle);
    if (success) {
      refetch();
      toast.success('Title updated');
    } else toast.error('Failed to update');
  };

  const handlePlaylistAdded = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['skills'] });
  };
  const handlePlaylistUpdated = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['skills'] });
  };

  // ---------- Loading / error ----------
  if (isLoading || (skill && !accessChecked)) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-muted rounded" />
        <div className="h-72 bg-card border border-border rounded-lg" />
        <div className="h-64 bg-card border border-border rounded-lg" />
      </div>
    );
  }

  if (isError || !skill) {
    return (
      <div className="text-center py-16 px-4">
        <h3 className="font-display text-3xl text-foreground mb-3">Couldn't load this skill</h3>
        <p className="text-muted-foreground mb-8">Try again in a moment.</p>
        <Link to="/">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Back to library</Button>
        </Link>
      </div>
    );
  }

  // ---------- Derived UI state ----------
  const sortedPlaylists = [...skill.playlists].sort((a, b) => a.position - b.position);
  const currentStep = sortedPlaylists.find((p) => !p.isCompleted) ?? sortedPlaylists[0] ?? null;
  const currentIndex = currentStep ? sortedPlaylists.findIndex((p) => p.id === currentStep.id) : 0;
  const completedCount = sortedPlaylists.filter((p) => p.isCompleted).length;
  const totalCount = sortedPlaylists.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-10">
      {/* Top nav row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            to="/"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to library
          </Link>
          <p className="eyebrow mb-1">Course · Lecture {Math.min(currentIndex + 1, totalCount || 1)}/{totalCount || 1}</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground">{skill.name}</h1>
          {(skill.description || !canEdit) && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {skill.description && <p className="text-sm text-muted-foreground">{skill.description}</p>}
              {!canEdit && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                  <Eye className="w-3 h-3" /> Read only
                </span>
              )}
            </div>
          )}
        </div>
        {canEdit && (
          <div className="flex items-center gap-2 shrink-0">
            <InviteDialog skillId={skillId} skillName={skill.name} />
          </div>
        )}
      </div>

      {totalCount === 0 ? (
        // ---------- Empty course ----------
        <>
          {canEdit && (
            <div className="rounded-lg border border-border bg-card p-6 sm:p-7">
              <AddPlaylistForm skillId={skillId} onSuccess={handlePlaylistAdded} />
            </div>
          )}
          <div className="rounded-lg border border-dashed border-border bg-card/50 py-16 px-6 text-center">
            <h3 className="font-display text-2xl text-foreground mb-2">No steps yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Paste any video, playlist, or article link above to build your first step.
            </p>
          </div>
        </>
      ) : (
        // ---------- Two-column course view ----------
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
          {/* LEFT: current step hero + adder */}
          <div className="space-y-8 min-w-0">
            {currentStep && (
              <section className="rounded-lg border border-border bg-card p-6 sm:p-8">
                <p className="eyebrow mb-4">Today's Lesson</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  {skill.name}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground mb-6 leading-tight">
                  {currentStep.title}
                </h2>

                {/* Progress + resume/mark row */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs text-muted-foreground shrink-0">
                    {completedCount}/{totalCount} videos
                  </span>
                  <div className="flex-1 h-1 bg-border/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{percent}%</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 h-11 rounded-md border-border hover:border-primary/40"
                  >
                    <a href={currentStep.url} target="_blank" rel="noopener noreferrer">
                      Open link
                    </a>
                  </Button>
                  <Button
                    onClick={async () => {
                      const ok = await api.updatePlaylistCompletion(currentStep.id, !currentStep.isCompleted);
                      if (ok) {
                        toast.success(
                          currentStep.isCompleted ? 'Marked incomplete' : 'Marked complete · +325 XP'
                        );
                        refetch();
                      } else {
                        toast.error('Failed to update');
                      }
                    }}
                    className="flex-1 h-11 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    {currentStep.isCompleted ? 'Marked complete' : 'Mark complete · +325 XP'}
                  </Button>
                </div>
              </section>
            )}

            {canEdit && (
              <section className="rounded-lg border border-border bg-card p-6 sm:p-7">
                <AddPlaylistForm skillId={skillId} onSuccess={handlePlaylistAdded} />
              </section>
            )}
          </div>

          {/* RIGHT: Contents sidebar */}
          <aside className="lg:sticky lg:top-20 lg:self-start rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display italic text-lg text-foreground">{skill.name}</h3>
              <span className="text-[11px] font-medium text-muted-foreground">
                {completedCount}/{totalCount}
              </span>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-2 divide-y divide-border/50">
              {canEdit ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="playlists">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {sortedPlaylists.map((playlist, index) => (
                          <Draggable key={playlist.id} draggableId={playlist.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={
                                  snapshot.isDragging
                                    ? 'ring-1 ring-primary/40 bg-accent/30 rounded-md'
                                    : ''
                                }
                              >
                                <PlaylistItem
                                  playlist={playlist}
                                  skillId={skillId}
                                  isFirst={index === 0}
                                  isLast={index === sortedPlaylists.length - 1}
                                  onMove={handleMovePlaylist}
                                  onDelete={handleDeletePlaylist}
                                  onUpdate={handlePlaylistUpdated}
                                  onUpdateTitle={handleUpdatePlaylistTitle}
                                  dragHandleProps={provided.dragHandleProps}
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
                <div>
                  {sortedPlaylists.map((playlist, index) => (
                    <PlaylistItem
                      key={playlist.id}
                      playlist={playlist}
                      skillId={skillId}
                      isFirst={index === 0}
                      isLast={index === sortedPlaylists.length - 1}
                      onMove={handleMovePlaylist}
                      onDelete={handleDeletePlaylist}
                      onUpdate={handlePlaylistUpdated}
                      onUpdateTitle={handleUpdatePlaylistTitle}
                      dragHandleProps={null}
                      canEdit={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default PlaylistManager;
