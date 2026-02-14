
export type Page = 'login' | 'square' | 'submit' | 'details' | 'me' | 'inbox';
export type Language = 'en' | 'zh';
export type Theme = 'light' | 'dark';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  category: string;
  images?: string[];
  created_at: string;
  updated_at: string;

  // Joints
  author?: Profile;
  likes: number;     // calculated count
  hugs: number;      // calculated count
  slaps: number;     // calculated count
  commentsCount: number; // calculated count
  user_reaction?: 'like' | 'hug' | 'slap'; // current user's reaction
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;

  // Joints
  author?: Profile;
}

export interface Notification {
  id: string;
  type: 'hug' | 'slap' | 'like' | 'system' | 'comment';
  user: string;
  avatar: string;
  time: string;
  content: string;
  read: boolean;
}
