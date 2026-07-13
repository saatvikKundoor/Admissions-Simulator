// LandingPage.jsx
//
// Redesigned per game-landing-page best practices: a clear above-the-fold
// value prop + single prominent CTA, an early visual preview of the actual
// product (rather than describing it), and a scannable "how it works"
// section — all using the same dark score-card, pastel section-card, and
// outcome-icon language already established in RevealScreen/ProfileCard so
// the landing page reads as part of the same product, not a bolted-on splash
// screen. Fills the viewport instead of one small centered block.

const ICON = {
  Admitted:   '/icons/admitted.png',
  Waitlisted: '/icons/waitlisted.png',
  Rejected:   '/icons/rejected.png',
}

const OUTCOME_STYLE = {
  Admitted:   { bg: 'bg-green-100',  border: 'border-green-300',  text: 'text-green-800'  },
  Waitlisted: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
  Rejected:   { bg: 'bg-red-100',    border: 'border-red-300',    text: 'text-red-800'    },
}

const PREVIEW_SCHOOLS = [
  { name: 'MIT',              outcome: 'Waitlisted' },
  { name: 'UC Berkeley',      outcome: 'Admitted'   },
  { name: 'NYU',              outcome: 'Rejected'   },
]

const STEPS = [
  {
    n: '01',
    title: 'Read the file',
    body: 'Grades, activities, essays — the same profile an admissions officer would see.',
    color: 'teal',
  },
  {
    n: '02',
    title: 'Make the call',
    body: "Predict Admitted, Waitlisted, or Rejected for every school on the applicant's list.",
    color: 'lavender',
  },
  {
    n: '03',
    title: 'See the reveal',
    body: 'Watch the real outcomes roll in and find out how close your read really was.',
    color: 'sky',
  },
]

const STEP_COLORS = {
  teal:     'bg-[#C8E6E2]',
  lavender: 'bg-[#E8E4F3]',
  sky:      'bg-[#D4EAF5]',
}

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-[#F2F0EB]">
      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16 py-14 md:py-20">

        {/* ── Hero ── */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Copy + CTA */}
          <div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
               className="text-slate-400 text-xs uppercase tracking-widest mb-4">
              Think Like an AO
            </p>

            <h1 style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-5xl md:text-6xl font-semibold text-slate-900 tracking-tight mb-4">
              Admissions Simulator
            </h1>

            <p style={{ fontFamily: "'Playfair Display', serif" }}
               className="text-xl md:text-2xl text-slate-500 mb-6 italic">
              You think you know who gets in? Prove it.
            </p>

            <p style={{ fontFamily: "'Inter', sans-serif" }}
               className="text-slate-600 text-base leading-relaxed mb-8 max-w-md">
              Read a real college applicant's profile and predict which schools
              admitted them. Then see how your read compares to reality.
            </p>

            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={onStart}
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="px-10 py-4 rounded-xl font-semibold text-lg tracking-wide
                           bg-slate-900 text-white hover:bg-slate-700 transition-colors"
              >
                Start Game →
              </button>
              <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                 className="text-slate-400 text-xs">
                No signup or log-in required.
              </p>
            </div>

            <p style={{ fontFamily: "'Inter', sans-serif" }}
               className="text-xs text-slate-400 max-w-md">
              Profiles are anonymized from public Reddit posts.
              No identifying information is included.
            </p>
          </div>

          {/* Live-looking preview of the reveal screen, so the product is
              visible before the player ever clicks Start */}
          <div className="bg-slate-900 rounded-2xl p-5">
            <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
               className="text-slate-400 text-xs uppercase tracking-widest mb-4 px-1">
              A round in progress
            </p>
            <div className="space-y-2">
              {PREVIEW_SCHOOLS.map((school) => {
                const style = OUTCOME_STYLE[school.outcome]
                return (
                  <div
                    key={school.name}
                    className={`rounded-xl border px-4 py-3 flex items-center justify-between ${style.bg} ${style.border}`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${style.text}`}>{school.name}</p>
                      <p className={`text-xs ${style.text} opacity-75`}>{school.outcome}</p>
                    </div>
                    <img src={ICON[school.outcome]} alt={school.outcome} className="w-7 h-7" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── How it works ── */}
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-2xl md:text-3xl font-semibold text-slate-900 mb-6">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className={`rounded-2xl p-6 ${STEP_COLORS[step.color]}`}
              >
                <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                   className="text-xs text-slate-500 tracking-widest mb-3">
                  {step.n}
                </p>
                <h3 style={{ fontFamily: "'Playfair Display', serif" }}
                    className="text-lg font-semibold text-slate-800 mb-2">
                  {step.title}
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif" }}
                   className="text-sm text-slate-600 leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}