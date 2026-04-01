
-- Drop problematic policies
DROP POLICY IF EXISTS "Shared users can view shared skills" ON public.skills;
DROP POLICY IF EXISTS "Users can view their shares" ON public.skill_shares;
DROP POLICY IF EXISTS "Skill owners can create shares" ON public.skill_shares;
DROP POLICY IF EXISTS "Users can delete shares" ON public.skill_shares;
DROP POLICY IF EXISTS "Invitees can view received invitations" ON public.skill_invitations;
DROP POLICY IF EXISTS "Invitees can update invitations" ON public.skill_invitations;
DROP POLICY IF EXISTS "Shared users can view playlists of shared skills" ON public.playlists;
DROP POLICY IF EXISTS "Shared users can create playlists for shared skills" ON public.playlists;
DROP POLICY IF EXISTS "Shared users can update playlists of shared skills" ON public.playlists;
DROP POLICY IF EXISTS "Shared users can delete playlists of shared skills" ON public.playlists;

-- Security definer function to check if user has a share for a skill
CREATE OR REPLACE FUNCTION public.user_has_skill_share(_user_id uuid, _skill_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.skill_shares
    WHERE user_id = _user_id AND skill_id = _skill_id
  )
$$;

-- Security definer function to check if user owns a skill
CREATE OR REPLACE FUNCTION public.user_owns_skill(_user_id uuid, _skill_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.skills
    WHERE id = _skill_id AND user_id = _user_id
  )
$$;

-- Security definer function to get user email
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = _user_id
$$;

-- Re-create policies using security definer functions

-- Skills: shared users can view
CREATE POLICY "Shared users can view shared skills"
  ON public.skills FOR SELECT
  USING (public.user_has_skill_share(auth.uid(), id));

-- Skill shares: view own shares or shares for skills you own
CREATE POLICY "Users can view their shares"
  ON public.skill_shares FOR SELECT
  USING (auth.uid() = user_id OR public.user_owns_skill(auth.uid(), skill_id));

CREATE POLICY "Users can create shares"
  ON public.skill_shares FOR INSERT
  WITH CHECK (public.user_owns_skill(auth.uid(), skill_id) OR auth.uid() = user_id);

CREATE POLICY "Users can delete shares"
  ON public.skill_shares FOR DELETE
  USING (auth.uid() = user_id OR public.user_owns_skill(auth.uid(), skill_id));

-- Invitations: use get_user_email instead of direct auth.users access
CREATE POLICY "Invitees can view received invitations"
  ON public.skill_invitations FOR SELECT
  USING (invitee_email = public.get_user_email(auth.uid()));

CREATE POLICY "Invitees can update invitations"
  ON public.skill_invitations FOR UPDATE
  USING (invitee_email = public.get_user_email(auth.uid()));

-- Playlists: shared users access via security definer
CREATE POLICY "Shared users can view playlists of shared skills"
  ON public.playlists FOR SELECT
  USING (public.user_has_skill_share(auth.uid(), skill_id));

CREATE POLICY "Shared users can create playlists for shared skills"
  ON public.playlists FOR INSERT
  WITH CHECK (public.user_has_skill_share(auth.uid(), skill_id));

CREATE POLICY "Shared users can update playlists of shared skills"
  ON public.playlists FOR UPDATE
  USING (public.user_has_skill_share(auth.uid(), skill_id));

CREATE POLICY "Shared users can delete playlists of shared skills"
  ON public.playlists FOR DELETE
  USING (public.user_has_skill_share(auth.uid(), skill_id));
