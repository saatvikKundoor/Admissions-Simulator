export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-[#F2F0EB] flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
           className="text-slate-400 text-xs uppercase tracking-widest mb-4">
          Think Like an AO
        </p>

        <h1 style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-5xl font-semibold text-slate-900 tracking-tight mb-4">
          Admissions Simulator
        </h1>

        <p style={{ fontFamily: "'Playfair Display', serif" }}
           className="text-xl text-slate-500 mb-6 italic">
          You think you know who gets in? Prove it.
        </p>

        <p style={{ fontFamily: "'Inter', sans-serif" }}
           className="text-slate-600 text-sm leading-relaxed mb-10">
          Read a real college applicant's profile and predict which schools
          admitted them. Then see how your read compares to reality.
        </p>

        <button
          onClick={onStart}
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="px-8 py-3 rounded-xl font-semibold text-sm tracking-wide
                     bg-slate-900 text-white hover:bg-slate-700 transition-colors"
        >
          Start Game →
        </button>

        <p style={{ fontFamily: "'Inter', sans-serif" }}
           className="text-xs text-slate-400 mt-12">
          Profiles are anonymized from public Reddit posts.
          No identifying information is included.
        </p>
      </div>
    </div>
  )
}