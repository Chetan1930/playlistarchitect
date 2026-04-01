import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, X } from 'lucide-react';
import { invitationApi, Invitation } from '@/utils/invitationApi';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const InvitationBell = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: invitations = [] } = useQuery({
    queryKey: ['received-invitations'],
    queryFn: invitationApi.getReceivedInvitations,
    refetchInterval: 30000, // Poll every 30s
  });

  const handleAccept = async (invitation: Invitation) => {
    const success = await invitationApi.acceptInvitation(invitation.id);
    if (success) {
      toast.success(`Joined "${invitation.skill_name}"!`);
      queryClient.invalidateQueries({ queryKey: ['received-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['shared-skills'] });
    } else {
      toast.error('Failed to accept invitation');
    }
  };

  const handleDecline = async (invitation: Invitation) => {
    const success = await invitationApi.declineInvitation(invitation.id);
    if (success) {
      toast.success('Invitation declined');
      queryClient.invalidateQueries({ queryKey: ['received-invitations'] });
    } else {
      toast.error('Failed to decline invitation');
    }
  };

  const pendingCount = invitations.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {pendingCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-gray-100">
          <h3 className="font-medium text-sm">Invitations</h3>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {invitations.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No pending invitations
            </div>
          ) : (
            invitations.map((inv) => (
              <div key={inv.id} className="p-3 border-b border-gray-50 last:border-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {inv.skill_name}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Invited by {inv.invitee_email !== inv.inviter_id ? 'a collaborator' : 'unknown'}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAccept(inv)}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleDecline(inv)}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InvitationBell;
