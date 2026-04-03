import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Skill } from '@/utils/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
      await api.updateSkill(skill.id, { name, description, thumbnailUrl });
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
        setDeleteDialogOpen(false);
        onUpdate();
      } else {
        toast.error("Failed to delete skill. Please try again.");
      }
    } catch (error) {
      console.error('Error during delete:', error);
      toast.error("Failed to delete skill. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group transition-all duration-300 flex flex-col h-full overflow-hidden bg-card hover:bg-accent/30 rounded-2xl border border-border hover:border-primary/20 shadow-sm hover:shadow-md animate-scale will-change-transform relative">
        <Link to={`/skill/${skill.id}`} className="absolute inset-0 z-10" />
        
        <div className="w-full h-40 sm:h-48 overflow-hidden relative">
          <img 
            src={skill.thumbnailUrl || `https://source.unsplash.com/random/800x600?${encodeURIComponent(skill.name.toLowerCase())}`} 
            alt={skill.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1.5">
            <Button size="icon" variant="secondary" className="h-8 w-8 bg-card/90 hover:bg-card backdrop-blur-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setName(skill.name); setDescription(skill.description); setThumbnailUrl(skill.thumbnailUrl); setOpen(true); }}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8 bg-destructive/90 hover:bg-destructive text-destructive-foreground backdrop-blur-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteDialogOpen(true); }}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col p-4 sm:p-5">
          <div className="flex items-center mb-2">
            <span className="bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full text-xs font-medium">
              {playlistCount} {playlistCount === 1 ? 'playlist' : 'playlists'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
            {skill.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
            {skill.description}
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {new Date(skill.updatedAt).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center text-sm text-primary font-medium group-hover:gap-2 gap-1 transition-all duration-300">
              View <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit skill</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium text-foreground">Skill Name</label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Web Development" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium text-foreground">Description</label>
              <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe this skill" className="min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <label htmlFor="thumbnail" className="text-sm font-medium text-foreground">Thumbnail URL (optional)</label>
              <Input id="thumbnail" value={thumbnailUrl || ''} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
              <p className="text-xs text-muted-foreground">Leave blank to use an auto-generated image</p>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-full" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? 'Updating...' : 'Update Skill'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{skill.name}"? This will also delete all associated playlists ({playlistCount}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SkillCard;
