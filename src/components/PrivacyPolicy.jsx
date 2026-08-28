// PrivacyPolicy.jsx
// Standalone full-page view, styled to match the rest of the app (same
// section-card palette, fonts, and close-button pattern used in
// SubmitProfileForm/modals). Reachable from the landing page footer.

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

function SectionCard({ title, color, children }) {
  const colors = {
    lavender: 'bg-[#E8E4F3]',
    cream:    'bg-[#F5EDD6]',
    sky:      'bg-[#D4EAF5]',
    teal:     'bg-[#C8E6E2]',
  }
  return (
    <div className={`rounded-2xl p-5 md:p-6 ${colors[color] ?? 'bg-slate-100'}`}>
      <h2 style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-xl font-semibold text-slate-800 mb-3">
        {title}
      </h2>
      <div style={{ fontFamily: "'Inter', sans-serif" }}
           className="text-sm text-slate-700 leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  )
}

export default function PrivacyPolicy({ onClose, onOpenCookieSettings }) {
  return (
    <div className="min-h-screen bg-[#F2F0EB]">
      <div className="max-w-3xl mx-auto px-6 md:px-10 lg:px-16 py-10">

        <header className="flex items-start justify-between mb-6">
          <div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
               className="text-slate-400 text-xs uppercase tracking-widest mb-2">
              Last updated: August 25, 2026
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-4xl font-semibold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 transition-colors mt-2"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <p style={{ fontFamily: "'Inter', sans-serif" }}
           className="text-sm text-slate-600 leading-relaxed mb-8">
          Admissions Simulator ("the game," "we," "us") is an open-source browser game.
          This policy covers the version of the game hosted at this site. It does not
          cover forks or copies run by anyone else, since the source is public on{' '}
          <a href="https://github.com/saatvikkundoor/admissions-simulator" target="_blank"
             rel="noopener noreferrer" className="underline hover:text-slate-800">
            GitHub
          </a>.
        </p>

        <div className="space-y-4">

          <SectionCard title="1. There Are No Accounts" color="teal">
            <p>
              Admissions Simulator has no login, no sign-up, and no user accounts of any
              kind. You can play the full game — including every session, filter, and
              sound setting — without giving us any personal information at all.
            </p>
          </SectionCard>

          <SectionCard title="2. What We Store" color="lavender">
            <p><strong>Applicant profiles.</strong> The GPA, test scores, extracurriculars,
              awards, and demographics you read during gameplay belong to real applicants
              who posted their own results publicly on Reddit (r/chanceme, r/collegeresults).
              We strip identifying details before a profile enters the game. This data is
              not about you and is not linked to you in any way.</p>
            <p><strong>Profile submissions.</strong> If you use "Submit Your Own Profile,"
              we store what you type (academics, extracurriculars, school outcomes, and a
              source link) in a separate, unpublished review queue. The source link is used
              only to verify the submission is genuine and is never shown to other players.
              We ask that you not include names, usernames, or other identifying details in
              a submission — but we don't verify this automatically, so please review what
              you paste in before submitting.</p>
            <p><strong>Local device settings.</strong> Your guess mode (tap vs. drag),
              session length, and sound/music volume are saved in your browser's local
              storage. These never leave your device and we never see them.</p>
          </SectionCard>

          <SectionCard title="3. What We Do NOT Collect" color="sky">
            <ul className="list-disc list-inside space-y-1">
              <li>No names, email addresses, or account credentials — there's nothing to give us.</li>
              <li>No payment information. The game is free with no in-app purchases.</li>
              <li>No precise location, camera, or microphone access.</li>
              <li>No cookies used for cross-site tracking or advertising. We don't run ads.</li>
              <li>We never sell or rent any data.</li>
            </ul>
          </SectionCard>

          <SectionCard title="4. Analytics & Server Logs" color="cream">
            <p>
              We use Google Analytics (GA4) and Cloudflare Web Analytics to understand
              aggregate usage — things like how many sessions are started, how long a
              round takes, and overall accuracy trends. These events (e.g. "session
              started," "round ended," a score) are not tied to your name or any account,
              since none exists. Our hosting provider (Cloudflare) and database provider
              (Supabase) may log standard technical data such as IP address and timestamps
              for security and abuse prevention; these logs are managed by those providers
              under their own retention policies.
            </p>
          </SectionCard>

          <SectionCard title="5. Cookies & Similar Technologies" color="sky">
            <p>We use two categories, and only one of them is optional:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Necessary (always on).</strong> Not a cookie — your guess
                mode, session length, and sound/music volume are saved in your
                browser's local storage so they persist between visits. This never
                leaves your device and can't be turned off, since the game can't
                function without it.</li>
              <li><strong>Analytics (optional).</strong> If you accept it, Google
                Analytics (GA4) sets cookies to measure aggregate usage — session
                counts, round lengths, accuracy trends. Off by default; you can
                change this any time.</li>
            </ul>
            <p>
              Cloudflare Web Analytics, which we also use for basic traffic stats, is
              cookieless by design — it never sets an identifier and isn't covered
              by the toggle above.
            </p>
            <button
              onClick={onOpenCookieSettings}
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="mt-1 px-4 py-2 rounded-lg text-sm font-semibold
                         bg-slate-900 text-white hover:bg-slate-700 transition-colors"
            >
              Manage Cookie Settings
            </button>
          </SectionCard>

          <SectionCard title="6. Children's Privacy" color="teal">
            <p>
              Admissions Simulator has no accounts, so we never knowingly collect personal
              information from anyone, including children. The game and its subject matter
              (college admissions) are aimed at a high-school-and-up audience. If you
              believe a child has submitted identifying information through the profile
              submission form, contact us using the details below and we will remove it.
            </p>
          </SectionCard>

          <SectionCard title="7. Third-Party Services" color="lavender">
            <p>We rely on a small set of providers, each for a specific purpose:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Supabase</strong> — hosts the applicant-profile database and submission queue.</li>
              <li><strong>Cloudflare Pages / Web Analytics</strong> — hosts the site and provides aggregate traffic stats.</li>
              <li><strong>Google Analytics (GA4)</strong> — aggregate gameplay event tracking.</li>
              <li><strong>Google Fonts</strong> — loads Playfair Display, Inter, and JetBrains Mono.</li>
            </ul>
            <p>Each operates under its own privacy policy for the technical data it processes on our behalf.</p>
          </SectionCard>

          <SectionCard title="8. Data Retention" color="sky">
            <p>
              Anonymized applicant profiles that have entered the live game are kept
              indefinitely, since they're the core content of the game and contain no
              information about players. Profile submissions sit in the unpublished review
              queue until they're either added to the game (with identifying details
              stripped) or discarded. You can request removal of a specific submission at
              any time — see below.
            </p>
          </SectionCard>

          <SectionCard title="9. Your Rights" color="cream">
            <p>
              Because we don't collect information that identifies you, there's generally
              nothing tied to "you" to access, correct, or delete. The one exception is a
              profile you submitted yourself: if you'd like a specific submission removed
              from the review queue, contact us with enough detail (e.g. the schools
              listed, roughly when you submitted it) for us to find it.
            </p>
          </SectionCard>

          <SectionCard title="10. Changes to This Policy" color="teal">
            <p>
              If this policy changes, we'll update the "Last updated" date at the top of
              this page. Since the project is open-source, changes are also visible in the
              GitHub commit history.
            </p>
          </SectionCard>

          <SectionCard title="11. Contact" color="lavender">
            <p>
              Questions, or a removal request for a submitted profile? Reach out via{' '}
              <a href="https://github.com/saatvikkundoor/admissions-simulator/issues"
                 target="_blank" rel="noopener noreferrer"
                 className="underline hover:text-slate-800">
                GitHub Issues
              </a>{' '}
              on the project repo.
            </p>
          </SectionCard>

        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onClose}
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="px-8 py-3 rounded-xl font-semibold text-sm tracking-wide
                       bg-slate-900 text-white hover:bg-slate-700 transition-colors"
          >
            Back to game
          </button>
        </div>
      </div>
    </div>
  )
}