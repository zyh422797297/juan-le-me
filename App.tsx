
import React, { useState, useMemo, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import CommunitySquarePage from './pages/CommunitySquarePage';
import SubmitStoryPage from './pages/SubmitStoryPage';
import PostDetailsPage from './pages/PostDetailsPage';
import MePage from './pages/MePage';
import InboxPage from './pages/InboxPage';
import BottomNav from './components/BottomNav';
import { Page, Post, Language, Theme } from './types';
import { translations } from './translations';
import { supabase } from './src/lib/supabaseClient';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('square');
  const [session, setSession] = useState<any>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [squareScrollPos, setSquareScrollPos] = useState(0);

  const t = translations[language];

  // Theme application
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auth State Listener
  useEffect(() => {
    // Cast to any to bypass potential type mismatch in older/newer SDK versions
    (supabase.auth as any).getSession().then(({ data: { session } }: any) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = (supabase.auth as any).onAuthStateChange((_event: string, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Posts
  const fetchPosts = async () => {
    setLoading(true);

    try {
      // 1. Get raw posts (Limit 20 for performance)
      const { data: rawPosts, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
        return;
      }

      if (!rawPosts || rawPosts.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // 2. Batch fetch stats (Optimization: 2 requests instead of N*4)
      const postIds = rawPosts.map(p => p.id);

      const { data: allReactions } = await supabase
        .from('reactions')
        .select('post_id, type')
        .in('post_id', postIds);

      const { data: allComments } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds);

      // 3. Map counts
      const postsWithCounts = rawPosts.map((p: any) => {
        const pReactions = allReactions?.filter(r => r.post_id === p.id) || [];
        const pComments = allComments?.filter(c => c.post_id === p.id) || [];

        return {
          ...p,
          likes: pReactions.filter((r: any) => r.type === 'like').length,
          hugs: pReactions.filter((r: any) => r.type === 'hug').length,
          slaps: pReactions.filter((r: any) => r.type === 'slap').length,
          commentsCount: pComments.length,
          author: p.author
        } as Post;
      });

      // Calculate Heat Score and Sort
      // Formula: (Interactions) / (Time + 2)^Gravity
      const sortedPosts = postsWithCounts.sort((a: any, b: any) => {
        const getScore = (p: any) => {
          const interactions = (p.likes || 0) + (p.hugs || 0) + (p.slaps || 0) + (p.commentsCount || 0) * 2;
          const hoursAgo = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60);
          return (interactions + 1) / Math.pow(hoursAgo + 2, 1.5);
        };
        return getScore(b) - getScore(a);
      });

      setPosts(sortedPosts);
    } catch (err) {
      console.error('Unexpected error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage === 'square') {
      fetchPosts();
    }
  }, [currentPage]);


  const navigate = (page: Page, id?: string) => {
    console.log('Navigating to:', page, 'ID:', id, 'Session:', !!session);
    if (!session && (page === 'inbox' || page === 'submit' || page === 'me')) {
      console.log('Redirecting to login because no session');
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
    if (id) setSelectedPostId(id);
  };

  const handleActionAuth = (action: () => void) => {
    if (!session) {
      alert(t.interactionRequired);
      setCurrentPage('login');
    } else {
      action();
    }
  };

  const handleAddPost = async (newPost: Partial<Post>) => {
    if (!session?.user) {
      alert("Please log in to post!");
      return;
    }

    // Show loading indicator or simple alert for now if needed, 
    // but usually navigating away is enough feedback.

    // Debug: console.log("Submitting post:", newPost);

    const { error } = await supabase
      .from('posts')
      .insert({
        content: newPost.content,
        category: newPost.category || 'Workplace',
        images: newPost.images || [],
        author_id: session.user.id
      });

    if (error) {
      console.error("Error creating post", error);
      alert("Failed to create post: " + error.message);
    } else {
      // Refresh posts and go back to square
      await fetchPosts();
      setCurrentPage('square');
    }
  };

  const handleToggleReaction = async (postId: string, type: 'like' | 'hug' | 'slap') => {
    if (!session?.user) {
      alert("Please log in to react!");
      setCurrentPage('login');
      return;
    }

    const userId = session.user.id;

    // Optimistic Update
    const oldPosts = [...posts];
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;

      const isReacting = p.user_reaction !== type; // If not same type, we are reacting (or switching)
      // Note: Simple toggle logic for now. 
      // If we want to allow multiple reaction types per user/post (like + hug), we need different logic.
      // But database constraint `unique(user_id, post_id, type)` allows one of EACH type.
      // However, typical UI often allows only ONE reaction or toggles them.
      // Let's assume we allow multiple different reactions (Like AND Hug) for now, based on schema.
      // Wait, UI usually highlights the active one. 
      // Let's implement simpler TOGGLE for specific type. 

      // Determine if we assume the user already reacted with this type?
      // We don't have `user_reactions` map in Post type yet fully populated for all types.
      // Let's assume input implies "Add 1".
      // Actually, standard "Like" button is toggle.
      // For now, let's just INSERT and ignore duplicates (or handle safety).
      // But User wants persistence.

      return {
        ...p,
        [type + 's']: (p as any)[type + 's'] + 1 // Simply increment for optimistic feedback
      };
    }));

    try {
      // Check if reaction exists
      const { data: existing } = await supabase
        .from('reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('type', type)
        .single();

      if (existing) {
        // Remove reaction
        await supabase.from('reactions').delete().eq('id', existing.id);
        // Revert/Decrement optimistic (refine this later for accurate toggle state)
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, [type + 's']: Math.max(0, (p as any)[type + 's'] - 2) } : p)); // -2 because we added 1 tentatively
      } else {
        // Add reaction
        await supabase.from('reactions').insert({
          post_id: postId,
          user_id: userId,
          type: type
        });
        // Optimistic was correct (added 1)
      }

      // Ideally re-fetch to sync exact counts
      // fetchPosts(); // Optional: might be too heavy.
    } catch (err) {
      console.error("Error toggling reaction", err);
      setPosts(oldPosts); // Revert on error
    }
  };


  const handleUpdatePost = async (postId: string, updates: Partial<Post>) => {
    const typeKey = Object.keys(updates)[0];
    if (typeKey && ['likes', 'hugs', 'slaps'].includes(typeKey)) {
      const type = typeKey.replace('s', '') as 'like' | 'hug' | 'slap';
      await handleToggleReaction(postId, type);
    }
  };

  const selectedPost = useMemo(() => posts.find(p => p.id === selectedPostId) || null, [posts, selectedPostId]);

  // Create a version of selectedPost that guarantees properties needed for details page
  const safeSelectedPost = selectedPost ? {
    ...selectedPost,
    author: selectedPost.author?.username || 'Unknown',
    authorId: selectedPost.author_id,
    avatar: selectedPost.author?.avatar_url || 'https://picsum.photos/seed/unknown/100/100',
    time: new Date(selectedPost.created_at).toLocaleString(),
    comments: [] // We fetch comments separately in details page usually
  } : null;

  // We need to map our new Post type to the old shape expected by components until refactored
  const mappedPosts = posts.map(p => ({
    ...p,
    author: p.author?.username || 'Unknown',
    authorId: p.author_id,
    avatar: p.author?.avatar_url || 'https://picsum.photos/seed/default/100/100', // fallback
    time: new Date(p.created_at).toLocaleDateString(),
    comments: []
  }));

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage
          onLogin={() => {
            /* session handled by auth listener */
            navigate('square');
          }}
          t={t}
        />;
      case 'square':
        return <CommunitySquarePage
          posts={mappedPosts}
          onNavigate={(p, id) => navigate(p, id)}
          onAdd={() => navigate('submit')}
          onUpdatePost={handleUpdatePost}
          onActionAuth={handleActionAuth}
          onRefresh={fetchPosts}
          t={t}
          currentPage={currentPage}
          initialScrollTop={squareScrollPos}
          onSaveScroll={(pos) => setSquareScrollPos(pos)}
        />;
      case 'inbox':
        return <InboxPage onNavigate={navigate} t={t} currentPage={currentPage} userId={session?.user?.id} />;
      case 'submit':
        return <SubmitStoryPage
          onBack={() => navigate('square')}
          onSubmit={handleAddPost}
          t={t}
        />;
      case 'details':
        return <PostDetailsPage
          post={safeSelectedPost}
          onBack={() => navigate('square')}
          onUpdatePost={(id, updates) => {
            const type = Object.keys(updates)[0]?.replace('s', '') as 'like' | 'hug' | 'slap';
            if (type) handleToggleReaction(id, type);
          }}
          onAddComment={(id, content) => {
            // This is now handled internally in PostDetailsPage, but we keep the prop for compatibility if needed
            console.log('Comment added:', id, content);
          }}
          onActionAuth={handleActionAuth}
          t={t}
        />;
      case 'me':
        return <MePage
          onNavigate={navigate}
          onLogout={async () => {
            await (supabase.auth as any).signOut();
            setSession(null);
            setCurrentPage('login');
          }}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          t={t}
          currentPage={currentPage}
          isLoggedIn={!!session}
          onLogin={() => navigate('login')}
          posts={mappedPosts}
          userId={session?.user?.id}
        />;
      default:
        // Default to square if unknown page
        return <CommunitySquarePage
          posts={mappedPosts}
          onNavigate={(p, id) => navigate(p, id)}
          onAdd={() => navigate('submit')}
          onUpdatePost={handleUpdatePost}
          onActionAuth={handleActionAuth}
          onRefresh={fetchPosts}
          t={t}
          currentPage={currentPage}
          initialScrollTop={squareScrollPos}
          onSaveScroll={(pos) => setSquareScrollPos(pos)}
        />;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      {renderPage()}

      {/* Global Bottom Navigation */}
      {(currentPage === 'square' || currentPage === 'me' || currentPage === 'inbox') && (
        <BottomNav
          currentPage={currentPage}
          onNavigate={(p) => navigate(p)}
          onAddClick={() => handleActionAuth(() => navigate('submit'))}
          t={t}
        />
      )}
    </div>
  );
};

export default App;
