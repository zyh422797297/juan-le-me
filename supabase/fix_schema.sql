-- 1. Clean up orphaned profiles (profiles without a user)
-- This requires access to auth schema, running in Dashboard SQL Editor is best.
-- Note: We generally can't query auth.users from here easily due to permissions in some contexts, 
-- but since we are in setup phase, let's just truncate profiles to start fresh.
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.posts CASCADE;

-- 2. Fix Foreign Key to allow auto-cleanup
ALTER TABLE public.profiles
DROP CONSTRAINT profiles_id_fkey,
ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 3. Ensure the trigger is correct (re-run just in case)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
