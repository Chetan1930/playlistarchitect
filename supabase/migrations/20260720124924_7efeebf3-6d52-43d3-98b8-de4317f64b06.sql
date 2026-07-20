
-- Drop the view that exposed auth.users
DROP VIEW IF EXISTS public.user_display_info;

-- Public profiles table (id references auth user id but with no FK, per Supabase guidance)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Backfill from existing auth.users
INSERT INTO public.profiles (id, email, display_name)
SELECT
  u.id,
  u.email,
  COALESCE(
    NULLIF(u.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(u.raw_user_meta_data ->> 'name', ''),
    INITCAP(REGEXP_REPLACE(SPLIT_PART(u.email, '@', 1), '[._-]+', ' ', 'g')),
    'Unknown'
  )
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- Trigger to keep profiles in sync with auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
      INITCAP(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[._-]+', ' ', 'g')),
      'Unknown'
    )
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update enriched RPCs to SECURITY INVOKER using public.profiles
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
    COALESCE(p.display_name, 'Unknown') AS inviter_name
  FROM public.skill_invitations i
  JOIN public.profiles viewer
    ON viewer.id = auth.uid()
   AND viewer.email = i.invitee_email
  JOIN public.skills s
    ON s.id = i.skill_id
  LEFT JOIN public.profiles p
    ON p.id = i.inviter_id
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
    COALESCE(p.display_name, 'Unknown') AS collaborator_name,
    ss.access_level
  FROM public.skill_shares ss
  LEFT JOIN public.profiles p ON p.id = ss.user_id
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

-- updated_at trigger for profiles
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
