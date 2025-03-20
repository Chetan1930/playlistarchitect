
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
  
  const handleUpdate = () => {
    refetch();
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-medium text-gray-900">Your Skills</h2>
          <p className="text-gray-500 mt-1">
            Organize your learning journey by adding skills and courses
          </p>
        </div>
        
        <Button 
          onClick={() => setOpen(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Add New Skill
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[300px] rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-8 h-8 text-gray-400"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v8"></path>
              <path d="M8 12h8"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No skills yet</h3>
          <p className="text-sm text-gray-500 text-center max-w-md mb-6">
            Start your learning journey created by Chetan Chauhan by adding your first skill or topic
          </p>
          <Button 
            onClick={() => setOpen(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 transition-all"
          >
            Add Your First Skill
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill: Skill) => (
            <SkillCard key={skill.id} skill={skill} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add new skill</DialogTitle>
            <DialogDescription>
              Create a new skill or topic that you want to learn
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Skill Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Web Development"
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe this skill or what you want to learn"
                className="w-full min-h-[100px]"
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
                disabled={isSubmitting || !name.trim()}
              >
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
