
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skill } from '@/utils/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/utils/api';

interface SkillCardProps {
  skill: Skill;
  onUpdate: () => void;
}

const SkillCard = ({ skill, onUpdate }: SkillCardProps) => {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [name, setName] = useState(skill.name);
  const [description, setDescription] = useState(skill.description);
  const [thumbnailUrl, setThumbnailUrl] = useState(skill.thumbnailUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const playlistCount = skill.playlists.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await api.updateSkill(skill.id, { 
        name, 
        description, 
        thumbnailUrl 
      });
      
      setOpen(false);
      onUpdate();
      toast.success("Skill updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update skill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const success = await api.deleteSkill(skill.id);
      if (success) {
        toast.success("Skill deleted successfully");
        onUpdate();
        setDeleteDialogOpen(false);
      } else {
        toast.error("Failed to delete skill. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete skill. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group transition-all duration-300 flex flex-col h-full overflow-hidden bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md animate-scale will-change-transform relative">
        <Link to={`/skill/${skill.id}`} className="absolute inset-0 z-10"></Link>
        
        <div className="w-full h-48 overflow-hidden relative">
          <img 
            src={skill.thumbnailUrl || `https://source.unsplash.com/random/800x600?${encodeURIComponent(skill.name.toLowerCase())}`} 
            alt={skill.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
            <Button 
              size="icon" 
              variant="secondary" 
              className="bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setName(skill.name);
                setDescription(skill.description);
                setThumbnailUrl(skill.thumbnailUrl);
                setOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="bg-red-500/90 hover:bg-red-600 text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Skill</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{skill.name}"? This will also delete all associated playlists. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col p-5">
          <div className="flex items-center mb-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
              {playlistCount} {playlistCount === 1 ? 'playlist' : 'playlists'}
            </span>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-black transition-colors">
            {skill.name}
          </h3>
          
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
            {skill.description}
          </p>
          
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {new Date(skill.updatedAt).toLocaleDateString()}
            </span>
            
            <span className="inline-flex items-center text-sm text-gray-900 font-medium group-hover:translate-x-0.5 transition-transform duration-300">
              View skill
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className="w-4 h-4 ml-1 group-hover:ml-2 transition-all duration-300"
              >
                <path 
                  fillRule="evenodd" 
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" 
                  clipRule="evenodd" 
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit skill</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Skill Name
              </label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Web Development"
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe this skill or what you want to learn"
                className="w-full min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="thumbnail" className="text-sm font-medium">
                Thumbnail URL (optional)
              </label>
              <Input
                id="thumbnail"
                value={thumbnailUrl || ''}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Leave blank to use an auto-generated image
              </p>
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
                {isSubmitting ? 'Updating...' : 'Update Skill'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SkillCard;
