import { useState } from 'react';
import { Playlist } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { api } from '@/utils/api';
import { MoreVertical, ArrowUp, ArrowDown, Trash2, Edit, CheckCircle, GripVertical, Copy, Link as LinkIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

const PlaylistItem = ({ playlist, skillId, isFirst, isLast, onMove, onDelete, onUpdate, onUpdateTitle, dragHandleProps, canEdit = true }: PlaylistItemProps) => {
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
      await api.updatePlaylistTitle(skillId, playlist.id, title);
      setOpen(false);
      onUpdate();
      toast.success("Playlist title updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update title");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComplete = async () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    const success = await api.updatePlaylistCompletion(playlist.id, newStatus);
    if (success) toast.success(newStatus ? "Marked as complete" : "Marked as incomplete");
    else { setIsCompleted(!newStatus); toast.error("Failed to update status"); }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(playlist.url);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="p-3 sm:p-4 border border-border rounded-xl hover:bg-accent/40 transition-colors duration-300 animate-fade-in group bg-card shadow-sm flex items-center gap-3 sm:gap-4">
      
      {canEdit && dragHandleProps && (
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100 transition-opacity p-1 hidden sm:block shrink-0">
          <GripVertical size={18} />
        </div>
      )}

      {/* Thumbnail with Number Badge */}
      <div className="relative shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-md overflow-hidden bg-muted group-hover:ring-2 ring-primary/20 transition-all shadow-sm">
        {playlist.thumbnailUrl ? (
          <img src={playlist.thumbnailUrl} alt={playlist.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-primary/40" />
          </div>
        )}
        <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-sm leading-none shadow-sm">
          {playlist.position + 1}
        </div>
      </div>

      <div className="flex-1 min-w-0 py-1">
        <a href={playlist.url} target="_blank" rel="noopener noreferrer"
          className={`text-sm sm:text-base font-medium hover:text-primary transition-colors line-clamp-2 pr-2 ${isCompleted ? 'line-through text-muted-foreground opacity-70' : 'text-foreground'}`}>
          {playlist.title}
        </a>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Button variant="outline" size="sm"
          className={`rounded-full transition-all duration-300 text-xs sm:text-sm h-9 sm:h-9 px-3 sm:px-4 font-medium ${isCompleted ? 'bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:border-green-800' : 'hover:bg-accent hover:text-accent-foreground'}`}
          onClick={toggleComplete}>
          <CheckCircle className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">{isCompleted ? 'Done' : 'Mark Done'}</span>
        </Button>
        
        {canEdit && (
          <>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 h-9 w-9 p-0 hidden sm:flex">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
                  <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl" onClick={() => { onDelete(playlist.id); setDeleteDialogOpen(false); }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 sm:h-9 sm:w-9 p-0 rounded-full hover:bg-accent active:bg-accent/80">
                  <MoreVertical className="h-5 w-5 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
                <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Actions</DropdownMenuLabel>
                <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 sm:py-1.5" onClick={() => setOpen(true)}><Edit className="mr-2 h-4 w-4" />Edit Title</DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 sm:py-1.5" onClick={handleCopyLink}><Copy className="mr-2 h-4 w-4" />Copy Link</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 sm:py-1.5" disabled={isFirst} onClick={() => onMove(playlist.id, 'up')}><ArrowUp className="mr-2 h-4 w-4" />Move Up</DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 sm:py-1.5" disabled={isLast} onClick={() => onMove(playlist.id, 'down')}><ArrowDown className="mr-2 h-4 w-4" />Move Down</DropdownMenuItem>
                <DropdownMenuSeparator className="sm:hidden" />
                <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 sm:hidden text-destructive focus:text-destructive" onClick={() => setDeleteDialogOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {canEdit && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>Edit playlist title</DialogTitle></DialogHeader>
            <form onSubmit={handleTitleUpdate} className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-title" className="text-sm font-medium text-foreground">Playlist Title</label>
                <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="rounded-xl h-11" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-11 px-6">Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-xl h-11 px-6" disabled={isSubmitting || !title.trim()}>
                  {isSubmitting ? 'Updating...' : 'Update Title'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PlaylistItem;