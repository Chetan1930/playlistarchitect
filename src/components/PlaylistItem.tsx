
import { useState } from 'react';
import { Playlist } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUp, ArrowDown, Trash, Edit, Check, X } from 'lucide-react';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

interface PlaylistItemProps {
  playlist: Playlist;
  skillId: string;
  isFirst: boolean;
  isLast: boolean;
  onMove: (playlistId: string, direction: 'up' | 'down') => Promise<void>;
  onDelete: (playlistId: string) => Promise<void>;
  onUpdate?: () => void;
}

const PlaylistItem = ({ 
  playlist, 
  skillId, 
  isFirst, 
  isLast, 
  onMove, 
  onDelete,
  onUpdate
}: PlaylistItemProps) => {
  const { toast } = useToast();
  const [isMoving, setIsMoving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(playlist.title);
  
  const handleMove = async (direction: 'up' | 'down') => {
    setIsMoving(true);
    try {
      await onMove(playlist.id, direction);
    } catch (error) {
      console.error('Error moving playlist:', error);
      toast({
        title: "Error",
        description: "Failed to move playlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMoving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(playlist.id);
      toast({
        title: "Playlist deleted",
        description: "The playlist has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast({
        title: "Error",
        description: "Failed to delete playlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const startEditing = () => {
    setNewTitle(playlist.title);
    setIsEditing(true);
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
  };
  
  const saveTitle = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "Invalid title",
        description: "Title cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const success = await api.updatePlaylistTitle(skillId, playlist.id, newTitle);
      if (success) {
        toast({
          title: "Title updated",
          description: "Playlist title has been updated successfully.",
        });
        setIsEditing(false);
        // Refresh the component data
        if (onUpdate) onUpdate();
      } else {
        toast({
          title: "Error",
          description: "Failed to update title. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating playlist title:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div 
      className="reorder-item group flex items-stretch bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex-shrink-0 w-16 flex items-center justify-center bg-gray-50 text-gray-400 text-lg font-medium">
        {playlist.position + 1}
      </div>
      
      <div className="flex flex-1 items-center p-4 overflow-hidden">
        {playlist.thumbnailUrl && (
          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
            <img 
              src={playlist.thumbnailUrl} 
              alt={playlist.title} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center space-x-2 mb-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="py-1 h-8"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={saveTitle}
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={cancelEditing}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <h3 className="text-base font-medium text-gray-900 truncate mr-2">
                {playlist.title}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={startEditing}
                className="h-6 w-6 p-0.5 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <a 
            href={playlist.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 truncate block mt-1"
          >
            {playlist.url}
          </a>
          
          {playlist.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {playlist.description}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex flex-col border-l border-gray-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-none h-1/3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          onClick={() => handleMove('up')}
          disabled={isFirst || isMoving || isDeleting || isEditing}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="rounded-none h-1/3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          onClick={() => handleMove('down')}
          disabled={isLast || isMoving || isDeleting || isEditing}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="rounded-none h-1/3 text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
          onClick={handleDelete}
          disabled={isMoving || isDeleting || isEditing}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PlaylistItem;
