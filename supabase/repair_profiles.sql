-- SQL to fix missing profiles for existing Auth users
-- Run this in your Supabase SQL Editor to restore your user profile that was deleted by the seed script.

insert into public.profiles (id, username, avatar_url)
select 
  id, 
  coalesce(raw_user_meta_data->>'username', 'Real User'),
  coalesce(raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || id)
from auth.users
where id not in (select id from public.profiles);

-- Verify the fix
select count(*) as "Restored Profiles" from public.profiles where id in (select id from auth.users);
