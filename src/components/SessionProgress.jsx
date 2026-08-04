// SessionProgress.jsx
// "Applicant X of Y" text plus one folder icon per applicant in the session —
// a checkmark folder for each completed round, a plain folder for rounds not
// yet reached. `completed` is how many rounds have been scored so far;
// the in-progress round (completed + 1) still renders as unfinished.

function FolderCheckIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      <path d="m9 13 2 2 4-4" />
    </svg>
  )
}

function FolderDotIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <circle cx="12" cy="13" r="1" />
    </svg>
  )
}

export default function SessionProgress({ completed, total }) {
  const current = Math.min(completed + 1, total)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
         className="text-xs text-slate-500 uppercase tracking-widest whitespace-nowrap">
        Applicant {current} of {total}
      </p>
      <div className="flex items-center gap-1 flex-wrap">
        {Array.from({ length: total }).map((_, i) => {
          const done = i < completed
          const Icon = done ? FolderCheckIcon : FolderDotIcon
          return (
            <Icon
              key={i}
              className={`w-4 h-4 shrink-0 transition-colors ${done ? 'text-slate-900' : 'text-slate-300'}`}
            />
          )
        })}
      </div>
    </div>
  )
}