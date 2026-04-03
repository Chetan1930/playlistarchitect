import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/utils/api';
import { toast } from 'sonner';
import { LinkIcon } from 'lucide-react';

interface AddPlaylistFormProps {
  skillId: string;
  onSuccess: () => void;
}

const AddPlaylistForm = ({ skillId, onSuccess }: AddPlaylistFormProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsLoading(true);
    try {
      const result = await api.addPlaylist(skillId, url);
      if (result) {
        setUrl('');
        onSuccess();
        toast.success("Playlist added successfully");
      } else {
        toast.error("Failed to add playlist. Please check the URL and try again.");
      }
    } catch (error) {
      console.error('Error adding playlist:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Add New Playlist</h3>
        <p className="text-sm text-muted-foreground">
          Paste a YouTube playlist, video, or any webpage URL to add it to your learning path
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-9"
            required
          />
        </div>
        <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-primary-foreground rounded-full px-6 transition-all shadow-sm hover:shadow-md" disabled={isLoading || !url.trim()}>
          {isLoading ? 'Adding...' : 'Add'}
        </Button>
      </div>
    </form>
  );
};

export default AddPlaylistForm;
