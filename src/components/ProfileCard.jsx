import { useState, useRef } from 'react'
import DragGuess from './DragGuess'

function str(value) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function ecToString(ec) {
  if (typeof ec === 'string') return ec
  if (ec && typeof ec === 'object') {
    if (ec.title && ec.description) return `${ec.title} — ${ec.description}`
    if (ec.title) return ec.title
    if (ec.description) return ec.description
  }
  return str(ec)
}

function GlowCard({ children, className = '', color = 'teal' }) {
  const cardRef = useRef(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const glowColors = {
    lavender: '124, 58, 237',
    cream:    '217, 119, 6',
    sky:      '2, 132, 199',
    teal:     '13, 148, 136',
  }

  const rgb = glowColors[color] || '148, 163, 184'

  return (
    <div
      ref={cardRef}
      onMouseMove={(e) => {
        const rect = cardRef.current?.getBoundingClientRect()
        if (!rect) return
        setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: isHovered ? "url('/icons/magnifying.png') 12 12, zoom-in" : undefined,
      }}
      className={`relative overflow-hidden h-full ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 hidden md:block"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(300px circle at ${coords.x}px ${coords.y}px, rgba(${rgb}, 0.22), transparent 80%)`,
        }}
      />
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
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
    <GlowCard
      color={color}
      className={`rounded-2xl p-5 ${colors[color] ?? 'bg-slate-100'} ${className}`}
    >
      <h2 style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-xl font-semibold text-slate-800 mb-4">
        {title}
      </h2>
      {children}
    </GlowCard>
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
          ? <><strong className="font-semibold text-slate-800">{ec.title}:</strong> {ec.description}</>
          : ecToString(ec)
        }
      </span>
    </li>
  )
}

const CYCLE = [null, 'Admitted', 'Waitlisted', 'Rejected']

const ICON = {
  Admitted:   '/icons/admitted.png',
  Waitlisted: '/icons/waitlisted.png',
  Rejected:   '/icons/rejected.png',
}

const ROW_BG = {
  Admitted:   'bg-green-50',
  Waitlisted: 'bg-yellow-50',
  Rejected:   'bg-red-50',
}

function SchoolGuessRow({ school, guess, onCycle }) {
  const bg = guess ? ROW_BG[guess] : 'hover:bg-black/5'
  return (
    <button
      onClick={() => onCycle(school.id)}
      className={`w-full flex items-center justify-between py-2.5 px-1
                  border-b border-black/10 last:border-0 transition-colors
                  text-left cursor-pointer rounded-lg ${bg}`}
    >
      <span className="text-sm text-slate-800 leading-snug pr-3">
        {str(school.school_name)}
      </span>
      {guess
        ? <img src={ICON[guess]} alt={guess} className="w-8 h-8 shrink-0" />
        : <div className="w-8 h-8 shrink-0 rounded-lg border-2 border-dashed border-slate-300" />
      }
    </button>
  )
}

function SubmitRow({ anyGuessed, guessMode, onSubmit }) {
  return (
    <div className="flex items-center justify-end gap-4">
      {!anyGuessed && (
        <p style={{ fontFamily: "'Inter', sans-serif" }}
           className="text-sm text-slate-400 text-right">
          {guessMode === 'cycle'
            ? 'Tap schools above to make predictions'
            : 'Drag schools into a column'}
        </p>
      )}
      <button
        onClick={onSubmit}
        disabled={!anyGuessed}
        style={{ fontFamily: "'Inter', sans-serif" }}
        className="px-8 py-3 rounded-xl font-semibold text-sm tracking-wide transition-colors
                   bg-slate-900 text-white hover:bg-slate-700
                   disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shrink-0"
      >
        Submit Guesses
      </button>
    </div>
  )
}

export default function ProfileCard({
  profile,
  guesses,
  onCycle,
  onDrop,
  guessMode,
  anyGuessed,
  onSubmit,
}) {
  const extracurriculars = profile.extracurriculars ?? []
  const awards = profile.awards ?? []
  const schools = profile.schools ?? []

  // Split so the left column gets items 1..half and the right column gets half+1..end,
  // instead of interleaving (1 left, 2 right, 3 left...).
  const ecHalf = Math.ceil(extracurriculars.length / 2)
  const ecLeft  = extracurriculars.slice(0, ecHalf)
  const ecRight = extracurriculars.slice(ecHalf)

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}
         className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">

      {/* ── Left side: admissions-file style grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <SectionCard title="Demographics" color="teal">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              ['State',     str(profile.state)],
              ['Gender',    str(profile.gender)],
              ['Ethnicity', str(profile.race_ethnicity)],
              ['First-Gen', profile.first_gen ? 'Yes' : 'No'],
              ['Residency', profile.international ? 'International' : 'Domestic'],
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
            {profile.sat        && <StatRow label="SAT"           value={Number(profile.sat).toLocaleString()} />}
            {profile.act        && <StatRow label="ACT"           value={str(profile.act)} />}
            <StatRow label="Unweighted GPA"  value={str(profile.gpa_unweighted)} />
            <StatRow label="Weighted GPA"    value={str(profile.gpa_weighted)} />
            {profile.class_rank && <StatRow label="Class Rank"    value={str(profile.class_rank)} />}
            <StatRow label="AP Courses"      value={str(profile.ap_ib_count)} />
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
                  <span>{str(award)}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>

      {/* ── Right column: College List + Submit ── */}
      <div className="lg:sticky lg:top-6">
        {guessMode === 'drag' ? (
          <DragGuess
            schools={schools}
            guesses={guesses}
            onDrop={onDrop}
            footer={
              <SubmitRow anyGuessed={anyGuessed} guessMode={guessMode} onSubmit={onSubmit} />
            }
          />
        ) : (
          <>
            <div className="bg-[#E2E4EA] rounded-2xl p-6">
              <h2 style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-2xl font-semibold text-slate-800 mb-1">
                College List
              </h2>
              <p className="text-xs text-slate-500 mb-1">
                Tap each school to set your prediction.
              </p>
              <div className="flex gap-3 mb-4">
                {Object.entries(ICON).map(([label, src]) => (
                  <div key={label} className="flex items-center gap-1">
                    <img src={src} alt={label} className="w-4 h-4" />
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                ))}
              </div>
              <div>
                {schools.map((school) => (
                  <SchoolGuessRow
                    key={school.id}
                    school={school}
                    guess={guesses[school.id] ?? null}
                    onCycle={onCycle}
                  />
                ))}
              </div>
            </div>
            <div className="mt-6">
              <SubmitRow anyGuessed={anyGuessed} guessMode={guessMode} onSubmit={onSubmit} />
            </div>
          </>
        )}
      </div>

    </div>
  )
}

export { CYCLE }