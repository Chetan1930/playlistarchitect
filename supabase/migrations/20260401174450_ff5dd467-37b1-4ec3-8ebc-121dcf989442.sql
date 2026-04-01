
-- Create skill_invitations table
CREATE TABLE public.skill_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skill_shares table (active shares after acceptance)
CREATE TABLE public.skill_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(skill_id, user_id)
);

-- Enable RLS
ALTER TABLE public.skill_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_shares ENABLE ROW LEVEL SECURITY;

-- RLS for skill_invitations
-- Inviter can see their sent invitations
CREATE POLICY "Inviters can view sent invitations"
  ON public.skill_invitations FOR SELECT
  USING (auth.uid() = inviter_id);

-- Invitee can see invitations sent to their email
CREATE POLICY "Invitees can view received invitations"
  ON public.skill_invitations FOR SELECT
  USING (invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Skill owner can create invitations
CREATE POLICY "Skill owners can create invitations"
  ON public.skill_invitations FOR INSERT
  WITH CHECK (auth.uid() = inviter_id AND EXISTS (
    SELECT 1 FROM public.skills WHERE id = skill_id AND user_id = auth.uid()
  ));

-- Invitee can update (accept/decline) invitations
CREATE POLICY "Invitees can update invitations"
  ON public.skill_invitations FOR UPDATE
  USING (invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Inviter can delete invitations
CREATE POLICY "Inviters can delete invitations"
  ON public.skill_invitations FOR DELETE
  USING (auth.uid() = inviter_id);

-- RLS for skill_shares
-- Owner and shared user can view shares
CREATE POLICY "Users can view their shares"
  ON public.skill_shares FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.skills WHERE id = skill_id AND user_id = auth.uid()
  ));

-- Only system inserts shares (via inviter accepting), but we allow inviter to insert
CREATE POLICY "Skill owners can create shares"
  ON public.skill_shares FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.skills WHERE id = skill_id AND user_id = auth.uid()
  ) OR auth.uid() = user_id);

-- Owner or shared user can delete shares
CREATE POLICY "Users can delete shares"
  ON public.skill_shares FOR DELETE
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.skills WHERE id = skill_id AND user_id = auth.uid()
  ));

-- Update skills RLS to allow shared users to view
CREATE POLICY "Shared users can view shared skills"
  ON public.skills FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.skill_shares WHERE skill_id = id AND user_id = auth.uid()
  ));

-- Allow shared users to update playlists of shared skills
CREATE POLICY "Shared users can view playlists of shared skills"
  ON public.playlists FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.skill_shares WHERE skill_id = playlists.skill_id AND user_id = auth.uid()
  ));

CREATE POLICY "Shared users can create playlists for shared skills"
  ON public.playlists FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.skill_shares WHERE skill_id = playlists.skill_id AND user_id = auth.uid()
  ));

CREATE POLICY "Shared users can update playlists of shared skills"
  ON public.playlists FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.skill_shares WHERE skill_id = playlists.skill_id AND user_id = auth.uid()
  ));

CREATE POLICY "Shared users can delete playlists of shared skills"
  ON public.playlists FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.skill_shares WHERE skill_id = playlists.skill_id AND user_id = auth.uid()
  ));
