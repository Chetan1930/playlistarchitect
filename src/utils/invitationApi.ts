import { supabase } from '@/integrations/supabase/client';

export interface Invitation {
  id: string;
  skill_id: string;
  inviter_id: string;
  invitee_email: string;
  status: string;
  created_at: string;
  skill_name?: string;
  inviter_email?: string;
  inviter_name?: string;
}

export interface Collaborator {
  user_id: string;
  created_at: string;
  collaborator_name?: string;
  access_level?: string;
}

export const invitationApi = {
  sendInvitation: async (skillId: string, inviteeEmail: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Don't invite yourself
    if (user.email === inviteeEmail) {
      throw new Error("You can't invite yourself");
    }

    // Check if already invited
    const { data: existing } = await supabase
      .from('skill_invitations')
      .select('id')
      .eq('skill_id', skillId)
      .eq('invitee_email', inviteeEmail)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      throw new Error('Invitation already sent to this email');
    }

    // Just send the invitation
    const { error } = await supabase
      .from('skill_invitations')
      .insert({
        skill_id: skillId,
        inviter_id: user.id,
        invitee_email: inviteeEmail,
      });

    if (error) {
      console.error('Error sending invitation:', error);
      return false;
    }
    return true;
  },

  getReceivedInvitations: async (): Promise<Invitation[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await (supabase as any).rpc('get_received_invitations_enriched');

    if (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }

    return (data || []).map((inv: any) => ({
      ...inv,
      skill_name: inv.skill_name || 'Shared skill',
      inviter_name: inv.inviter_name || 'A collaborator',
    }));
  },

  getSentInvitations: async (skillId: string): Promise<Invitation[]> => {
    const { data, error } = await supabase
      .from('skill_invitations')
      .select('*')
      .eq('skill_id', skillId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sent invitations:', error);
      return [];
    }
    return data || [];
  },

  acceptInvitation: async (invitationId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Get the invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('skill_invitations')
      .select('*')
      .eq('id', invitationId)
      .maybeSingle();

    if (fetchError || !invitation) return false;

    // Update status
    const { error: updateError } = await supabase
      .from('skill_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationId);

    if (updateError) {
      console.error('Error accepting invitation:', updateError);
      return false;
    }

    // Create the share
    const { error: shareError } = await supabase
      .from('skill_shares')
      .insert({
        skill_id: invitation.skill_id,
        user_id: user.id,
      });

    if (shareError) {
      console.error('Error creating share:', shareError);
      return false;
    }

    return true;
  },

  declineInvitation: async (invitationId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('skill_invitations')
      .update({ status: 'declined' })
      .eq('id', invitationId);

    if (error) {
      console.error('Error declining invitation:', error);
      return false;
    }
    return true;
  },

  deleteInvitation: async (invitationId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('skill_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) {
      console.error('Error deleting invitation:', error);
      return false;
    }
    return true;
  },

  getSharedSkills: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: shares, error } = await supabase
      .from('skill_shares')
      .select('skill_id')
      .eq('user_id', user.id);

    if (error || !shares || shares.length === 0) return [];

    const skills = await Promise.all(
      shares.map(async (share) => {
        const { data: skill } = await supabase
          .from('skills')
          .select('*')
          .eq('id', share.skill_id)
          .maybeSingle();

        if (!skill) return null;

        const { data: playlists } = await supabase
          .from('playlists')
          .select('*')
          .eq('skill_id', skill.id)
          .order('position', { ascending: true });

        return {
          id: skill.id,
          name: skill.name,
          description: skill.description || '',
          thumbnailUrl: skill.thumbnail_url,
          createdAt: new Date(skill.created_at),
          updatedAt: new Date(skill.updated_at),
          isShared: true,
          playlists: (playlists || []).map(p => ({
            id: p.id,
            title: p.title,
            url: p.url,
            thumbnailUrl: p.thumbnail_url,
            description: p.description,
            position: p.position,
            isCompleted: p.is_completed,
          })),
        };
      })
    );

    return skills.filter(Boolean);
  },

  getSkillCollaborators: async (skillId: string): Promise<Collaborator[]> => {
    const { data, error } = await (supabase as any).rpc('get_skill_collaborators_enriched', {
      _skill_id: skillId,
    });

    if (error) {
      console.error('Error fetching collaborators:', error);
      return [];
    }

    return (data || []).map((collaborator: any) => ({
      ...collaborator,
      collaborator_name: collaborator.collaborator_name || 'Collaborator',
    }));
  },

  removeShare: async (skillId: string, userId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('skill_shares')
      .delete()
      .eq('skill_id', skillId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing share:', error);
      return false;
    }
    return true;
  },
};
