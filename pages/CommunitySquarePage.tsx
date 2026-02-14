
import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { Page, Post } from '../types';

interface CommunitySquarePageProps {
  posts: any[]; // Using any temporarily to handle the mapped posts from App.tsx
  onNavigate: (page: Page, id?: string) => void;
  onAdd: () => void;
  onUpdatePost: (id: string, updates: Partial<Post>) => void;
  onActionAuth: (action: () => void) => void;
  t: any;
  currentPage: Page;
  initialScrollTop?: number;
  onSaveScroll?: (pos: number) => void;
  onRefresh?: () => Promise<void>;
}

const CommunitySquarePage: React.FC<CommunitySquarePageProps> = ({
  posts, onNavigate, onAdd, onUpdatePost, onActionAuth, t, currentPage,
  initialScrollTop = 0, onSaveScroll, onRefresh
}) => {
  const [filter, setFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullMoveY, setPullMoveY] = useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Restore scroll position on mount
  React.useLayoutEffect(() => {
    if (scrollRef.current && initialScrollTop > 0) {
      scrollRef.current.scrollTop = initialScrollTop;
    }
  }, []);

  const filteredPosts = filter === 'All' ? posts : posts.filter(p => p.category.includes(filter));

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      setPullStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pullStartY) return;
    const touchY = e.touches[0].clientY;
    const diff = touchY - pullStartY;

    if (diff > 0 && scrollRef.current?.scrollTop === 0) {
      setPullMoveY(diff);
      // e.preventDefault(); // preventing default here might block normal scrolling if not careful
    }
  };

  const handleTouchEnd = async () => {
    if (pullMoveY > 80) { // Threshold for refresh
      setIsRefreshing(true);
      setPullMoveY(80); // Snap to loading position
      if (onRefresh) {
        await onRefresh();
      }
      setTimeout(() => {
        setIsRefreshing(false);
        setPullMoveY(0);
        setPullStartY(0);
      }, 500);
    } else {
      setPullMoveY(0);
      setPullStartY(0);
    }
  };

  const handleAction = (e: React.MouseEvent, id: string, type: 'likes' | 'hugs' | 'slaps') => {
    e.stopPropagation();
    onActionAuth(() => {
      const post = posts.find(p => p.id === id);
      if (post) {
        onUpdatePost(id, { [type]: post[type] + 1 });
      }
    });
  };

  const handlePostClick = (id: string) => {
    if (onSaveScroll && scrollRef.current) {
      onSaveScroll(scrollRef.current.scrollTop);
    }
    onNavigate('details', id);
  };


  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between px-4 pt-10 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl font-bold">psychology</span>
            <h2 className="text-xl font-extrabold tracking-tight">{t.communitySquare}</h2>
          </div>
          <button
            onClick={() => onNavigate('inbox')}
            className="relative flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-2xl">mail</span>
          </button>
        </div>
        <div className="px-4 pb-4">
          <label className="relative flex h-11 w-full items-center overflow-hidden rounded-xl bg-slate-200/50 dark:bg-surface-dark-lighter transition-all focus-within:ring-2 focus-within:ring-primary/50">
            <div className="flex h-full items-center justify-center pl-4 text-gray-400">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input className="h-full w-full border-none bg-transparent px-3 text-sm focus:outline-none focus:ring-0" placeholder={t.searchRants} />
          </label>
        </div>
      </header>

      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto pb-24 no-scrollbar relative transition-transform duration-200 ease-out"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateY(${Math.min(pullMoveY * 0.4, 100)}px)` }} // resistance effect
      >
        {/* Refresh Indicator */}
        {pullMoveY > 0 && (
          <div className="absolute -top-10 left-0 w-full flex justify-center items-center h-10 text-slate-400">
            {isRefreshing ? (
              <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
            ) : (
              <span className={`material-symbols-outlined transition-transform duration-200 ${pullMoveY > 80 ? 'rotate-180' : ''}`}>arrow_downward</span>
            )}
          </div>
        )}
        {/* ... content ... */}
        <section className="flex flex-col">
          {filteredPosts.map(post => (
            <article
              key={post.id}
              onClick={() => handlePostClick(post.id)}
              className="bg-white dark:bg-background-dark p-4 border-b border-gray-100 dark:border-white/5 active:bg-slate-50 dark:active:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <img src={post.avatar} alt={post.author} className="size-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{post.author}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">{post.time} · {post.category}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 line-clamp-3">{post.content}</p>
                  </div>
                  {post.images && post.images.length > 0 && (
                    <div className="mt-3">
                      <img
                        src={post.images[0]}
                        alt="Post thumbnail"
                        className="h-24 w-auto rounded-lg object-cover border border-slate-100 dark:border-white/10"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 dark:border-white/5 pt-3">
                    <button onClick={(e) => handleAction(e, post.id, 'hugs')} className="flex items-center gap-1.5 text-pink-500 active:scale-90 transition-transform">
                      <span className="material-symbols-outlined text-[18px] fill-1">diversity_1</span>
                      <span className="text-xs font-bold">{post.hugs}</span>
                    </button>
                    <button onClick={(e) => handleAction(e, post.id, 'slaps')} className="flex items-center gap-1.5 text-orange-500 active:scale-90 transition-transform">
                      <span className="material-symbols-outlined text-[18px]">back_hand</span>
                      <span className="text-xs font-bold">{post.slaps}</span>
                    </button>
                    <button onClick={(e) => handleAction(e, post.id, 'likes')} className="flex items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
                      <span className="material-symbols-outlined text-[18px]">favorite</span>
                      <span className="text-xs font-bold">{post.likes}</span>
                    </button>
                    <div className="text-slate-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                      <span className="text-xs font-bold">{post.commentsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* FAB removed and moved to App.tsx */}
      {/* BottomNav moved to App.tsx */}
    </div>
  );
};

export default CommunitySquarePage;
