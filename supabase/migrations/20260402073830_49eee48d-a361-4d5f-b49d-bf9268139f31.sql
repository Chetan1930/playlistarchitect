CREATE OR REPLACE FUNCTION public.get_received_invitations_enriched()
RETURNS TABLE (
  id uuid,
  skill_id uuid,
  inviter_id uuid,
  invitee_email text,
  status text,
  created_at timestamp with time zone,
  skill_name text,
  inviter_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.id,
    i.skill_id,
    i.inviter_id,
    i.invitee_email,
    i.status,
    i.created_at,
    s.name AS skill_name,
    COALESCE(
      NULLIF(u.raw_user_meta_data ->> 'full_name', ''),
      NULLIF(u.raw_user_meta_data ->> 'name', ''),
      INITCAP(REGEXP_REPLACE(SPLIT_PART(u.email, '@', 1), '[._-]+', ' ', 'g')),
      'Unknown'
    ) AS inviter_name
  FROM public.skill_invitations i
  JOIN auth.users viewer
    ON viewer.id = auth.uid()
   AND viewer.email = i.invitee_email
  JOIN public.skills s
    ON s.id = i.skill_id
  JOIN auth.users u
    ON u.id = i.inviter_id
  WHERE i.status = 'pending'
  ORDER BY i.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_skill_collaborators_enriched(_skill_id uuid)
RETURNS TABLE (
  user_id uuid,
  created_at timestamp with time zone,
  collaborator_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ss.user_id,
    ss.created_at,
    COALESCE(
      NULLIF(u.raw_user_meta_data ->> 'full_name', ''),
      NULLIF(u.raw_user_meta_data ->> 'name', ''),
      INITCAP(REGEXP_REPLACE(SPLIT_PART(u.email, '@', 1), '[._-]+', ' ', 'g')),
      'Unknown'
    ) AS collaborator_name
  FROM public.skill_shares ss
  JOIN auth.users u
    ON u.id = ss.user_id
  WHERE ss.skill_id = _skill_id
    AND (
      public.user_owns_skill(auth.uid(), _skill_id)
      OR public.user_has_skill_share(auth.uid(), _skill_id)
    )
  ORDER BY ss.created_at ASC;
$$;

REVOKE ALL ON FUNCTION public.get_received_invitations_enriched() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_received_invitations_enriched() TO authenticated;

REVOKE ALL ON FUNCTION public.get_skill_collaborators_enriched(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_skill_collaborators_enriched(uuid) TO authenticated;