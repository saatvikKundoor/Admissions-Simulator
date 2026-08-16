// SubmitProfileForm.jsx
// Full-shape submission form mirroring the real profiles/schools schema.
// Writes to submitted_profiles / submitted_schools — isolated review-queue
// tables the live game never reads from. RLS on those tables is INSERT-only
// for anon, so there's no SELECT policy to read a generated id back with —
// the row id is generated client-side via crypto.randomUUID() instead, and
// reused as submission_id on the school rows.
//
// Client-side validation mirrors the DB-level CHECK constraints on
// submitted_profiles/submitted_schools — this doesn't replace those
// constraints (an insert can still fail server-side, e.g. if this code
// and the SQL policy ever drift), it just gives the player a specific,
// actionable message instead of a generic RLS rejection.

import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { playClick, playToggleClick, playHover } from '../lib/sound'

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

function PlusIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function TrashIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  )
}

const OUTCOMES = ['Admitted', 'Waitlisted', 'Rejected', 'Deferred']

const fieldBase = "px-3 py-2 rounded-lg border border-black/10 bg-white/70 text-sm " +
                   "text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
const inputClass = `${fieldBase} w-full`
const invalidInputClass = `${inputClass} border-red-300 focus:ring-red-300`

// ── Validation helpers ──────────────────────────────────────────────────
// Every one of these treats a blank value as valid — these are optional
// fields, so "didn't answer" and "answered wrong" are different states.
// Only an out-of-range or malformed value blocks submission.

function hasOrphanedDescription(items) {
  return items.some(x => x.title.trim() === '' && x.description.trim() !== '')
}


function isValidSourceUrl(value) {
  const trimmed = value.trim()
  if (trimmed === '') return false
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function isValidIntInRange(value, min, max) {
  if (value.trim() === '') return true
  if (!/^\d+$/.test(value.trim())) return false // digits only — no e, +, -, or decimal point
  const n = Number(value)
  return n >= min && n <= max
}

function isValidNumberInRange(value, min, max) {
  if (value.trim() === '') return true
  if (!/^\d+(\.\d+)?$/.test(value.trim())) return false // digits, optional single decimal — no e/+/-
  const n = Number(value)
  return n >= min && n <= max
}

// add alongside them
function blockInvalidNumberKeys(e) {
  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault()
}

function SectionCard({ title, color, children }) {
  const colors = {
    lavender: 'bg-[#E8E4F3]',
    cream:    'bg-[#F5EDD6]',
    sky:      'bg-[#D4EAF5]',
    teal:     'bg-[#C8E6E2]',
  }
  return (
    <div className={`rounded-2xl p-5 ${colors[color] ?? 'bg-slate-100'}`}>
      <h2 style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-xl font-semibold text-slate-800 mb-4">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">{label}</span>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </label>
  )
}

// EC / Award entries as { title, description } — matches the shape
// ProfileCard's ecToString() already knows how to render.
function StructuredListInput({ items, onChange, titlePlaceholder, descriptionPlaceholder }) {
  function updateItem(i, key, value) {
    const next = [...items]
    next[i] = { ...next[i], [key]: value }
    onChange(next)
  }
  function addItem() {
    playToggleClick()
    onChange([...items, { title: '', description: '' }])
  }
  function removeItem(i) {
    playToggleClick()
    onChange(items.filter((_, idx) => idx !== i))
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const orphaned = item.title.trim() === '' && item.description.trim() !== ''
        return (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <input
                value={item.title}
                onChange={(e) => updateItem(i, 'title', e.target.value)}
                placeholder={titlePlaceholder}
                className={orphaned ? invalidInputClass : inputClass}
              />
              <input
                value={item.description}
                onChange={(e) => updateItem(i, 'description', e.target.value)}
                placeholder={descriptionPlaceholder}
                className={inputClass}
              />
              {orphaned && (
                <p className="text-xs text-red-500">Add a title, or clear this detail — a detail with no title won't be saved.</p>
              )}
            </div>
            <button type="button" onClick={() => removeItem(i)} aria-label="Remove"
                    className="shrink-0 p-2 mt-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white/50 transition-colors">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )
      })}
      <button type="button" onClick={addItem}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
        <PlusIcon className="w-3.5 h-3.5" /> Add
      </button>
    </div>
  )
}

function SchoolListInput({ schools, onChange }) {
  function updateSchool(i, key, value) {
    const next = [...schools]
    next[i] = { ...next[i], [key]: value }
    onChange(next)
  }
  function addSchool() {
    playToggleClick()
    onChange([...schools, { school_name: '', outcome: 'Admitted' }])
  }
  function removeSchool(i) {
    playToggleClick()
    onChange(schools.filter((_, idx) => idx !== i))
  }
  return (
    <div className="space-y-2">
      {schools.map((s, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={s.school_name}
            onChange={(e) => updateSchool(i, 'school_name', e.target.value)}
            placeholder="School name"
            className={`${fieldBase} flex-1 min-w-0`}
          />
          <select
            value={s.outcome}
            onChange={(e) => updateSchool(i, 'outcome', e.target.value)}
            className={`${fieldBase} w-36 shrink-0`}
          >
            {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <button type="button" onClick={() => removeSchool(i)} aria-label="Remove"
                  className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white/50 transition-colors">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={addSchool}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
        <PlusIcon className="w-3.5 h-3.5" /> Add school
      </button>
    </div>
  )
}

const EMPTY_FORM = {
  state: '', gender: '', race_ethnicity: '', major_intended: '',
  first_gen: false, international: false,
  sat: '', act: '', gpa_weighted: '', gpa_unweighted: '', class_rank: '', ap_ib_de_count: '',
  source_url: '',
}

export default function SubmitProfileForm({ onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [extracurriculars, setExtracurriculars] = useState([{ title: '', description: '' }])
  const [awards, setAwards] = useState([{ title: '', description: '' }])
  const [schools, setSchools] = useState([{ school_name: '', outcome: 'Admitted' }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const validSchools = schools.filter(s => s.school_name.trim() !== '')

  function cleanStructuredList(items) {
    return items
      .filter(x => x.title.trim() !== '')
      .map(x => ({ title: x.title.trim(), description: x.description.trim() }))
  }

  // ── Field-level validity flags ──────────────────────────────────────
  const ecOrphaned         = hasOrphanedDescription(extracurriculars)
  const awardsOrphaned     = hasOrphanedDescription(awards)
  const sourceUrlInvalid   = !isValidSourceUrl(form.source_url)
  const satInvalid         = !isValidIntInRange(form.sat, 400, 1600)
  const actInvalid         = !isValidIntInRange(form.act, 1, 36)
  const gpaWeightedInvalid   = !isValidNumberInRange(form.gpa_weighted, 0, 10)
  const gpaUnweightedInvalid = !isValidNumberInRange(form.gpa_unweighted, 0, 5)
  const apIbDeInvalid      = !isValidIntInRange(form.ap_ib_de_count, 0, 30)

  // ── Ordered list of blocking issues, first match wins for the helper
  // text at the bottom of the form. Order roughly follows the order
  // fields appear on the page, so "fix this" points at the first thing
  // the player would actually scroll past.
  const validationErrors = [
    { invalid: ecOrphaned || awardsOrphaned, message: 'Fix the highlighted detail fields above before submitting.', bold: true },
    { invalid: satInvalid, message: 'SAT must be between 400 and 1600 before submitting.' },
    { invalid: actInvalid, message: 'ACT must be between 1 and 36 before submitting.' },
    { invalid: gpaWeightedInvalid, message: 'Weighted GPA must be between 0 and 10 before submitting.' },
    { invalid: gpaUnweightedInvalid, message: 'Unweighted GPA must be between 0 and 5 before submitting.' },
    { invalid: apIbDeInvalid, message: 'AP/IB/DE count must be between 0 and 30 before submitting.' },
    { invalid: sourceUrlInvalid, message: form.source_url.trim() === ''
        ? 'A source link is required before submitting.'
        : 'Add a valid source link before submitting.' },
    { invalid: validSchools.length === 0, message: 'Add at least one school to submit.' },
  ]

  const firstError = validationErrors.find(e => e.invalid)
  const canSubmit = !firstError && !submitting

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)

    const profileId = crypto.randomUUID()

    const { error: profileError } = await supabase.from('submitted_profiles').insert({
      id: profileId,
      state: form.state || null,
      gender: form.gender || null,
      race_ethnicity: form.race_ethnicity || null,
      major_intended: form.major_intended || null,
      first_gen: form.first_gen,
      international: form.international,
      sat: form.sat ? Number(form.sat) : null,
      act: form.act ? Number(form.act) : null,
      gpa_weighted: form.gpa_weighted ? Number(form.gpa_weighted) : null,
      gpa_unweighted: form.gpa_unweighted ? Number(form.gpa_unweighted) : null,
      class_rank: form.class_rank || null,
      ap_ib_de_count: form.ap_ib_de_count ? Number(form.ap_ib_de_count) : null,
      extracurriculars: cleanStructuredList(extracurriculars),
      awards: cleanStructuredList(awards),
      source_url: form.source_url || null,
    })

    if (profileError) {
      setError(profileError.message)
      setSubmitting(false)
      return
    }

    const { error: schoolsError } = await supabase.from('submitted_schools').insert(
      validSchools.map(s => ({
        submission_id: profileId,
        school_name: s.school_name.trim(),
        outcome: s.outcome,
      }))
    )

    if (schoolsError) {
      setError(schoolsError.message)
      setSubmitting(false)
      return
    }

    playClick()
    setSubmitting(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p style={{ fontFamily: "'Playfair Display', serif" }}
             className="text-3xl font-semibold text-slate-900 mb-3">
            Thanks — submitted for review.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            Profiles are checked by hand before they enter the game. If yours fits, you'll see it in a future round.
          </p>
          <button
            onClick={() => { playToggleClick(); onClose() }}
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="px-8 py-3 rounded-xl font-semibold text-sm tracking-wide
                       bg-slate-900 text-white hover:bg-slate-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F2F0EB]">
      <div className="max-w-3xl mx-auto px-6 md:px-10 lg:px-16 py-10">

        <header className="flex items-start justify-between mb-6">
          <div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
               className="text-slate-400 text-xs uppercase tracking-widest mb-2">
              Contribute a profile
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-4xl font-semibold text-slate-900 tracking-tight">
              Submit a Profile
            </h1>
          </div>
          <button
            onClick={() => { playToggleClick(); onClose() }}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 transition-colors mt-2"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-amber-800">
              Please don't include names, usernames, or anything else that could identify the
              applicant. Submissions are reviewed by hand before anything is added to the game.
            </p>
          </div>

          <div className="space-y-4">
            <SectionCard title="Demographics" color="teal">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="State">
                  <input value={form.state} onChange={e => setField('state', e.target.value)}
                         className={inputClass} placeholder="e.g. MN" />
                </Field>
                <Field label="Gender">
                  <input value={form.gender} onChange={e => setField('gender', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Ethnicity">
                  <input value={form.race_ethnicity} onChange={e => setField('race_ethnicity', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Intended Major">
                  <input value={form.major_intended} onChange={e => setField('major_intended', e.target.value)} className={inputClass} />
                </Field>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.first_gen} onChange={e => setField('first_gen', e.target.checked)} />
                  First-generation
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.international} onChange={e => setField('international', e.target.checked)} />
                  International
                </label>
              </div>
            </SectionCard>

            <SectionCard title="Academics" color="lavender">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="SAT" error={satInvalid ? 'Must be between 400 and 1600.' : null}>
                  <input type="number" value={form.sat} onKeyDown={blockInvalidNumberKeys}
                         onChange={e => setField('sat', e.target.value)}
                         className={satInvalid ? invalidInputClass : inputClass} />
                </Field>
                <Field label="ACT" error={actInvalid ? 'Must be between 1 and 36.' : null}>
                  <input type="number" value={form.act} onKeyDown={blockInvalidNumberKeys}
                         onChange={e => setField('act', e.target.value)}
                         className={actInvalid ? invalidInputClass : inputClass} />
                </Field>
                <Field label="Weighted GPA" error={gpaWeightedInvalid ? 'Must be between 0 and 10.' : null}>
                  <input type="number" step="0.01" value={form.gpa_weighted} onKeyDown={blockInvalidNumberKeys}
                         onChange={e => setField('gpa_weighted', e.target.value)}
                         className={gpaWeightedInvalid ? invalidInputClass : inputClass} />
                </Field>
                <Field label="Unweighted GPA" error={gpaUnweightedInvalid ? 'Must be between 0 and 5.' : null}>
                  <input type="number" step="0.01" value={form.gpa_unweighted} onKeyDown={blockInvalidNumberKeys}
                         onChange={e => setField('gpa_unweighted', e.target.value)}
                         className={gpaUnweightedInvalid ? invalidInputClass : inputClass} />
                </Field>
                <Field label="Class Rank">
                  <input value={form.class_rank}
                         onChange={e => setField('class_rank', e.target.value)}
                         className={inputClass} placeholder="e.g. Top 5%" />
                </Field>
                <Field label="AP/IB/DE Count" error={apIbDeInvalid ? 'Must be a whole number between 0 and 30.' : null}>
                  <input type="number" value={form.ap_ib_de_count} onKeyDown={blockInvalidNumberKeys}
                         onChange={e => setField('ap_ib_de_count', e.target.value)}
                         className={apIbDeInvalid ? invalidInputClass : inputClass} />
                </Field>
              </div>
            </SectionCard>

            <SectionCard title="Extracurriculars" color="sky">
              <StructuredListInput
                items={extracurriculars}
                onChange={setExtracurriculars}
                titlePlaceholder="e.g. Varsity Tennis, Captain"
                descriptionPlaceholder="Optional detail — e.g. Led team to regional finals"
              />
            </SectionCard>

            <SectionCard title="Awards" color="cream">
              <StructuredListInput
                items={awards}
                onChange={setAwards}
                titlePlaceholder="e.g. USACO Gold"
                descriptionPlaceholder="Optional detail — e.g. Top 50 nationally"
              />
            </SectionCard>

            <SectionCard title="Schools & Outcomes" color="teal">
              <SchoolListInput schools={schools} onChange={setSchools} />
            </SectionCard>

            <SectionCard title="Source" color="lavender">
              <Field
                label="Reddit, Tiktok, Insta, etc post URL (REQUIRED, this is never shown to players, but needed for making sure it's legit :), Feel free to submit your own post!)"
                error={sourceUrlInvalid
                  ? (form.source_url.trim() === ''
                      ? 'A source link is required so submissions can be verified.'
                      : "That doesn't look like a valid link — check it's a full URL starting with http:// or https://")
                  : null}
              >
                <input
                  value={form.source_url}
                  onChange={e => setField('source_url', e.target.value)}
                  className={sourceUrlInvalid ? invalidInputClass : inputClass}
                  placeholder="https://reddit.com/r/collegeresults/..."
                />
              </Field>
            </SectionCard>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            <p className={`text-xs ${firstError?.bold ? 'font-semibold text-red-500' : 'text-slate-400'}`}>
              {firstError
                ? firstError.message
                : `${validSchools.length} school${validSchools.length !== 1 ? 's' : ''} ready to submit.`}
            </p>
            <button
              type="submit"
              disabled={!canSubmit}
              onMouseEnter={playHover}
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="px-8 py-3 rounded-xl font-semibold text-sm tracking-wide transition-colors
                         bg-slate-900 text-white hover:bg-slate-700
                         disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shrink-0"
            >
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

//