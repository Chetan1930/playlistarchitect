
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
import { MoreVertical, ArrowUp, ArrowDown, Trash2, Edit, CheckCircle } from 'lucide-react';
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
  const [isCompleted, setIsCompleted] = useState(false);

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

  const toggleComplete = () => {
    setIsCompleted(!isCompleted);
    toast.success(isCompleted ? "Marked as incomplete" : "Marked as complete");
  };

  return (
    <div className="relative pl-12 pr-4 py-3 border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors duration-300 animate-fade-in">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-medium text-sm shadow-md">
        {playlist.position + 1}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center">
          <a
            href={playlist.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-gray-900 font-medium hover:text-blue-500 transition-colors line-clamp-1 ${isCompleted ? 'line-through text-gray-400' : ''}`}
          >
            {playlist.title}
          </a>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={`rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-100 text-green-600 border-green-200' : 'hover:bg-purple-50 hover:text-purple-600'}`}
            onClick={toggleComplete}
          >
            <CheckCircle className="mr-1 h-4 w-4" />
            {isCompleted ? 'Completed' : 'Mark Done'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-scale-in">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setOpen(true)} className="hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Title</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                disabled={isFirst} 
                onClick={() => onMove(playlist.id, 'up')}
                className="hover:bg-gray-100 cursor-pointer transition-colors duration-200"
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                <span>Move Up</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                disabled={isLast} 
                onClick={() => onMove(playlist.id, 'down')}
                className="hover:bg-gray-100 cursor-pointer transition-colors duration-200"
              >
                <ArrowDown className="mr-2 h-4 w-4" />
                <span>Move Down</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(playlist.id)}
                className="text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors duration-200"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md animate-scale-in">
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
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-full transition-all duration-300"
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
