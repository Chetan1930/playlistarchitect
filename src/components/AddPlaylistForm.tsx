
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/toast';

interface AddPlaylistFormProps {
  skillId: string;
  onSuccess: () => void;
}

const AddPlaylistForm = ({ skillId, onSuccess }: AddPlaylistFormProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsLoading(true);
    
    try {
      const result = await api.addPlaylist(skillId, url);
      
      if (result) {
        setUrl('');
        onSuccess();
        toast({
          title: "Playlist added",
          description: "Your new playlist has been added successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add playlist. Please check the URL and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding playlist:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Add New Playlist</h3>
        <p className="text-sm text-gray-500">
          Paste a YouTube playlist or video URL below to add it to your learning path
        </p>
      </div>
      
      <div className="flex space-x-2">
        <Input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          required
        />
        <Button 
          type="submit" 
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 transition-all shadow-sm hover:shadow-md"
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? 'Adding...' : 'Add'}
        </Button>
      </div>
    </form>
  );
};

export default AddPlaylistForm;
