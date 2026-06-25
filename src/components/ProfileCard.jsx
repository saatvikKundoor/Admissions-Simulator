// ProfileCard.jsx — redesigned layout matching mockup

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

// Section card with colored background and Playfair Display header
function SectionCard({ title, color, children }) {
  const colors = {
    lavender: 'bg-[#E8E4F3]',
    sage:     'bg-[#D6EAD8]',
    cream:    'bg-[#F5EDD6]',
    sky:      'bg-[#D4EAF5]',
    blush:    'bg-[#F5D9D6]',
    teal:     'bg-[#C8E6E2]',
  }
  return (
    <div className={`rounded-2xl p-5 ${colors[color] ?? 'bg-slate-100'}`}>
      <h2 style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-2xl font-semibold text-slate-800 mb-4">
        {title}
      </h2>
      {children}
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-baseline py-1 border-b border-black/10 last:border-0">
      <span style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-sm text-slate-600">
        {label}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  )
}

export default function ProfileCard({ profile }) {
  const extracurriculars = profile.extracurriculars ?? []
  const awards = profile.awards ?? []

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}
         className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 items-start">

      {/* ── Left column ── */}
      <div className="flex flex-col gap-4">

        {/* Demographics — teal, top of left column */}
        <SectionCard title="Demographics" color="teal">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {[
              ['State', str(profile.state)],
              ['Gender', str(profile.gender)],
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

        {/* Academics — lavender */}
        <SectionCard title="Academics" color="lavender">
          <div className="space-y-0.5">
            {profile.sat    && <StatRow label="SAT"           value={Number(profile.sat).toLocaleString()} />}
            {profile.act    && <StatRow label="ACT"           value={str(profile.act)} />}
            <StatRow label="Unweighted GPA"  value={str(profile.gpa_unweighted)} />
            <StatRow label="Weighted GPA"    value={str(profile.gpa_weighted)} />
            {profile.class_rank && <StatRow label="Class Rank" value={str(profile.class_rank)} />}
            <StatRow label="AP Courses"      value={str(profile.ap_ib_count)} />
          </div>
        </SectionCard>

        {/* Extracurriculars — sky */}
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

        {/* Awards — cream */}
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
        <div className="bg-[#E2E4EA] rounded-2xl p-5">
          <h2 style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-2xl font-semibold text-slate-800 mb-1">
            College List
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Check every school you think admitted this applicant.
          </p>
          <div className="space-y-0">
            {(profile.schools ?? []).map((school) => (
              <label
                key={school.id}
                className="flex items-center justify-between py-2.5 border-b border-black/10
                           last:border-0 cursor-pointer group"
              >
                <span className="text-sm text-slate-800 group-hover:text-slate-900 leading-snug pr-3">
                  {str(school.school_name)}
                </span>
                <input
                  type="checkbox"
                  className="w-4 h-4 shrink-0 rounded border-slate-400 text-indigo-600
                             cursor-pointer focus:ring-indigo-500 focus:ring-offset-0"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}