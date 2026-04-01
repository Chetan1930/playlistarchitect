import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Trash2, Users } from 'lucide-react';
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
  const acceptedInvitations = sentInvitations.filter(i => i.status === 'accepted');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Invite</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite to "{skillName}"
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleInvite} className="flex gap-2 mt-2">
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={isSubmitting} size="sm">
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        </form>

        {collaborators.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Collaborators</h4>
            <div className="space-y-2">
              {collaborators.map((c) => (
                <div key={c.user_id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
                    <span className="text-sm text-gray-600 truncate max-w-[180px]">{c.user_id.slice(0, 8)}...</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveCollaborator(c.user_id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingInvitations.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Pending Invitations</h4>
            <div className="space-y-2">
              {pendingInvitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>
                    <span className="text-sm text-gray-600 truncate max-w-[180px]">{inv.invitee_email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteInvitation(inv.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
