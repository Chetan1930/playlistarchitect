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
      toast.success("Skill created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create skill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Your Skills</h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Organize your learning journey by adding skills and courses
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-primary-foreground rounded-full px-5 transition-all duration-200 shadow-sm hover:shadow-md">
          <Plus className="w-4 h-4 mr-1.5" /> Add New Skill
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[280px] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border-2 border-dashed border-border bg-accent/30">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No skills yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Start your learning journey by adding your first skill or topic
          </p>
          <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-full px-6">
            Add Your First Skill
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {skills.map((skill: Skill) => (
            <SkillCard key={skill.id} skill={skill} onUpdate={() => refetch()} />
          ))}
        </div>
      )}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add new skill</DialogTitle>
            <DialogDescription>Create a new skill or topic that you want to learn</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">Skill Name</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Web Development" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">Description</label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe this skill" className="min-h-[100px]" />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-full" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? 'Creating...' : 'Create Skill'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillsList;
