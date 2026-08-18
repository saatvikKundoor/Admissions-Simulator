// ProfileReviewModal.jsx
// Read-only popup for re-checking an applicant's stats from the reveal
// screen. Mirrors ProfileCard's left-side section-card layout (Demographics /
// Academics / Extracurriculars / Awards) but intentionally omits the College
// List — the reveal screen already shows outcomes, so this is just "let me
// re-read the file," not another guessing surface.

import { useEffect } from 'react'

function str(value) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function capitalize(value) {
  if (typeof value !== 'string' || value.length === 0) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function ecToString(ec) {
  if (typeof ec === 'string') return capitalize(ec)
  if (ec && typeof ec === 'object') {
    if (ec.title && ec.description) return `${capitalize(ec.title)} — ${capitalize(ec.description)}`
    if (ec.title) return capitalize(ec.title)
    if (ec.description) return capitalize(ec.description)
  }
  return str(ec)
}

function XIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function SectionCard({ title, color, children, className = '' }) {
  const colors = {
    lavender: 'bg-[#E8E4F3]',
    cream:    'bg-[#F5EDD6]',
    sky:      'bg-[#D4EAF5]',
    teal:     'bg-[#C8E6E2]',
  }
  return (
    <div className={`rounded-2xl p-5 ${colors[color] ?? 'bg-slate-100'} ${className}`}>
      <h2 style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-xl font-semibold text-slate-800 mb-4">
        {title}
      </h2>
      {children}
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-baseline py-1 border-b border-black/10 last:border-0">
      <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-slate-600">
        {label}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  )
}

function ECItem({ ec, index }) {
  return (
    <li className="flex gap-3 text-sm text-slate-700 leading-snug">
      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-xs text-slate-400 mt-0.5 w-4 shrink-0 text-right">
        {index + 1}.
      </span>
      <span>
        {typeof ec === 'object' && ec.title
          ? (ec.description
              ? <><strong className="font-semibold text-slate-800">{capitalize(ec.title)}:</strong> {capitalize(ec.description)}</>
              : <strong className="font-semibold text-slate-800">{capitalize(ec.title)}</strong>)
          : ecToString(ec)
        }
      </span>
    </li>
  )
}

export default function ProfileReviewModal({ profile, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const extracurriculars = profile.extracurriculars ?? []
  const awards = profile.awards ?? []

  const ecHalf  = Math.ceil(extracurriculars.length / 2)
  const ecLeft  = extracurriculars.slice(0, ecHalf)
  const ecRight = extracurriculars.slice(ecHalf)

  const hasSat = profile.sat !== null && profile.sat !== undefined
  const hasAct = profile.act !== null && profile.act !== undefined
  const isTestOptional = !hasSat && !hasAct

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-slate-900/50 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Inter', sans-serif" }}
        className="relative bg-[#F2F0EB] rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
           className="text-slate-400 text-xs uppercase tracking-widest mb-4">
          Reviewing the file
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SectionCard title="Demographics" color="teal">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                ['State',     str(profile.state)],
                ['Gender',    str(profile.gender)],
                ['Ethnicity', str(profile.race_ethnicity)],
                ['First-Gen', profile.first_gen ? 'Yes' : 'No'],
                ['Residency', profile.international ? 'International' : 'Domestic'],
                ['Intended Major', str(profile.major_intended)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Academics" color="lavender">
            <div className="space-y-0.5">
              {isTestOptional ? (
                <StatRow label="SAT/ACT" value="Test Optional" />
              ) : (
                <>
                  {hasSat && <StatRow label="SAT" value={str(profile.sat)} />}
                  {hasAct && <StatRow label="ACT" value={str(profile.act)} />}
                </>
              )}
              <StatRow label="Unweighted GPA" value={str(profile.gpa_unweighted)} />
              <StatRow label="Weighted GPA"   value={str(profile.gpa_weighted)} />
              {profile.class_rank && <StatRow label="Class Rank" value={str(profile.class_rank)} />}
              <StatRow label="AP/IB/DE Courses" value={str(profile.ap_ib_de_count)} />
            </div>
          </SectionCard>

          {extracurriculars.length > 0 && (
            <SectionCard title="Extracurriculars" color="sky" className="sm:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <ol className="space-y-2 list-none">
                  {ecLeft.map((ec, i) => (
                    <ECItem key={i} ec={ec} index={i} />
                  ))}
                </ol>
                {ecRight.length > 0 && (
                  <ol className="space-y-2 list-none">
                    {ecRight.map((ec, i) => (
                      <ECItem key={i + ecHalf} ec={ec} index={i + ecHalf} />
                    ))}
                  </ol>
                )}
              </div>
            </SectionCard>
          )}

          {awards.length > 0 && (
            <SectionCard title="Awards" color="cream" className="sm:col-span-2">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {awards.map((award, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700 leading-snug">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{capitalize(str(award))}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}