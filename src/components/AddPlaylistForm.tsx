import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/utils/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddPlaylistFormProps {
  skillId: string;
  onSuccess: () => void;
}

/**
 * Amber quick-import row for adding a new step to a course. Matches the
 * Youdemy "New course from a URL" pattern but scoped to a single skill.
 */
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
        toast.success('Step added');
      } else {
        toast.error('Could not import that link');
      }
    } catch (error) {
      console.error('Error adding playlist:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <p className="eyebrow mb-1.5">Add a step to this course</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground" />
          YouTube playlist, video, or any public webpage.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <Input
          type="url"
          placeholder="paste a youtube playlist or video link…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 h-11 rounded-md bg-background border-border text-sm placeholder:text-muted-foreground/60"
          required
          disabled={isLoading}
        />
        <Button
          type="submit"
          className="h-11 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Adding…
            </span>
          ) : (
            'Add step'
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddPlaylistForm;
