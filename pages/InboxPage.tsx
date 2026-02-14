import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import { Page, Notification } from '../types';
import { supabase } from '../src/lib/supabaseClient';

interface InboxPageProps {
  onNavigate: (page: Page, id?: string) => void;
  t: any;
  currentPage: Page;
  userId?: string;
}

const InboxPage: React.FC<InboxPageProps> = ({ onNavigate, t, currentPage, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      if (!userId) return;

      // 1. Get all posts by current user to find interactions on them
      const { data: userPosts, error: postsError } = await supabase
        .from('posts')
        .select('id, content')
        .eq('author_id', userId);

      if (postsError || !userPosts || userPosts.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const postIds = userPosts.map(p => p.id);
      const postMap = new Map(userPosts.map(p => [p.id, p]));

      // 2. Fetch Comments (not by self)
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id, post_id, content, created_at,
          author:profiles(username, avatar_url)
        `)
        .in('post_id', postIds)
        // .neq('author_id', userId) // Commented out for testing: allow seeing own comments
        .order('created_at', { ascending: false })
        .limit(20);

      // 3. Fetch Reactions (not by self)
      const { data: reactions, error: reactionsError } = await supabase
        .from('reactions')
        .select(`
          id, post_id, type, created_at,
          user:profiles(username, avatar_url)
        `)
        .in('post_id', postIds)
        // .neq('user_id', userId) // Commented out for testing: allow seeing own reactions
        .order('created_at', { ascending: false })
        .limit(20);

      if (commentsError) console.error("Error fetching comments", commentsError);
      if (reactionsError) console.error("Error fetching reactions", reactionsError);

      // 4. Transform and Merge
      const commentNotifs: Notification[] = (comments || []).map((c: any) => {
        const postContent = postMap.get(c.post_id)?.content || 'post';
        return {
          id: c.id,
          type: 'comment',
          user: c.author?.username || 'Unknown',
          avatar: c.author?.avatar_url || 'https://picsum.photos/seed/unknown/100/100',
          time: new Date(c.created_at).toLocaleString(),
          content: `commented: "${c.content}" on "${postContent.substring(0, 10)}..."`,
          read: false,
          postId: c.post_id
        };
      });

      const reactionNotifs: Notification[] = (reactions || []).map((r: any) => {
        let actionText = 'reacted to';
        if (r.type === 'like') actionText = 'liked';
        if (r.type === 'hug') actionText = 'hugged';
        if (r.type === 'slap') actionText = 'slapped';

        const postContent = postMap.get(r.post_id)?.content || 'post';

        return {
          id: r.id,
          type: r.type as any,
          user: r.user?.username || 'Unknown',
          avatar: r.user?.avatar_url || 'https://picsum.photos/seed/unknown/100/100',
          time: new Date(r.created_at).toLocaleString(),
          content: `${actionText} your post "${postContent.substring(0, 10)}..."`,
          read: false,
          postId: r.post_id
        };
      });

      const allNotifs = [...commentNotifs, ...reactionNotifs].sort((a, b) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );

      setNotifications(allNotifs);

    } catch (error) {
      console.error("Error in fetchNotifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (n: Notification) => {
    // In strict type definition Notification doesn't have postId, but we added it in transformation
    // We can cast or update type definition. For now let's just navigate if we have ID.
    if ((n as any).postId) {
      onNavigate('details', (n as any).postId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-28">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/90 backdrop-blur-md px-6 pt-12 pb-4 flex items-center gap-4">
        <button
          onClick={() => onNavigate('square')}
          className="flex size-8 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10 -ml-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight">{t.inbox}</h1>
      </header>

      <main className="flex flex-col">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center gap-2 opacity-50">
            <span className="material-symbols-outlined text-4xl">notifications_off</span>
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className="flex items-start gap-3 p-4 border-b border-slate-50 dark:border-white/5 active:bg-slate-50 dark:active:bg-white/5 transition-colors cursor-pointer"
            >
              <img src={n.avatar} className="size-10 rounded-full shrink-0 object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold truncate">{n.user}</p>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">{n.time}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{n.content}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                {n.type === 'hug' && <span className="text-xl">🫂</span>}
                {n.type === 'slap' && <span className="text-xl">🤚</span>}
                {n.type === 'like' && <span className="text-xl">❤️</span>}
                {n.type === 'comment' && <span className="material-symbols-outlined text-lg text-slate-400">chat_bubble</span>}
                {!n.read && <div className="size-2 bg-primary rounded-full"></div>}
              </div>
            </div>
          ))
        )}
      </main>

      <BottomNav currentPage={currentPage} onNavigate={(p) => onNavigate(p)} onAddClick={() => onNavigate('square')} t={t} />
    </div>
  );
};

export default InboxPage;
