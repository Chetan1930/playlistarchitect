import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, X, Mail, Sparkles } from 'lucide-react';
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
    refetchInterval: 30000,
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
        <button className="relative p-2.5 rounded-xl hover:bg-accent/50 transition-all duration-200 group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 rounded-2xl shadow-2xl border-border/50 overflow-hidden" align="end">
        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-sm text-foreground">Invitations</h3>
            {pendingCount > 0 && (
              <span className="ml-auto text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {invitations.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No pending invitations</p>
              <p className="text-xs text-muted-foreground/60 mt-1">When someone invites you, it'll show up here</p>
            </div>
          ) : (
            invitations.map((inv) => (
              <div key={inv.id} className="p-4 border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {(inv.inviter_email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {inv.skill_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      from <span className="font-medium text-foreground/70">{inv.inviter_email || 'Unknown'}</span>
                    </p>
                    <div className="flex gap-2 mt-2.5">
                      <Button
                        size="sm"
                        className="h-7 text-xs rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm"
                        onClick={() => handleAccept(inv)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        onClick={() => handleDecline(inv)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
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
