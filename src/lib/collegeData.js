// collegeData.js
// Loads college_scorecard once and caches it for the session. Matching is
// intentionally exact (after light normalization) against name + aliases —
// no fuzzy scoring, since a wrong college shown as "this one" is worse than
// no info icon at all. Misses get fixed by editing aliases in Supabase.

import { supabase } from '../supabaseClient'

let cachedPromise = null

function normalize(str) {
  return (str ?? '')
    .toLowerCase()
    .replace(/[.,'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function loadCollegeData() {
  const { data, error } = await supabase.from('college_scorecard').select('*')
  if (error) {
    console.error('Failed to load college_scorecard:', error.message)
    return []
  }
  return data.map(row => ({
    ...row,
    _normalizedName: normalize(row.name),
    _normalizedAliases: (row.aliases ?? []).map(normalize),
  }))
}

// Cached — every caller shares one fetch for the session.
export function getCollegeData() {
  if (!cachedPromise) cachedPromise = loadCollegeData()
  return cachedPromise
}

export function matchCollege(schoolName, collegeList) {
  const target = normalize(schoolName)
  if (!target) return null
  return (
    collegeList.find(c => c._normalizedName === target) ??
    collegeList.find(c => c._normalizedAliases.includes(target)) ??
    null
  )
}