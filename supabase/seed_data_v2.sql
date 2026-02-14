-- Seed Data Script for JuanLeMe (Enhanced & Fixed)
-- Run this in Supabase SQL Editor.

-- IMPORTANT: This script will DROP the foreign key constraint between profiles and auth.users
-- to allow creating "fake" users for demonstration purposes.

-- 0. Allow fake users by removing the strict link to auth.users
alter table public.profiles drop constraint if exists profiles_id_fkey;

-- 1. Helper Function: Random Element from Array
create or replace function random_elem(arr text[]) returns text as $$
  select arr[floor(random() * array_length(arr, 1) + 1)];
$$ language sql;

create or replace function random_int(min int, max int) returns int as $$
  select floor(random() * (max - min + 1) + min)::int;
$$ language sql;

-- 2. Create Diverse Mock Users
do $$
declare
  i int;
  user_id uuid;
  roles text[] := array['Student', 'Intern', 'Junior Dev', 'Senior Dev', 'Manager', 'CEO', 'Freelancer', 'Delivery Rider', 'Teacher', 'Nurse', 'Sales'];
begin
  for i in 1..40 loop -- Create 40 mock users
    user_id := uuid_generate_v4();
    insert into public.profiles (id, username, avatar_url)
    values (
      user_id,
      random_elem(roles) || '_' || i,
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || i
    ) on conflict do nothing;
  end loop;
end;
$$;

-- 3. Generate Posts
do $$
declare
  p_id uuid;
  u_id uuid;
  post_cat text;
  post_imgs text[];
  i int;
  j int;
  k int;
  
  -- "Being Rolled" (Passive/Complain) Scenarios
  rants text[] := array[
    'Boss called at 10pm asking for a report by 8am tomorrow. Is this legal?',
    'My internship is just making coffee and being yelled at.',
    '35 years old and just got laid off. Tech industry is cruel.',
    'Professor failed me because I didn''t buy his book.',
    'Delivery platform fined me for being 1 minute late in the rain.',
    'Client wants a "Facebook clone" for $500. Freelancing is a joke.',
    'Working 996 but can''t afford rent in Beijing.',
    'Colleague stole my credit for the project presentation.',
    'Health check came back with distinct warnings. The stress is killing me.',
    'Just realized I earn less than the new grad I''m training.'
  ];

  -- "Rolling Others" (Active/Showoff/Competitive) Scenarios
  wins text[] := array[
    'Just secured a million dollar contract. Sleep is for the weak.',
    'Studied 16 hours today. I will be top of the class.',
    'My team worked all weekend but we shipped on time. Leadership!',
    'Automated my job and didn''t tell anyone. Easy money.',
    'Just fired the low performers. Efficiency is up 20%.',
    'Three job offers in hand. The market is hot if you are good.',
    'Launched my startup while keeping my day job. Hustle hard.',
    'Completed 100 LeetCode hards this month. Checking off goals.',
    'My portfolio gained 50% this month. Passive income is key.',
    'Managed to get the promotion over my senior. Performance matters.'
  ];

  images text[] := array[
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500',
    'https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=500',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500'
  ];

  cats text[] := array['Workplace', 'Tech', 'University', 'Daily Life', 'Freelance'];
  
begin
  -- 50 "Being Rolled" Posts
  for i in 1..50 loop
    select id into u_id from profiles order by random() limit 1;
    
    -- 30% chance of having an image
    if random() < 0.3 then
       post_imgs := array[random_elem(images)];
    else
       post_imgs := null;
    end if;

    insert into posts (author_id, content, category, images, created_at)
    values (
      u_id, 
      random_elem(rants) || ' #' || random_elem(array['Tired', 'Rant', 'Burnout']), 
      random_elem(cats),
      post_imgs,
      now() - (random() * interval '60 days')
    ) returning id into p_id;

    -- Generate Comments (10-30 per post)
    for j in 1..random_int(10, 30) loop
      select id into u_id from profiles order by random() limit 1;
      insert into comments (post_id, author_id, content) values (p_id, u_id, 'Comment '||j);
    end loop;
    
    -- Add some reactions (5-30 per post)
    for k in 1..random_int(5, 30) loop
       select id into u_id from profiles order by random() limit 1;
       begin
         insert into reactions (user_id, post_id, type) values (u_id, p_id, 'hug');
       exception when others then end;
    end loop;

  end loop;

  -- 30 "Rolling Others" Posts
  for i in 1..30 loop
    select id into u_id from profiles order by random() limit 1;
    
    insert into posts (author_id, content, category, created_at)
    values (
      u_id, 
      random_elem(wins) || ' #' || random_elem(array['Win', 'Hustle', 'Success']), 
      random_elem(cats),
      now() - (random() * interval '60 days')
    ) returning id into p_id;
    
    -- Reactions for wins (more likes)
    for k in 1..random_int(5, 30) loop
       select id into u_id from profiles order by random() limit 1;
       begin
         insert into reactions (user_id, post_id, type) values (u_id, p_id, 'like');
       exception when others then end;
    end loop;
  end loop;

end;
$$;
