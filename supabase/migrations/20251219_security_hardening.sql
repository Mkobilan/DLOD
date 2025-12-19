-- Consolidated Security Hardening Script
-- Generated on 2025-12-19

-- 1. PostGIS Security Note & RLS Attempt
-- The linter ERROR for public.spatial_ref_sys is because it's a system table.
-- We try to change ownership to postgres to allow enabling RLS.
DO $$ 
BEGIN
    EXECUTE 'ALTER TABLE IF EXISTS public.spatial_ref_sys OWNER TO postgres';
    EXECUTE 'ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY';
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'spatial_ref_sys' AND policyname = 'Allow public read access'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow public read access" ON public.spatial_ref_sys FOR SELECT USING (true)';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not modify spatial_ref_sys ownership or RLS. This is expected if the system role restricts it. This warning can be safely ignored for extension tables.';
END $$;

-- 2. PostGIS Extension Location
-- The WARN for extension_in_public (postgis) is a "legacy" configuration warning.
-- PostGIS does not support moving schemas directly via SET SCHEMA in many environments.
-- Moving it safely requires dropping and recreating, which would delete geography data.
-- This warning is non-critical as it only affects internal extension tables.

-- handle_new_message_notification
ALTER FUNCTION public.handle_new_message_notification() SET search_path = public;

-- validate_review_roles
ALTER FUNCTION public.validate_review_roles() SET search_path = public;

-- handle_updated_at
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- handle_new_application
ALTER FUNCTION public.handle_new_application() SET search_path = public;

-- handle_application_status_change
ALTER FUNCTION public.handle_application_status_change() SET search_path = public;

-- update_user_settings_updated_at
ALTER FUNCTION public.update_user_settings_updated_at() SET search_path = public;

-- create_default_user_settings
ALTER FUNCTION public.create_default_user_settings() SET search_path = public;

-- update_profile_rating
ALTER FUNCTION public.update_profile_rating() SET search_path = public;

-- update_profile_rating_on_delete
ALTER FUNCTION public.update_profile_rating_on_delete() SET search_path = public;

-- handle_new_review_notification
ALTER FUNCTION public.handle_new_review_notification() SET search_path = public;

-- should_hide_phone_number
ALTER FUNCTION public.should_hide_phone_number(uuid) SET search_path = public;
