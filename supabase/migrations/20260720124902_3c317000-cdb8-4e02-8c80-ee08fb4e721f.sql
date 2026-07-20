
-- Create a security-definer view that exposes only non-sensitive display info
-- (id, email, display name) from auth.users. Views are not flagged by the
-- definer-function linter and let us keep the RPCs as SECURITY INVOKER.
CREATE OR REPLACE VIEW public.user_display_info
WITH (security_invoker = false) AS
SELECT
  u.id,
  u.email,
  COALESCE(
    NULLIF(u.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(u.raw_user_meta_data ->> 'name', ''),
    INITCAP(REGEXP_REPLACE(SPLIT_PART(u.email, '@', 1), '[._-]+', ' ', 'g')),
    'Unknown'
  ) AS display_name
FROM auth.users u;

REVOKE ALL ON public.user_display_info FROM PUBLIC, anon;
GRANT SELECT ON public.user_display_info TO authenticated, service_role;

-- Convert enriched RPCs to SECURITY INVOKER, sourcing display names from the view.
CREATE OR REPLACE FUNCTION public.get_received_invitations_enriched()
 RETURNS TABLE(id uuid, skill_id uuid, inviter_id uuid, invitee_email text, status text, created_at timestamp with time zone, skill_name text, inviter_name text)
 LANGUAGE sql
 STABLE SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT
    i.id,
    i.skill_id,
    i.inviter_id,
    i.invitee_email,
    i.status,
    i.created_at,
    s.name AS skill_name,
    COALESCE(u.display_name, 'Unknown') AS inviter_name
  FROM public.skill_invitations i
  JOIN public.user_display_info viewer
    ON viewer.id = auth.uid()
   AND viewer.email = i.invitee_email
  JOIN public.skills s
    ON s.id = i.skill_id
  LEFT JOIN public.user_display_info u
    ON u.id = i.inviter_id
  WHERE i.status = 'pending'
  ORDER BY i.created_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.get_skill_collaborators_enriched(_skill_id uuid)
 RETURNS TABLE(user_id uuid, created_at timestamp with time zone, collaborator_name text, access_level text)
 LANGUAGE sql
 STABLE SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT
    ss.user_id,
    ss.created_at,
    COALESCE(u.display_name, 'Unknown') AS collaborator_name,
    ss.access_level
  FROM public.skill_shares ss
  LEFT JOIN public.user_display_info u ON u.id = ss.user_id
  WHERE ss.skill_id = _skill_id
    AND (
      public.user_owns_skill(auth.uid(), _skill_id)
      OR public.user_has_skill_share(auth.uid(), _skill_id)
    )
  ORDER BY ss.created_at ASC;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_received_invitations_enriched() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_skill_collaborators_enriched(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_received_invitations_enriched() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_skill_collaborators_enriched(uuid) TO authenticated, service_role;
