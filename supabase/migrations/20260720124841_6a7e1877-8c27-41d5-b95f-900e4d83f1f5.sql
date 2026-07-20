
-- Convert RLS helper SECURITY DEFINER functions to SECURITY INVOKER.
-- These helpers only read tables the calling user can already see under RLS,
-- so INVOKER is safe and removes the definer-executable surface for signed-in users.

CREATE OR REPLACE FUNCTION public.user_has_skill_share_write(_user_id uuid, _skill_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.skill_shares
    WHERE user_id = _user_id AND skill_id = _skill_id AND access_level = 'editor'
  )
$function$;

CREATE OR REPLACE FUNCTION public.user_has_skill_share(_user_id uuid, _skill_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.skill_shares
    WHERE user_id = _user_id AND skill_id = _skill_id
  )
$function$;

CREATE OR REPLACE FUNCTION public.user_owns_skill(_user_id uuid, _skill_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.skills
    WHERE id = _skill_id AND user_id = _user_id
  )
$function$;

-- The enriched RPCs (get_received_invitations_enriched, get_skill_collaborators_enriched)
-- must remain SECURITY DEFINER because they read auth.users to resolve display names,
-- and they perform their own authorization checks inside the function body.
-- Ensure execute is scoped strictly to authenticated (required for app RPC use) and service_role.
REVOKE EXECUTE ON FUNCTION public.get_received_invitations_enriched() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_skill_collaborators_enriched(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_received_invitations_enriched() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_skill_collaborators_enriched(uuid) TO authenticated, service_role;
