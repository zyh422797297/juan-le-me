-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- POSTS
create table if not exists posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references profiles(id) not null,
  content text,
  category text,
  images text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table posts enable row level security;

create policy "Posts are viewable by everyone."
  on posts for select
  using ( true );

create policy "Authenticated users can create posts."
  on posts for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update own posts."
  on posts for update
  using ( auth.uid() = author_id );

-- COMMENTS
create table if not exists comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) not null,
  author_id uuid references profiles(id) not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table comments enable row level security;

create policy "Comments are viewable by everyone."
  on comments for select
  using ( true );

create policy "Authenticated users can create comments."
  on comments for insert
  with check ( auth.role() = 'authenticated' );

-- REACTIONS (Likes, Hugs, Slaps)
create table if not exists reactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  post_id uuid references posts(id),
  comment_id uuid references comments(id),
  type text check (type in ('like', 'hug', 'slap')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id, type),
  unique(user_id, comment_id, type)
);

alter table reactions enable row level security;

create policy "Reactions are viewable by everyone."
  on reactions for select
  using ( true );

create policy "Authenticated users can create reactions."
  on reactions for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can delete own reactions."
  on reactions for delete
  using ( auth.uid() = user_id );

-- TRIGGERS
-- Handle new user signup -> create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'username', 'User ' || substr(new.id::text, 1, 6)), 
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://ui-avatars.com/api/?name=User&background=random')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication error on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
