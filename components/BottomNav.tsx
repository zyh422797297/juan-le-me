
import React from 'react';
import { Page } from '../types';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onAddClick?: () => void;
  t: any;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate, onAddClick, t }) => {
  const navItems = [
    { id: 'square', label: t.square, icon: 'forum' },
    { id: 'me', label: t.me, icon: 'person' },
  ];

  return (
    <nav className="absolute bottom-0 left-0 w-full z-[9999] bg-white/90 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 pb-4 pt-3 px-12 shadow-2xl">
      <div className="flex justify-between items-center relative">
        <button
          onClick={() => onNavigate('square')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentPage === 'square'
            ? 'text-primary'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
        >
          <span className={`material-symbols-outlined text-2xl ${currentPage === 'square' ? 'fill-1' : ''}`}>
            forum
          </span>
          <span className="text-[10px] font-bold">{t.square}</span>
        </button>

        <div className="flex flex-col items-center -mt-6">
          <button
            onClick={onAddClick}
            className="size-14 rounded-full bg-primary shadow-lg shadow-primary/40 flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-3xl font-bold">add</span>
          </button>
        </div>

        <button
          onClick={() => onNavigate('me')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentPage === 'me'
            ? 'text-primary'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
        >
          <span className={`material-symbols-outlined text-2xl ${currentPage === 'me' ? 'fill-1' : ''}`}>
            person
          </span>
          <span className="text-[10px] font-bold">{t.me}</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
