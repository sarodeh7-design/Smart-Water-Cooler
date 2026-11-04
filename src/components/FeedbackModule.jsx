import { useState } from 'react';
import { Star, Send, X, Tag, MessageSquare, User } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const ISSUE_TAGS = ['Slow Flow', 'Off Taste', 'Warm Water', 'Physical Leak'];

export default function FeedbackModule({ stationId }) {
  const { studentSession, loginStudent, submitReview, addToast } = useApp();

  const [tasteRating, setTasteRating] = useState(0);
  const [clarityRating, setClarityRating] = useState(0);
  const [temperatureRating, setTemperatureRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authPRN, setAuthPRN] = useState('');

  const toggleTag = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const resetForm = () => {
    setTasteRating(0);
    setClarityRating(0);
    setTemperatureRating(0);
    setSelectedTags([]);
    setComment('');
  };

  const doSubmit = (session) => {
    submitReview({
      stationId,
      studentName: session.name,
      studentPRN: session.prn,
      date: new Date().toISOString(),
      tasteRating,
      clarityRating,
      temperatureRating,
      tags: selectedTags,
      comment: comment.trim(),
      status: 'New',
    });
    resetForm();
  };

  const handleSubmit = () => {
    if (!tasteRating || !clarityRating || !temperatureRating) {
      addToast('Please rate all three categories', 'error');
      return;
    }
    if (!studentSession) {
      setShowAuth(true);
      return;
    }
    doSubmit(studentSession);
  };

  const handleAuthSubmit = () => {
    if (!authName.trim() || !authPRN.trim()) {
      addToast('Please enter your name and PRN', 'error');
      return;
    }
    const session = { name: authName.trim(), prn: authPRN.trim() };
    loginStudent(session);
    setShowAuth(false);
    doSubmit(session);
  };

  return (
    <div className="glass rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-sky-400" />
        Rate Your Water Experience
      </h2>
      <p className="text-sm text-slate-500 mb-5">
        Your feedback helps us maintain water quality across campus.
      </p>

      {/* Logged-in badge */}
      {studentSession && (
        <div className="mb-5 flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sm">
          <User className="w-4 h-4 text-sky-400" />
          <span className="text-slate-300">
            Logged in as{' '}
            <span className="text-white font-semibold">{studentSession.name}</span>
          </span>
          <span className="text-slate-600 text-xs">({studentSession.prn})</span>
        </div>
      )}

      {/* Star ratings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
        <RatingGroup label="💧 Taste" value={tasteRating} onChange={setTasteRating} />
        <RatingGroup label="🔍 Clarity" value={clarityRating} onChange={setClarityRating} />
        <RatingGroup
          label="🌡️ Temperature"
          value={temperatureRating}
          onChange={setTemperatureRating}
        />
      </div>

      {/* Issue tags */}
      <div className="mb-5">
        <label className="text-sm text-slate-400 mb-2 flex items-center gap-1.5">
          <Tag className="w-4 h-4" /> Quick Issue Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {ISSUE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTags.includes(tag)
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/40 hover:border-slate-600/60 hover:text-slate-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label className="text-sm text-slate-400 mb-2 block">Comments (Optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience…"
          rows={3}
          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 resize-none transition-colors"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-sky-500/20"
      >
        <Send className="w-4 h-4" />
        Submit Review
      </button>

      {/* ─── Auth Modal ─── */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold text-white">Student Verification</h3>
              <button
                onClick={() => setShowAuth(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              Please verify your identity to submit feedback.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g., Aditya Sharma"
                  className="w-full bg-slate-800/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">
                  Student PRN / ID Number
                </label>
                <input
                  type="text"
                  value={authPRN}
                  onChange={(e) => setAuthPRN(e.target.value)}
                  placeholder="e.g., 22CS1045"
                  className="w-full bg-slate-800/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                />
              </div>
            </div>

            <button
              onClick={handleAuthSubmit}
              className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-semibold transition-colors"
            >
              Verify & Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Star Rating Widget ───

function RatingGroup({ label, value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div>
      <label className="text-sm text-slate-400 mb-2 block">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-125 active:scale-95"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hover || value)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-700 hover:text-slate-500'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
