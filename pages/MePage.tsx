
import React from 'react';
import BottomNav from '../components/BottomNav';
import { Page, Language, Theme, Post } from '../types';

interface MePageProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  language: Language;
  setLanguage: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  t: any;
  currentPage: Page;
  isLoggedIn: boolean;
  onLogin: () => void;
  posts?: Post[];
  userId?: string;
}

const MePage: React.FC<MePageProps> = ({ onNavigate, onLogout, language, setLanguage, theme, setTheme, t, currentPage, isLoggedIn, onLogin, posts = [], userId }) => {

  const myPosts = posts.filter(p => p.authorId === userId);

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-28">
      {/* ... header ... */}
      <header className="flex items-center px-4 py-3 justify-between sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <button onClick={() => onNavigate('square')} className="flex size-10 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">{t.me}</h2>
        <div className="size-10"></div>
      </header>

      {isLoggedIn ? (
        <>
          <div className="flex flex-col items-center px-6 pt-6 pb-8 gap-4 relative">
            {/* ... avatar ... */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary/20 rounded-full blur-3xl -z-10"></div>
            <div className="size-24 rounded-full p-1 bg-gradient-to-tr from-primary to-[#c084fc] shadow-xl">
              <img
                alt="Avatar"
                className="w-full h-full object-cover rounded-full border-4 border-white dark:border-background-dark"
                src="https://picsum.photos/seed/9527/200/200"
              />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{t.worker}</h1>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-tighter">{t.eliteComrade}</span>
              </div>
              <p className="text-slate-500 text-xs font-medium">Currently venting...</p>
            </div>
          </div>
        </>
      ) : (
        <div className="px-6 py-12 text-center flex flex-col items-center gap-4">
          {/* ... guest view ... */}
          <div className="size-20 bg-slate-200 dark:bg-surface-dark-lighter rounded-full flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-4xl">person</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">You are browsing as a Guest</p>
          <button onClick={onLogin} className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform">
            {t.login}
          </button>
        </div>
      )}

      <div className="px-6 space-y-6">
        {/* My Posts Section */}
        {isLoggedIn && (
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">My Posts ({myPosts.length})</h3>
            <div className="space-y-3">
              {myPosts.length > 0 ? (
                myPosts.map(post => (
                  <div key={post.id} className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2 mb-2">{post.content}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{post.time}</span>
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">favorite</span> {post.likes}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">chat_bubble</span> {post.commentsCount}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                  No posts yet. Go vent!
                </div>
              )}
            </div>
          </section>
        )}

        {/* Activity Section */}
        {isLoggedIn && (
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">Activity</h3>
            <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
              <button
                onClick={() => onNavigate('inbox')}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                  </div>
                  <span className="text-sm font-bold">{t.inbox}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">2</div>
                  <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                </div>
              </button>
            </div>
          </section>
        )}

        <section>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">{t.settings}</h3>
          <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm divide-y divide-slate-50 dark:divide-white/5">
            {/* Language Setting */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">language</span>
                </div>
                <span className="text-sm font-bold">{t.language}</span>
              </div>
              <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-lg">
                <button
                  onClick={() => setLanguage('zh')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'zh' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-slate-400'}`}
                >
                  中文
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-slate-400'}`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Theme Setting */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                </div>
                <span className="text-sm font-bold">{t.theme}</span>
              </div>
              <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-lg">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${theme === 'light' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-slate-400'}`}
                >
                  {t.lightMode}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${theme === 'dark' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-slate-400'}`}
                >
                  {t.darkMode}
                </button>
              </div>
            </div>
          </div>
        </section>

        {isLoggedIn && (
          <button
            onClick={onLogout}
            className="w-full py-4 text-red-500 text-sm font-black uppercase tracking-widest border border-red-500/20 rounded-2xl active:bg-red-50 transition-colors"
          >
            {t.logout}
          </button>
        )}
      </div>

    </div>
  );
};

export default MePage;
