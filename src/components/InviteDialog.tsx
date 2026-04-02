import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Trash2, Users, Send, Crown, Clock } from 'lucide-react';
import { invitationApi } from '@/utils/invitationApi';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface InviteDialogProps {
  skillId: string;
  skillName: string;
}

const InviteDialog = ({ skillId, skillName }: InviteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: sentInvitations = [], refetch: refetchInvitations } = useQuery({
    queryKey: ['sent-invitations', skillId],
    queryFn: () => invitationApi.getSentInvitations(skillId),
    enabled: open,
  });

  const { data: collaborators = [], refetch: refetchCollaborators } = useQuery({
    queryKey: ['collaborators', skillId],
    queryFn: () => invitationApi.getSkillCollaborators(skillId),
    enabled: open,
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await invitationApi.sendInvitation(skillId, email.trim());
      if (success) {
        toast.success(`Invitation sent to ${email}`);
        setEmail('');
        refetchInvitations();
        setOpen(false);
      } else {
        toast.error('Failed to send invitation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    const success = await invitationApi.deleteInvitation(invitationId);
    if (success) {
      toast.success('Invitation cancelled');
      refetchInvitations();
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    const success = await invitationApi.removeShare(skillId, userId);
    if (success) {
      toast.success('Collaborator removed');
      refetchCollaborators();
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    }
  };

  const pendingInvitations = sentInvitations.filter(i => i.status === 'pending');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-xl border-border/60 hover:bg-accent/50 hover:border-primary/30 transition-all duration-200">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Invite</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-border/50">
        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-5 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-foreground">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-white" />
              </div>
              Invite to "{skillName}"
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleInvite} className="flex gap-2 mt-4">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 rounded-xl bg-background/80 border-border/50 focus:border-primary/50 placeholder:text-muted-foreground/50"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              size="sm"
              className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 shadow-sm"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {isSubmitting ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </div>

        <div className="p-5 pt-3 space-y-4 max-h-[320px] overflow-y-auto">
          {collaborators.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                Collaborators ({collaborators.length})
              </h4>
              <div className="space-y-1.5">
                {collaborators.map((c) => (
                  <div key={c.user_id} className="flex items-center justify-between p-2.5 bg-green-500/5 border border-green-500/10 rounded-xl group hover:bg-green-500/10 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {c.user_id.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-1.5 py-0">Active</Badge>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">{c.user_id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                      onClick={() => handleRemoveCollaborator(c.user_id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingInvitations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Pending ({pendingInvitations.length})
              </h4>
              <div className="space-y-1.5">
                {pendingInvitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl group hover:bg-amber-500/10 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {inv.invitee_email[0].toUpperCase()}
                      </div>
                      <div>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] px-1.5 py-0">Pending</Badge>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">{inv.invitee_email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                      onClick={() => handleDeleteInvitation(inv.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {collaborators.length === 0 && pendingInvitations.length === 0 && (
            <div className="text-center py-4">
              <Users className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No collaborators yet. Invite someone to get started!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
