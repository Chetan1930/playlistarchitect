
-- Add access_level columns
ALTER TABLE public.skill_invitations ADD COLUMN access_level text NOT NULL DEFAULT 'editor';
ALTER TABLE public.skill_shares ADD COLUMN access_level text NOT NULL DEFAULT 'editor';

-- Write access check function
CREATE OR REPLACE FUNCTION public.user_has_skill_share_write(_user_id uuid, _skill_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.skill_shares
    WHERE user_id = _user_id AND skill_id = _skill_id AND access_level = 'editor'
  )
$$;

-- Update playlist write policies for shared users
DROP POLICY IF EXISTS "Shared users can create playlists for shared skills" ON public.playlists;
DROP POLICY IF EXISTS "Shared users can update playlists of shared skills" ON public.playlists;
DROP POLICY IF EXISTS "Shared users can delete playlists of shared skills" ON public.playlists;

CREATE POLICY "Shared users can create playlists for shared skills"
ON public.playlists FOR INSERT TO public
WITH CHECK (user_has_skill_share_write(auth.uid(), skill_id));

CREATE POLICY "Shared users can update playlists of shared skills"
ON public.playlists FOR UPDATE TO public
USING (user_has_skill_share_write(auth.uid(), skill_id));

CREATE POLICY "Shared users can delete playlists of shared skills"
ON public.playlists FOR DELETE TO public
USING (user_has_skill_share_write(auth.uid(), skill_id));

-- Create links table
CREATE TABLE public.links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  favicon text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own links" ON public.links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own links" ON public.links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own links" ON public.links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own links" ON public.links FOR DELETE USING (auth.uid() = user_id);

-- Drop and recreate collaborators function with access_level
DROP FUNCTION IF EXISTS public.get_skill_collaborators_enriched(uuid);

CREATE FUNCTION public.get_skill_collaborators_enriched(_skill_id uuid)
RETURNS TABLE(user_id uuid, created_at timestamp with time zone, collaborator_name text, access_level text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    ss.user_id,
    ss.created_at,
    COALESCE(
      NULLIF(u.raw_user_meta_data ->> 'full_name', ''),
      NULLIF(u.raw_user_meta_data ->> 'name', ''),
      INITCAP(REGEXP_REPLACE(SPLIT_PART(u.email, '@', 1), '[._-]+', ' ', 'g')),
      'Unknown'
    ) AS collaborator_name,
    ss.access_level
  FROM public.skill_shares ss
  JOIN auth.users u ON u.id = ss.user_id
  WHERE ss.skill_id = _skill_id
    AND (
      public.user_owns_skill(auth.uid(), _skill_id)
      OR public.user_has_skill_share(auth.uid(), _skill_id)
    )
  ORDER BY ss.created_at ASC;
$$;
