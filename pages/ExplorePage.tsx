
import React from 'react';
import BottomNav from '../components/BottomNav';
import { Page } from '../types';

interface ExplorePageProps {
  onNavigate: (page: Page) => void;
  t: any;
  currentPage: Page;
}

const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigate, t, currentPage }) => {
  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-28">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/90 backdrop-blur-md px-6 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">{t.explore}</h1>
      </header>

      <main className="flex flex-col gap-8 p-6">
        <section>
          <h2 className="text-base font-extrabold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary fill-1">trending_up</span>
            {t.hotRants}
          </h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2">
            {[
              { title: 'The 11PM "Quick Fix"', tags: 'Workplace', img: 'office', color: 'from-orange-500 to-pink-500' },
              { title: 'Resume Buffing 101', tags: 'Hacks', img: 'tech', color: 'from-blue-500 to-indigo-500' },
            ].map((topic, i) => (
              <div key={i} className="shrink-0 w-40 aspect-[3/4] relative rounded-2xl overflow-hidden group shadow-md">
                <img src={`https://picsum.photos/seed/${topic.img}/300/400`} className="absolute inset-0 w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${topic.color} opacity-40`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-3 w-full">
                  <h3 className="text-white font-bold text-sm leading-tight">{topic.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-primary/10 rounded-2xl p-5 border border-slate-100 dark:border-primary/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold">{t.communityMood}</h2>
            <span className="material-symbols-outlined text-primary text-xl">analytics</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/30 rounded-t-md" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav currentPage={currentPage} onNavigate={onNavigate} onAddClick={() => onNavigate('submit')} t={t} />
    </div>
  );
};

export default ExplorePage;
