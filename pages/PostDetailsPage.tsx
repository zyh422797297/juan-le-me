
import React, { useState, useRef } from 'react';
import { Post, Comment } from '../types';

import { supabase } from '../src/lib/supabaseClient';

interface PostDetailsPageProps {
  post: Post | null;
  onBack: () => void;
  onUpdatePost: (id: string, updates: Partial<Post>) => void;
  onAddComment: (postId: string, content: string) => void;
  onActionAuth: (action: () => void) => void;
  t: any;
}

const PostDetailsPage: React.FC<PostDetailsPageProps> = ({ post, onBack, onUpdatePost, onAddComment, onActionAuth, t }) => {
  const [claimOpen, setClaimOpen] = useState(false);
  const [giftSent, setGiftSent] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (post?.id) {
      const fetchComments = async () => {
        const { data, error } = await supabase
          .from('comments')
          .select('*, author:profiles(username, avatar_url)')
          .eq('post_id', post.id)
          .order('created_at', { ascending: true });

        if (data) {
          const mapped = data.map((c: any) => ({
            id: c.id,
            author: c.author?.username || 'Unknown',
            avatar: c.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + c.author_id,
            content: c.content,
            time: new Date(c.created_at).toLocaleString(),
            likes: Math.floor(Math.random() * 10), // Mock likes for comments for now
            isHot: Math.random() > 0.9
          }));
          setComments(mapped);
        }
      };
      fetchComments();
    }
  }, [post?.id]);

  if (!post) return (
    <div className="h-full flex items-center justify-center p-10 text-center">
      <div>
        <span className="material-symbols-outlined text-5xl text-slate-200">error</span>
        <p className="mt-4 text-slate-400 font-medium">Post missing...</p>
        <button onClick={onBack} className="mt-4 text-primary font-bold">Return to Square</button>
      </div>
    </div>
  );

  const handleAction = (type: 'likes' | 'hugs' | 'slaps') => {
    onActionAuth(() => {
      onUpdatePost(post.id, { [type]: post[type] + 1 });
    });
  };

  const sendGift = (gift: string) => {
    onActionAuth(() => {
      setGiftSent(gift);
      setTimeout(() => setGiftSent(null), 3000);
      setClaimOpen(false);
    });
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;

    onActionAuth(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('comments')
          .insert({
            post_id: post?.id,
            content: commentText,
            author_id: user.id
          })
          .select('*, author:profiles(username, avatar_url)')
          .single();

        if (error) throw error;

        if (data) {
          const newComment = {
            id: data.id,
            author: data.author?.username || 'Me',
            avatar: data.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.id,
            content: data.content,
            time: 'Just now',
            likes: 0,
            isHot: false
          };
          setComments(prev => [...prev, newComment]);
          setCommentText('');

          // Scroll to bottom optionally or just let it be
        }
      } catch (err) {
        console.error('Error submitting comment:', err);
        alert('Failed to send comment. Please try again.');
      }
    });
  };

  const handleReplyToComment = (author: string) => {
    setCommentText(`@${author} `);
    inputRef.current?.focus();
  };

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-hidden relative">
      {/* Gift Toast Notification */}
      {giftSent && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] bg-primary text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="text-2xl">{giftSent}</span>
          <span className="font-bold text-sm">{t.peaceOfferingSent}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center bg-white/90 dark:bg-background-dark/95 backdrop-blur-md px-4 py-3 justify-between border-b border-gray-100 dark:border-white/5">
        <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-base font-bold tracking-tight">{t.rantThread}</h2>
        <button className="flex size-10 items-center justify-center rounded-full active:scale-90">
          <span className="material-symbols-outlined text-slate-400">share</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <article className="flex flex-col w-full">
          {/* Author Info */}
          <div className="flex items-center gap-3 px-5 pt-6 pb-2">
            <div className="relative shrink-0">
              <img src={post.avatar} className="rounded-full size-11 border-2 border-primary object-cover" />
              <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-3 h-3 rounded-full border-2 border-white dark:border-background-dark"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm truncate">{post.author}</p>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-tighter">{t.eliteComrade}</span>
              </div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{post.time} · {post.category}</p>
            </div>
            <button className="text-primary font-bold text-xs bg-primary/10 px-4 py-2 rounded-full active:scale-90 transition-transform">{t.follow}</button>
          </div>

          {/* Post Body */}
          <div className="px-5 pt-4">
            <div className="text-slate-800 dark:text-slate-200 text-base leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* Optional Images */}
          {post.images && post.images.length > 0 && (
            <div className="px-5 mt-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10 shadow-sm">
                <img src={post.images[0]} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Redemption/Gift System */}
          <div className="px-5 mt-8">
            <div className={`bg-gradient-to-br from-slate-900 to-[#1f1629] rounded-2xl border border-slate-700/50 overflow-hidden transition-all shadow-xl ${claimOpen ? 'ring-2 ring-primary' : ''}`}>
              <button
                onClick={() => setClaimOpen(!claimOpen)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-yellow-500/20 rounded-xl text-yellow-500">
                    <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">{t.redemptionTitle}</h3>
                    <p className="text-slate-400 text-[10px] font-medium">{t.redemptionDesc}</p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-slate-400 transition-transform ${claimOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              {claimOpen && (
                <div className="p-5 pt-0 border-t border-white/5 bg-black/20">
                  <p className="text-slate-400 text-[9px] font-black mb-4 mt-4 uppercase tracking-[0.2em]">{t.sendSupport}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['🍔', '☕', '🧋', '🍕', '🍣', '🦞'].map((gift, i) => (
                      <button
                        key={i}
                        onClick={() => sendGift(gift)}
                        className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all active:scale-90"
                      >
                        <span className="text-2xl mb-1">{gift}</span>
                        <span className="text-primary text-[10px] font-black">${(i + 1) * 5}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-around px-5 py-6 mt-4 border-t border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-black/10">
            <button
              onClick={() => handleAction('hugs')}
              className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
            >
              <div className="p-3 bg-pink-100/50 dark:bg-pink-500/10 rounded-2xl text-pink-500 group-hover:bg-pink-100 transition-colors">
                <span className="material-symbols-outlined text-2xl fill-1">diversity_1</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{t.hug} ({post.hugs})</span>
            </button>
            <button
              onClick={() => handleAction('slaps')}
              className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
            >
              <div className="p-3 bg-orange-100/50 dark:bg-orange-600/10 rounded-2xl text-orange-600 group-hover:bg-orange-100 transition-colors">
                <span className="material-symbols-outlined text-2xl">back_hand</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{t.slap} ({post.slaps})</span>
            </button>
            <button
              onClick={() => handleAction('likes')}
              className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
            >
              <div className="p-3 bg-blue-100/50 dark:bg-blue-500/10 rounded-2xl text-blue-500 group-hover:bg-blue-100 transition-colors">
                <span className="material-symbols-outlined text-2xl">favorite</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{t.resist} ({post.likes})</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="px-5 pt-8 pb-2">
            <h3 className="font-extrabold text-lg tracking-tight">{t.comradesVoices} <span className="text-sm font-bold text-slate-400 ml-1">({post.commentsCount})</span></h3>
          </div>

          <div className="flex flex-col pb-12">
            {comments.length > 0 ? comments.map(c => (
              <div key={c.id} className={`flex gap-3 px-5 py-5 border-b border-slate-50 dark:border-white/5 transition-colors ${c.isHot ? 'bg-primary/5' : ''}`}>
                <img src={c.avatar} className="size-10 rounded-full shrink-0 border-2 border-white dark:border-surface-dark shadow-sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm">{c.author}</span>
                      {c.isHot && <span className="ml-2 bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">{t.hot}</span>}
                    </div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">{c.time}</span>
                  </div>
                  <p className="text-sm mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">{c.content}</p>
                  <div className="flex gap-4 mt-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <button className="hover:text-primary transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                      {c.likes}
                    </button>
                    <button
                      onClick={() => handleReplyToComment(c.author)}
                      className="hover:text-primary transition-colors"
                    >
                      {t.reply}
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="px-5 py-12 text-center text-slate-400 text-sm italic">
                No voices yet. Be the first to support!
              </div>
            )}
          </div>
        </article>
      </main>

      {/* Bottom Comment Input */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 px-4 py-3 pb-8 z-40">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
              className="w-full bg-slate-100 dark:bg-[#211c27] border-none rounded-2xl py-3.5 pl-5 pr-12 text-sm focus:ring-2 focus:ring-primary shadow-inner dark:text-white"
              placeholder={t.supportPlaceholder}
            />
            <button
              onClick={handleSubmitComment}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-primary p-2 active:scale-75 transition-transform"
            >
              <span className="material-symbols-outlined font-bold">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailsPage;
