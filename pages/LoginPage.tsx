
import React, { useState } from 'react';
import { supabase } from '../src/lib/supabaseClient';

interface LoginPageProps {
  onLogin: () => void;
  t: any;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, t }) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setError(null);
    setLoading(true);

    try {
      if (tab === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              avatar_url: `https://ui-avatars.com/api/?name=${username}&background=random`
            }
          }
        });
        if (error) throw error;

        // If auto-confirm is enabled (which it is now), session will be present
        if (data.session) {
          onLogin(); // Direct login
        } else {
          // Fallback if email confirmation is somehow still required
          alert('Check your email for the confirmation link!');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 h-full flex flex-col p-6 overflow-y-auto no-scrollbar">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/20 to-transparent opacity-50 pointer-events-none -z-10"></div>

      <div className="flex flex-col items-center text-center pt-12 pb-6">
        <div className="w-20 h-20 mb-6 rounded-2xl overflow-hidden shadow-lg shadow-primary/20 bg-background-dark flex items-center justify-center relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-900 opacity-90"></div>
          <span className="material-symbols-outlined text-white text-4xl relative z-10">psychology</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Juan Le Me</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-[240px]">
          Vent your stress, share your story, and find your peace.
        </p>
      </div>

      <div className="bg-slate-200/50 dark:bg-surface-dark-lighter p-1 rounded-xl flex mb-8">
        <button
          onClick={() => setTab('login')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'login' ? 'bg-white dark:bg-background-dark text-primary dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
        >
          {t.login}
        </button>
        <button
          onClick={() => setTab('signup')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'signup' ? 'bg-white dark:bg-background-dark text-primary dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
        >
          {t.signup}
        </button>
      </div>

      <form className="space-y-5 flex-1" onSubmit={(e) => { e.preventDefault(); handleAuth(); }}>
        {tab === 'signup' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">{t.username}</label>
            <div className="relative group">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="block w-full px-4 py-4 border-none rounded-xl bg-slate-100 dark:bg-[#211c27] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Email</label>
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full px-4 py-4 border-none rounded-xl bg-slate-100 dark:bg-[#211c27] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">{t.password}</label>
          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full px-4 py-4 border-none rounded-xl bg-slate-100 dark:bg-[#211c27] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-primary/25 text-base font-bold text-white bg-primary hover:bg-purple-700 transition-all transform active:scale-[0.98] mt-4 disabled:opacity-50"
        >
          {loading ? 'Processing...' : (tab === 'login' ? t.getVenting : t.joinNow)}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
