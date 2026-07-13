import { useState } from 'react';
import { Playlist } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { api } from '@/utils/api';
import {
  MoreVertical, ArrowUp, ArrowDown, Trash2, Edit, GripVertical, Copy, ExternalLink, Check,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

export interface PlaylistItemProps {
  playlist: Playlist;
  skillId: string;
  isFirst: boolean;
  isLast: boolean;
  onMove: (playlistId: string, direction: 'up' | 'down') => Promise<void>;
  onDelete: (playlistId: string) => Promise<void>;
  onUpdate: () => void;
  onUpdateTitle: (playlistId: string, newTitle: string) => Promise<void>;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  canEdit?: boolean;
}

/**
 * Youdemy-style contents row:
 *  - Amber circled step number.
 *  - Title on top, short duration/hint underneath.
 *  - Completion shown as a filled amber circle on the number.
 *  - Actions (edit / reorder / delete) tucked into a dropdown on the right.
 */
const PlaylistItem = ({
  playlist, skillId, isFirst, isLast, onMove, onDelete, onUpdate, onUpdateTitle,
  dragHandleProps, canEdit = true,
}: PlaylistItemProps) => {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [title, setTitle] = useState(playlist.title);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(playlist.isCompleted);

  const handleTitleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateTitle(playlist.id, title);
      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update title');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComplete = async () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    const success = await api.updatePlaylistCompletion(playlist.id, newStatus);
    if (success) {
      toast.success(newStatus ? 'Marked complete · +325 XP' : 'Marked incomplete');
    } else {
      setIsCompleted(!newStatus);
      toast.error('Failed to update status');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(playlist.url);
    toast.success('Link copied');
  };

  return (
    <div className="group relative flex items-center gap-3 sm:gap-4 py-3.5 px-3 sm:px-4 rounded-md hover:bg-accent/40 transition-colors">
      {canEdit && dragHandleProps && (
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity hidden sm:block shrink-0 text-muted-foreground"
          aria-label="Reorder"
        >
          <GripVertical size={16} />
        </div>
      )}

      {/* Step number / completion toggle */}
      <button
        onClick={toggleComplete}
        className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold transition-colors ${
          isCompleted
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
        }`}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {isCompleted ? <Check className="w-4 h-4" /> : playlist.position + 1}
      </button>

      {/* Title + link */}
      <div className="flex-1 min-w-0">
        <a
          href={playlist.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`block text-sm sm:text-[15px] font-medium leading-snug line-clamp-2 transition-colors ${
            isCompleted
              ? 'line-through text-muted-foreground/70'
              : 'text-foreground group-hover:text-primary'
          }`}
        >
          {playlist.title}
        </a>
        <p className="mt-0.5 text-[11px] text-muted-foreground uppercase tracking-wider truncate">
          {new URL(playlist.url).hostname.replace(/^www\./, '')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
        >
          <a href={playlist.url} target="_blank" rel="noopener noreferrer" aria-label="Open link">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>

        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
                aria-label="More"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
              <DropdownMenuLabel className="eyebrow">Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setOpen(true)} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" /> Edit title
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                <Copy className="mr-2 h-4 w-4" /> Copy link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={isFirst}
                onClick={() => onMove(playlist.id, 'up')}
                className="cursor-pointer"
              >
                <ArrowUp className="mr-2 h-4 w-4" /> Move up
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isLast}
                onClick={() => onMove(playlist.id, 'down')}
                className="cursor-pointer"
              >
                <ArrowDown className="mr-2 h-4 w-4" /> Move down
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {canEdit && (
        <>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display italic text-2xl">Edit title</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTitleUpdate} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="edit-title" className="eyebrow">Playlist title</label>
                  <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting || !title.trim()}
                  >
                    {isSubmitting ? 'Saving…' : 'Save'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <span className="hidden" />
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display italic text-2xl">Delete this step?</AlertDialogTitle>
                <AlertDialogDescription>This will remove it from the course.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={() => {
                    onDelete(playlist.id);
                    setDeleteDialogOpen(false);
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};

export default PlaylistItem;
