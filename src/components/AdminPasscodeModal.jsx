import { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function AdminPasscodeModal({ onSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passcode === '2026') {
      onSuccess();
    } else {
      setError('Invalid passcode. Please try again.');
      setPasscode('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex items-center justify-center p-4">
      <div className="glass-strong rounded-3xl p-8 w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="p-4 rounded-2xl bg-sky-500/15 mb-4">
            <Lock className="w-8 h-8 text-sky-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Admin Access</h2>
          <p className="text-sm text-slate-400 mt-1">Enter passcode to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type={showPin ? 'text' : 'password'}
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              placeholder="• • • •"
              className="w-full bg-slate-800/70 border border-slate-700/50 rounded-xl pl-12 pr-12 py-3.5 text-white text-center text-xl tracking-[0.3em] placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
              maxLength={10}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p className="text-rose-400 text-sm text-center mb-3 animate-fade-in">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-sky-500/20"
          >
            Unlock Dashboard
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-5">
          Contact your campus IT administrator if you've forgotten the passcode.
        </p>
      </div>
    </div>
  );
}
