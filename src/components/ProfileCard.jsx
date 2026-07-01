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
      className={`relative overflow-hidden ${className}`}
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

function SectionCard({ title, color, children }) {
  const colors = {
    lavender: 'bg-[#E8E4F3]',
    cream:    'bg-[#F5EDD6]',
    sky:      'bg-[#D4EAF5]',
    teal:     'bg-[#C8E6E2]',
  }
  return (
    <GlowCard color={color} className={`rounded-2xl p-5 ${colors[color] ?? 'bg-slate-100'}`}>
      <h2 style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-2xl font-semibold text-slate-800 mb-4">
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

export default function ProfileCard({ profile, guesses, onCycle, onDrop, guessMode }) {
  const extracurriculars = profile.extracurriculars ?? []
  const awards = profile.awards ?? []
  const schools = profile.schools ?? []

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}
         className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 items-start">

      {/* ── Left column ── */}
      <div className="flex flex-col gap-4">

        <SectionCard title="Demographics" color="teal">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
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
          <SectionCard title="Extracurriculars" color="sky">
            <ol className="space-y-2 list-none">
              {extracurriculars.map((ec, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700 leading-snug">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        className="text-xs text-slate-400 mt-0.5 w-4 shrink-0 text-right">
                    {i + 1}.
                  </span>
                  <span>
                    {typeof ec === 'object' && ec.title
                      ? <><strong className="font-semibold text-slate-800">{ec.title}:</strong> {ec.description}</>
                      : ecToString(ec)
                    }
                  </span>
                </li>
              ))}
            </ol>
          </SectionCard>
        )}

        {awards.length > 0 && (
          <SectionCard title="Awards" color="cream">
            <ul className="space-y-2">
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

      {/* ── Right column: College List ── */}
      <div className="md:sticky md:top-6">
        {guessMode === 'drag' ? (
          <DragGuess
            schools={schools}
            guesses={guesses}
            onDrop={onDrop}
          />
        ) : (
          <div className="bg-[#E2E4EA] rounded-2xl p-5">
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
        )}
      </div>

    </div>
  )
}

export { CYCLE }