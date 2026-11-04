import { useApp } from '../contexts/AppContext';
import { MessageSquare, Star } from 'lucide-react';

export default function FeedbackTriageBoard({ reviews }) {
  const { updateReviewStatus } = useApp();

  const statusStyles = {
    New: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    'In Progress': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-sky-400" />
        Feedback Triage Board
        {reviews.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 font-normal">
            {reviews.length}
          </span>
        )}
      </h2>

      {reviews.length === 0 ? (
        <div className="text-center py-10 text-slate-600">
          No student feedback submitted yet.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm min-w-[780px]">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-700/50 text-xs uppercase tracking-wider">
                <th className="pb-3 pr-3 font-medium">Date</th>
                <th className="pb-3 pr-3 font-medium">Station</th>
                <th className="pb-3 pr-3 font-medium">Student</th>
                <th className="pb-3 pr-3 font-medium">Rating</th>
                <th className="pb-3 pr-3 font-medium">Tags</th>
                <th className="pb-3 pr-3 font-medium">Comment</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => {
                const avgRating = Math.round(
                  (review.tasteRating + review.clarityRating + review.temperatureRating) / 3,
                );
                return (
                  <tr
                    key={review.id}
                    className="border-b border-slate-800/50 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Date */}
                    <td className="py-3 pr-3 text-xs whitespace-nowrap">
                      <div className="text-slate-300">
                        {new Date(review.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-slate-600">
                        {new Date(review.date).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Station */}
                    <td className="py-3 pr-3 text-white font-semibold text-xs">
                      {review.stationId}
                    </td>

                    {/* Student */}
                    <td className="py-3 pr-3">
                      <div className="text-white text-xs font-medium">{review.studentName}</div>
                      <div className="text-slate-500 text-[11px]">{review.studentPRN}</div>
                    </td>

                    {/* Stars */}
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-0.5 mb-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= avgRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-600">
                        T:{review.tasteRating} · C:{review.clarityRating} · Temp:
                        {review.temperatureRating}
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="py-3 pr-3">
                      {review.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {review.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] px-1.5 py-0.5 bg-slate-700/50 text-slate-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-700 text-xs">—</span>
                      )}
                    </td>

                    {/* Comment */}
                    <td
                      className="py-3 pr-3 text-slate-400 text-xs max-w-[200px] truncate"
                      title={review.comment}
                    >
                      {review.comment || '—'}
                    </td>

                    {/* Status dropdown */}
                    <td className="py-3">
                      <select
                        value={review.status}
                        onChange={(e) => updateReviewStatus(review.id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none bg-transparent ${
                          statusStyles[review.status] || statusStyles.New
                        }`}
                      >
                        <option value="New" className="bg-slate-900 text-white">
                          New
                        </option>
                        <option value="In Progress" className="bg-slate-900 text-white">
                          In Progress
                        </option>
                        <option value="Resolved" className="bg-slate-900 text-white">
                          Resolved
                        </option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
