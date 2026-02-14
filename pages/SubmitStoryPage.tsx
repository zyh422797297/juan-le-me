
import React, { useState } from 'react';
import { Post } from '../types';

interface SubmitStoryPageProps {
  onBack: () => void;
  onSubmit: (post: Partial<Post>) => void;
  t: any;
}

const SubmitStoryPage: React.FC<SubmitStoryPageProps> = ({ onBack, onSubmit, t }) => {
  const [type, setType] = useState<'outcompeted' | 'victor'>('outcompeted');
  const [mood, setMood] = useState('angry');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const moods = [
    { id: 'exhausted', emoji: '😫', label: t.exhausted },
    { id: 'angry', emoji: '😤', label: t.angry },
    { id: 'clown', emoji: '🤡', label: t.clown },
    { id: 'melting', emoji: '🫠', label: t.melting },
    { id: 'speechless', emoji: '🙄', label: t.speechless },
  ];

  const handleSubmit = () => {
    if (!content.trim()) return alert("Please share your story!");

    // Prepend mood emoji to content
    const selectedMood = moods.find(m => m.id === mood);
    const finalContent = selectedMood ? `${selectedMood.emoji} ${content}` : content;

    onSubmit({
      content: finalContent,
      category: type === 'outcompeted' ? t.outcompeted : t.victor,
      author: isAnonymous ? t.anonymous : t.worker,
      images: content.length > 50 ? [`https://picsum.photos/seed/${Date.now()}/600/400`] : []
    });
  };

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-28">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-white/10">
        <button onClick={onBack} className="p-2 text-slate-600 dark:text-gray-300 rounded-full active:bg-black/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-base font-bold">{t.submitStory}</h1>
        <button onClick={onBack} className="text-slate-500 font-bold px-2">{t.cancel}</button>
      </header>

      <main className="flex-1 p-5 gap-6 flex flex-col">
        <h2 className="text-xl font-bold">{t.howsBattle}</h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setType('outcompeted')} className={`flex flex-col items-center justify-center h-32 rounded-2xl border-2 transition-all ${type === 'outcompeted' ? 'border-primary bg-primary/5 shadow-inner' : 'border-slate-100 dark:border-white/5 opacity-60'}`}>
            <span className="text-3xl mb-1">🥺</span>
            <span className="text-xs font-bold px-4 text-center">{t.outcompeted}</span>
          </button>
          <button onClick={() => setType('victor')} className={`flex flex-col items-center justify-center h-32 rounded-2xl border-2 transition-all ${type === 'victor' ? 'border-primary bg-primary/5 shadow-inner' : 'border-slate-100 dark:border-white/5 opacity-60'}`}>
            <span className="text-3xl mb-1">😈</span>
            <span className="text-xs font-bold px-4 text-center">{t.victor}</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t.mood}</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
            {moods.map(m => (
              <button key={m.id} onClick={() => setMood(m.id)} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${mood === m.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-surface-dark border-slate-100 dark:border-white/5'}`}>
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t.yourStory}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-white dark:bg-surface-dark border-slate-100 dark:border-white/5 rounded-2xl p-4 text-sm min-h-[140px] resize-none focus:ring-2 focus:ring-primary shadow-sm"
            placeholder="..."
          />
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm flex items-center justify-between border border-slate-50 dark:border-white/5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">visibility_off</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold">{t.incognito}</span>
              <span className="text-[10px] text-slate-500">{t.protectIdentity}</span>
            </div>
          </div>
          <button onClick={() => setIsAnonymous(!isAnonymous)} className={`w-12 h-6 rounded-full p-1 transition-colors ${isAnonymous ? 'bg-primary' : 'bg-slate-300'}`}>
            <div className={`bg-white size-4 rounded-full transition-transform ${isAnonymous ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </main>

      <div className="p-4 bg-white dark:bg-background-dark border-t border-slate-100 dark:border-white/10">
        <button onClick={handleSubmit} className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/25 active:scale-95 transition-transform uppercase tracking-widest">
          {t.postComrades}
        </button>
      </div>
    </div>
  );
};

export default SubmitStoryPage;
