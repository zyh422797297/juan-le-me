-- Seed Data Script for JuanLeMe (v3 - Multi-language & Enhanced)
-- Run this in Supabase SQL Editor.

-- 0. Allow fake users
alter table public.profiles drop constraint if exists profiles_id_fkey;

-- 0.5 CLEANUP: Remove all old data to ensure only new realistic data remains
truncate table public.profiles, public.posts, public.comments, public.reactions cascade;

-- 1. Helper Functions
create or replace function random_elem(arr text[]) returns text as $$
  select arr[floor(random() * array_length(arr, 1) + 1)];
$$ language sql;

create or replace function random_int(min int, max int) returns int as $$
  select floor(random() * (max - min + 1) + min)::int;
$$ language sql;

-- 2. Create Diverse Mock Users (Mixed Languages)
do $$
declare
  i int;
  user_id uuid;
  roles_en text[] := array['Student', 'Intern', 'Dev', 'Manager', 'CEO', 'Freelancer', 'Rider', 'Teacher', 'Nurse', 'Sales'];
  roles_cn text[] := array['学生', '实习生', '程序员', '产品经理', '老板', '自由职业者', '外卖小哥', '教师', '护士', '销售'];
  role text;
  avatar_img text;
begin
  for i in 1..80 loop -- Create 80 mock users
    user_id := uuid_generate_v4();
    
    -- Realistic Avatar (Men/Women mixed)
    if random() > 0.5 then
       avatar_img := 'https://randomuser.me/api/portraits/men/' || floor(random() * 90) || '.jpg';
    else
       avatar_img := 'https://randomuser.me/api/portraits/women/' || floor(random() * 90) || '.jpg';
    end if;

    if i <= 40 then
       -- English Name (First + Last)
       role := random_elem(array['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra']) || ' ' || random_elem(array['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']);
    else
       -- Chinese Name (Real names)
       role := random_elem(array['张伟', '王芳', '李娜', '王秀英', '李伟', '王丽', '张静', '张敏', '李强', '张丽', '王静', '王敏', '李军', '张杰', '李霞', '王军', '张艳', '李杰', '王勇', '张涛', '陈静', '李明', '杨军', '王刚', '张勇', '赵军', '张兰', '李兰', '王平', '赵丽']);
    end if;

    insert into public.profiles (id, username, avatar_url)
    values (
      user_id,
      role,
      avatar_img
    ) on conflict do nothing;
  end loop;
end;
$$;

-- 3. Generate Posts (Mix of EN and CN)
do $$
declare
  p_id uuid;
  u_id uuid;
  post_cat text;
  post_imgs text[];
  i int;
  j int;
  k int;
  
  -- EN Rants
  rants_en text[] := array[
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

  -- CN Rants (被卷)
  rants_cn text[] := array[
    '老板让我在下班前交方案，现在是晚上10点。🤷‍♂️',
    '实习三个月了，还在帮导师拿快递，什么都没学到。',
    '35岁被裁员，投了一百份简历，只要35岁以下的。互联网没有记忆。',
    '因为没给教授送礼，期末直接挂科了，这就是象牙塔吗？',
    '暴雨送外卖超时两分钟，平台扣了我一半配送费，客户还给了差评。',
    '甲方说预算500块要做个淘宝，还要源码。做梦比较快。',
    '每天996，工资还不够在五环外租个单间。',
    '同事拿我的代码去邀功，升职加薪了，我还在原地踏步。',
    '体检报告出来了，全是红箭头。拿命换钱值得吗？',
    '带的新人倒挂我的工资，这班是一天也上不下去了。'
  ];

  -- EN Wins
  wins_en text[] := array[
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

  -- CN Wins (卷赢)
  wins_cn text[] := array[
    '刚拿下了千万级的大单，这几个通宵值了！🚀',
    '今天刷了20道LeetCode，离大厂Offer又近了一步。',
    '团队周末全员加班，项目提前上线，老板发了大红包！',
    '写了个脚本自动处理报表，每天摸鱼8小时，爽歪歪。',
    '优化了团队结构，裁掉了小白兔，效率提升30%。',
    '手握三个大厂Offer，谁说行情不好？强者恒强。',
    '副业收入超过主业了，准备裸辞创业！',
    '一个月啃完了所有专业书，奖学金稳了。',
    '基金回本了还赚了50%，躺平赚钱真香。',
    '干掉了部门经理，现在我坐他的位置。实力说话。'
  ];

  images text[] := array[
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500',
    'https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=500',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500'
  ];

  cats_en text[] := array['Workplace', 'Tech', 'University', 'Daily Life', 'Freelance'];
  cats_cn text[] := array['职场', '互联网', '校园', '日常生活', '自由职业'];
  
begin
  -- 1. Create 50 EN Rants
  for i in 1..50 loop
    select id into u_id from profiles order by random() limit 1;
    if random() < 0.3 then post_imgs := array[random_elem(images)]; else post_imgs := null; end if;
    
    insert into posts (author_id, content, category, images, created_at)
    values (u_id, random_elem(rants_en) || ' #Tired', random_elem(cats_en), post_imgs, now() - (random() * interval '60 days')) returning id into p_id;
    
    -- Interactions
    for j in 1..random_int(5, 20) loop
      select id into u_id from profiles order by random() limit 1;
      insert into comments (post_id, author_id, content) values (p_id, u_id, 'So true!');
    end loop;
    for k in 1..random_int(5, 20) loop
       select id into u_id from profiles order by random() limit 1;
       begin insert into reactions (user_id, post_id, type) values (u_id, p_id, 'hug'); exception when others then null; end;
    end loop;
  end loop;

  -- 2. Create 50 CN Rants
  for i in 1..50 loop
    select id into u_id from profiles order by random() limit 1;
    if random() < 0.3 then post_imgs := array[random_elem(images)]; else post_imgs := null; end if;
    
    insert into posts (author_id, content, category, images, created_at)
    values (u_id, random_elem(rants_cn) || ' #心累', random_elem(cats_cn), post_imgs, now() - (random() * interval '60 days')) returning id into p_id;

     -- Interactions
    for j in 1..random_int(5, 20) loop
      select id into u_id from profiles order by random() limit 1;
      insert into comments (post_id, author_id, content) values (p_id, u_id, random_elem(array['太真实了', '抱抱', '快跑', '感同身受', '哎']));
    end loop;
    for k in 1..random_int(5, 20) loop
       select id into u_id from profiles order by random() limit 1;
       begin insert into reactions (user_id, post_id, type) values (u_id, p_id, 'hug'); exception when others then null; end;
    end loop;
  end loop;

  -- 3. Create 30 EN Wins
  for i in 1..30 loop
    select id into u_id from profiles order by random() limit 1;
    insert into posts (author_id, content, category, created_at)
    values (u_id, random_elem(wins_en) || ' #Win', random_elem(cats_en), now() - (random() * interval '60 days')) returning id into p_id;
    -- Interactions (Likes)
    for k in 1..random_int(10, 40) loop
       select id into u_id from profiles order by random() limit 1;
       begin insert into reactions (user_id, post_id, type) values (u_id, p_id, 'like'); exception when others then null; end;
    end loop;
  end loop;

  -- 4. Create 30 CN Wins
  for i in 1..30 loop
    select id into u_id from profiles order by random() limit 1;
    insert into posts (author_id, content, category, created_at)
    values (u_id, random_elem(wins_cn) || ' #赢麻了', random_elem(cats_cn), now() - (random() * interval '60 days')) returning id into p_id;
    -- Interactions (Likes)
    for k in 1..random_int(10, 40) loop
       select id into u_id from profiles order by random() limit 1;
       begin insert into reactions (user_id, post_id, type) values (u_id, p_id, 'like'); exception when others then null; end;
    end loop;
  end loop;

end;
$$;

-- 5. REPAIR: Ensure real users (from auth.users) exist in profiles
-- This fixes the issue where truncate deletes the currently logged-in user
insert into public.profiles (id, username, avatar_url)
select 
  id, 
  coalesce(raw_user_meta_data->>'username', 'Real User'),
  coalesce(raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || id)
from auth.users
where id not in (select id from public.profiles);
