import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skill } from '@/utils/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/utils/api';

interface SkillCardProps {
  skill: Skill;
  onUpdate: () => void;
}

/**
 * Youdemy-style library card: dark surface with a diagonal amber stripe pattern,
 * italic serif title, watched count + progress, and an inline "Submit for public
 * listing" style action row. Edit/delete controls live on hover.
 */
const SkillCard = ({ skill, onUpdate }: SkillCardProps) => {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [name, setName] = useState(skill.name);
  const [description, setDescription] = useState(skill.description);
  const [thumbnailUrl, setThumbnailUrl] = useState(skill.thumbnailUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const playlistCount = skill.playlists.length;
  const completedCount = skill.playlists.filter((p) => p.isCompleted).length;
  const percent = playlistCount > 0 ? Math.round((completedCount / playlistCount) * 100) : 0;

  // Permissions
  const canEdit = skill.isShared ? skill.accessLevel === 'editor' : true;
  const canDelete = !skill.isShared;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await api.updateSkill(skill.id, { name, description, thumbnailUrl });
      setOpen(false);
      onUpdate();
      toast.success('Skill updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await api.deleteSkill(skill.id);
      if (success) {
        toast.success('Skill deleted');
        setDeleteDialogOpen(false);
        onUpdate();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card hover:border-primary/40 transition-colors">
        <Link to={`/skill/${skill.id}`} className="absolute inset-0 z-10" aria-label={`Open ${skill.name}`} />

        {/* Thumbnail — dark amber-striped background with a circled section mark */}
        <div className="relative h-40 amber-pattern flex items-center justify-center border-b border-border overflow-hidden">
          {skill.thumbnailUrl ? (
            <img
              src={skill.thumbnailUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity"
              loading="lazy"
            />
          ) : null}
          <span className="relative w-14 h-14 rounded-full border border-primary/40 flex items-center justify-center text-primary font-display text-2xl">
            §
          </span>
          <span className="absolute bottom-2 left-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            {skill.name}
          </span>

          {/* Hover actions */}
          <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
            {canEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-background/80 hover:bg-background text-foreground backdrop-blur-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setName(skill.name);
                  setDescription(skill.description);
                  setThumbnailUrl(skill.thumbnailUrl);
                  setOpen(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-background/80 hover:bg-destructive text-destructive hover:text-destructive-foreground backdrop-blur-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col p-5">
          <h3 className="font-display text-xl sm:text-2xl text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {skill.name}
          </h3>
          {skill.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{skill.description}</p>
          )}

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>
                {completedCount}/{playlistCount} watched
              </span>
              <span>{percent}%</span>
            </div>
            <div className="h-0.5 bg-border/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-dashed border-border">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
              Submit for public listing
            </span>
          </div>
        </div>
      </div>

      {/* Edit dialog */}
      {canEdit && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display italic text-2xl">Edit skill</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="eyebrow">
                  Skill name
                </label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Web Development"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-description" className="eyebrow">
                  Description
                </label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="thumbnail" className="eyebrow">
                  Thumbnail URL
                </label>
                <Input
                  id="thumbnail"
                  value={thumbnailUrl || ''}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">Leave blank for auto-generated art.</p>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting || !name.trim()}
                >
                  {isSubmitting ? 'Updating…' : 'Update'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {canDelete && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display italic text-2xl">Delete this skill?</AlertDialogTitle>
              <AlertDialogDescription>
                "{skill.name}" and its {playlistCount} playlist(s) will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default SkillCard;
