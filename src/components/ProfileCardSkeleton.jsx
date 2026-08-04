// ProfileCardSkeleton.jsx
// Shown in place of ProfileCard while a profile is fetching. Mirrors the
// real layout (same section cards, same colors, same two-column split) so
// the screen doesn't go blank or swap to a generic spinner — just resolves
// from a shape the player already recognizes into the real content.

function Bar({ width = 'w-full', className = '' }) {
  return <div className={`h-3 rounded-full bg-black/10 animate-pulse ${width} ${className}`} />
}

function SkeletonSectionCard({ color, lines = 4, className = '' }) {
  const colors = {
    lavender: 'bg-[#E8E4F3]',
    cream:    'bg-[#F5EDD6]',
    sky:      'bg-[#D4EAF5]',
    teal:     'bg-[#C8E6E2]',
  }
  return (
    <div className={`rounded-2xl p-5 ${colors[color] ?? 'bg-slate-100'} ${className}`}>
      <Bar width="w-1/3" className="h-5 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Bar key={i} width={i % 2 === 0 ? 'w-full' : 'w-2/3'} />
        ))}
      </div>
    </div>
  )
}

export default function ProfileCardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">

      {/* Left side — mirrors Demographics / Academics / Extracurriculars / Awards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SkeletonSectionCard color="teal" lines={3} />
        <SkeletonSectionCard color="lavender" lines={4} />
        <SkeletonSectionCard color="sky" lines={4} className="sm:col-span-2" />
        <SkeletonSectionCard color="cream" lines={3} className="sm:col-span-2" />
      </div>

      {/* Right column — mirrors the College List */}
      <div className="lg:sticky lg:top-6">
        <div className="bg-[#E2E4EA] rounded-2xl p-6">
          <Bar width="w-1/2" className="h-6 mb-2" />
          <Bar width="w-2/3" className="h-3 mb-4" />
          <div className="space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <Bar width="w-1/2" />
                <div className="w-8 h-8 shrink-0 rounded-lg bg-black/10 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <div className="w-40 h-11 rounded-xl bg-black/10 animate-pulse" />
        </div>
      </div>

    </div>
  )
}