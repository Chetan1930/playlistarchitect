// Update the PlaylistItemProps interface in PlaylistItem.tsx to include onUpdateTitle
import { useState } from 'react';
import { Playlist } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { api } from '@/utils/api';
import { MoreVertical, ArrowUp, ArrowDown, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface PlaylistItemProps {
  playlist: Playlist;
  skillId: string;
  isFirst: boolean;
  isLast: boolean;
  onMove: (playlistId: string, direction: 'up' | 'down') => Promise<void>;
  onDelete: (playlistId: string) => Promise<void>;
  onUpdate: () => void;
  onUpdateTitle: (playlistId: string, newTitle: string) => Promise<void>;
}

const PlaylistItem = ({
  playlist,
  skillId,
  isFirst,
  isLast,
  onMove,
  onDelete,
  onUpdate,
  onUpdateTitle,
}: PlaylistItemProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(playlist.title);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      await api.updatePlaylistTitle(skillId, playlist.id, title);
      setOpen(false);
      onUpdate();
      toast.success("Playlist title updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update playlist title. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative pl-12 pr-4 py-3 border-b border-gray-100 last:border-none">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center font-medium text-sm">
        {playlist.position + 1}
      </div>

      <div className="flex items-center justify-between">
        <a
          href={playlist.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 font-medium hover:text-blue-500 transition-colors line-clamp-1"
        >
          {playlist.title}
        </a>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Title</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={isFirst} onClick={() => onMove(playlist.id, 'up')}>
              <ArrowUp className="mr-2 h-4 w-4" />
              <span>Move Up</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isLast} onClick={() => onMove(playlist.id, 'down')}>
              <ArrowDown className="mr-2 h-4 w-4" />
              <span>Move Down</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(playlist.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit playlist title</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleTitleUpdate} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">
                Playlist Title
              </label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to React"
                className="w-full"
                required
              />
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 rounded-full"
                disabled={isSubmitting || !title.trim()}
              >
                {isSubmitting ? 'Updating...' : 'Update Title'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlaylistItem;
