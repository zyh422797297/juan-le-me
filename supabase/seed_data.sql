-- Seed Data Script for JuanLeMe
-- This script generates realistic mock data for testing.
-- Run this in Supabase SQL Editor.

-- 1. Create handy helper functions for random data
create or replace function random_elem(arr text[]) returns text as $$
  select arr[floor(random() * array_length(arr, 1) + 1)];
$$ language sql;

create or replace function random_int(min int, max int) returns int as $$
  select floor(random() * (max - min + 1) + min)::int;
$$ language sql;

-- 2. Create Mock Users (if not exist)
do $$
declare
  i int;
  user_id uuid;
begin
  for i in 1..20 loop
    user_id := uuid_generate_v4();
    -- We can't easily insert into auth.users due to constraints/hashing, 
    -- BUT for testing we can insert into profiles directly if we relax constraints or just mock profiles.
    -- However, better to rely on existing profiles or just create "fake" profiles that strictly don't login.
    -- Let's insert into public.profiles directly with random UUIDs. 
    -- These won't be able to log in, but they work for display.
    
    insert into public.profiles (id, username, avatar_url)
    values (
      user_id,
      'User_' || i || '_' || random_elem(array['Dev', 'PM', 'Designer', 'Intern', 'CEO']),
      'https://ui-avatars.com/api/?background=random&name=User' || i
    ) on conflict do nothing;
  end loop;
end;
$$;

-- 3. Generate Posts (50 "Standard/Being Juan" + 30 "Juaning Others")
do $$
declare
  p_id uuid;
  u_id uuid;
  post_cat text;
  post_content text;
  i int;
  j int;
  k int;
  comment_txt text;
  titles text[] := array[
    'My boss made me work until 3am!',
    'Colleague sabotaged my PR.',
    'Is it normal to cry in the bathroom?',
    'They promised a bonus but gave me pizza.',
    'Promoted but no raise, classic.',
    'Intern is making more than me.',
    'Meeting about a meeting about a meeting.',
    'Deploying on Friday 5pm, wish me luck.',
    'HR ignored my complaint again.',
    'My back hurts from carrying the team.'
  ];
  cats text[] := array['Workplace', 'Tech Sector', 'University', 'Daily Life'];
  reactions text[] := array['like', 'hug', 'slap'];
  
begin
  -- 80 Total posts
  for i in 1..80 loop
    -- Select random author from profiles
    select id into u_id from profiles order by random() limit 1;
    
    -- Content generation
    post_cat := random_elem(cats);
    if i <= 50 then
       -- "Being Juan" (Passive/Victim)
       post_content := '[Rant] ' || random_elem(titles) || ' I feel so tired. ' || md5(random()::text);
    else
       -- "Juaning Others" (Active/Competitive)
       post_content := '[Win] Just crushed the KPI! ' || md5(random()::text) || ' #Hustle #Grind';
    end if;

    insert into posts (author_id, content, category, created_at)
    values (u_id, post_content, post_cat, now() - (random() * interval '30 days'))
    returning id into p_id;

    -- Generate 10-50 Comments per post
    for j in 1..random_int(10, 50) loop
      select id into u_id from profiles order by random() limit 1;
      
      comment_txt := random_elem(array[
        'Hang in there!', 
        'Same here bro.', 
        'This is toxic.', 
        'Quit immediately.', 
        'LOL', 
        'Big hug!', 
        'Have you tried unionizing?',
        'Classic management.',
        'Tech is brutal.',
        'You got this.'
      ]);

      insert into comments (post_id, author_id, content)
      values (p_id, u_id, comment_txt);
    end loop;

    -- Generate Reactions (Random mix)
    -- Randomly add 5-100 reactions
    for k in 1..random_int(5, 100) loop
       select id into u_id from profiles order by random() limit 1;
       
       begin
         insert into reactions (user_id, post_id, type)
         values (u_id, p_id, random_elem(reactions));
       exception when unique_violation then
         -- ignore dupes
       end;
    end loop;

  end loop;
end;
$$;
