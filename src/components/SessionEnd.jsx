export default function SessionEnd({ correct, total, profileCount, onPlayAgain }) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-slate-900 rounded-2xl px-6 py-10 text-center mb-6">
        <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
           className="text-slate-400 text-xs uppercase tracking-widest mb-2">
          Session Complete
        </p>
        <p style={{ fontFamily: "'Playfair Display', serif" }}
           className="text-white text-5xl font-semibold mb-3">
          {correct} / {total}
        </p>
        <p className="text-slate-400 text-sm mb-1">
          across {profileCount} applicant{profileCount !== 1 ? 's' : ''}
        </p>
        <p className="text-slate-300 text-sm mt-4">
          Admissions is less predictable than it looks.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onPlayAgain}
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="px-8 py-3 rounded-xl font-semibold text-sm tracking-wide
                     bg-slate-900 text-white hover:bg-slate-700 transition-colors"
        >
          Play Again →
        </button>
      </div>
    </div>
  )
}