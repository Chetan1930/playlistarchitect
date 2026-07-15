
-- Lock down SECURITY DEFINER functions: revoke from PUBLIC/anon, keep for authenticated + service_role as needed.

REVOKE ALL ON FUNCTION public.user_has_skill_share_write(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_has_skill_share_write(uuid, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.user_has_skill_share(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_has_skill_share(uuid, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.user_owns_skill(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_owns_skill(uuid, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_user_email(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_email(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.get_received_invitations_enriched() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_received_invitations_enriched() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_skill_collaborators_enriched(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_skill_collaborators_enriched(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
