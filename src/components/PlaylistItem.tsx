
import { useState } from 'react';
import { Playlist } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Trash } from 'lucide-react';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/toast';

interface PlaylistItemProps {
  playlist: Playlist;
  skillId: string;
  isFirst: boolean;
  isLast: boolean;
  onMove: (playlistId: string, direction: 'up' | 'down') => Promise<void>;
  onDelete: (playlistId: string) => Promise<void>;
}

const PlaylistItem = ({ 
  playlist, 
  skillId, 
  isFirst, 
  isLast, 
  onMove, 
  onDelete 
}: PlaylistItemProps) => {
  const { toast } = useToast();
  const [isMoving, setIsMoving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
          <h3 className="text-base font-medium text-gray-900 truncate">
            {playlist.title}
          </h3>
          
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
          disabled={isFirst || isMoving || isDeleting}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="rounded-none h-1/3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          onClick={() => handleMove('down')}
          disabled={isLast || isMoving || isDeleting}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="rounded-none h-1/3 text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
          onClick={handleDelete}
          disabled={isMoving || isDeleting}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PlaylistItem;
