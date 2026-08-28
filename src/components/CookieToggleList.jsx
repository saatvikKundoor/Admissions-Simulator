// CookieToggleList.jsx
// Shared category list + toggle switches, used by both the first-run
// CookieBanner and CookiePreferencesModal (opened later via "Cookie
// Settings"), so the two surfaces can't drift out of sync.

const CATEGORIES = [
  {
    key: 'necessary',
    label: 'Necessary',
    locked: true,
    description:
      "Keeps the game working: your chosen guess mode (tap/drag), session length, and sound/music volume, saved in your browser's local storage. Nothing here is sent to us, and it can't be turned off since the game can't function without it.",
  },
  {
    key: 'analytics',
    label: 'Analytics',
    locked: false,
    description:
      'Google Analytics (GA4) cookies that tell us in aggregate how the game is used — session lengths, rounds played, accuracy trends. Off by default. We never see anything that identifies you personally.',
  },
]

function Toggle({ checked, disabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors
                  ${checked ? 'bg-slate-900' : 'bg-slate-300'}
                  ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  )
}

export default function CookieToggleList({ draft, onToggle }) {
  return (
    <div className="space-y-3">
      {CATEGORIES.map(cat => (
        <div key={cat.key} className="flex items-start justify-between gap-4 py-2 border-b border-black/10 last:border-0">
          <div className="min-w-0">
            <p style={{ fontFamily: "'Inter', sans-serif" }}
               className="text-sm font-semibold text-slate-800">
              {cat.label}
              {cat.locked && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      className="ml-2 text-[10px] uppercase tracking-wide text-slate-400 align-middle">
                  Always on
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{cat.description}</p>
          </div>
          <Toggle
            checked={cat.locked ? true : draft[cat.key]}
            disabled={cat.locked}
            onChange={(v) => onToggle(cat.key, v)}
            label={cat.label}
          />
        </div>
      ))}
    </div>
  )
}

export { CATEGORIES }