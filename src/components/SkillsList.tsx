import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Skill } from '@/utils/types';
import SkillCard from './SkillCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

/**
 * Standalone "My library" surface used inside pages that want the skill grid
 * without the dashboard hero. The main Index page renders its own library
 * section, so this component is mostly used in secondary contexts.
 */
const SkillsList = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: skills = [], isLoading, refetch } = useQuery({
    queryKey: ['skills'],
    queryFn: api.getSkills,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await api.createSkill(name, description || 'Created by Chetan Chauhan');
      setOpen(false);
      setName('');
      setDescription('');
      refetch();
      toast.success('Skill created');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-6 pb-3 border-b border-border/60">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">My library</h2>
          <p className="text-xs text-muted-foreground mt-1">Every course you've imported</p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New skill
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[260px] rounded-lg bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 py-16 px-6 text-center">
          <h3 className="font-display text-2xl text-foreground mb-2">Your library is empty</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Add your first skill to start collecting playlists into a tracked course.
          </p>
          <Button
            onClick={() => setOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Add your first skill
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((skill: Skill) => (
            <SkillCard key={skill.id} skill={skill} onUpdate={() => refetch()} />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display italic text-2xl">Add new skill</DialogTitle>
            <DialogDescription>Create a topic you want to track videos and notes for.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="eyebrow">
                Skill name
              </label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Web Development" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="eyebrow">
                Description
              </label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px]" />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSubmitting || !name.trim()}
              >
                {isSubmitting ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillsList;
