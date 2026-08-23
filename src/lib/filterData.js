// filterData.js
// Client-side filtering over the (small) profile dataset. Loads once,
// caches for the session, and matches profiles against a filter object.
// No fuzzy logic — a college/major/ethnicity/residence filter is an exact
// match against the value as stored, since these are curated, not free text.

import { supabase } from '../supabaseClient'
import { getCollegeData, matchCollege } from './collegeData'

let cachedPromise = null

// Splits a major string on "," and "/" so a double-major like
// "Aerospace Engineering / Mechanical Engineering" contributes two
// separate filter options instead of one combined one. Trims whitespace
// and drops empty pieces from things like trailing delimiters.
function splitMajors(majorString) {
  if (!majorString) return []
  return majorString
    .split(/[,/]/)
    .map(m => m.trim())
    .filter(m => m.length > 0)
}

async function loadFilterData() {
  const [{ data: profiles, error: profilesError }, { data: schools, error: schoolsError }, collegeList] = await Promise.all([
    supabase.from('profiles').select('id, major_intended, race_ethnicity, residence, sat, act, gpa_weighted, gpa_unweighted'),
    supabase.from('schools').select('profile_id, school_name'),
    getCollegeData(),
  ])

  if (profilesError) console.error('Failed to load profiles for filtering:', profilesError.message)
  if (schoolsError) console.error('Failed to load schools for filtering:', schoolsError.message)

  const profileList = profiles ?? []
  const schoolRows = schools ?? []

  // Collapse aliases (e.g. "Yale" / "Yale University") to a single
  // canonical name using the same College Scorecard match the info popup
  // uses — so the filter list shows one option per school, and picking it
  // matches every profile row regardless of which alias was typed in.
  const canonicalName = (schoolName) => matchCollege(schoolName, collegeList)?.name ?? schoolName

  const schoolsByProfile = {}
  for (const row of schoolRows) {
    const name = canonicalName(row.school_name)
    if (!schoolsByProfile[row.profile_id]) schoolsByProfile[row.profile_id] = []
    if (!schoolsByProfile[row.profile_id].includes(name)) schoolsByProfile[row.profile_id].push(name)
  }

  const majorsByProfile = {}
  for (const profile of profileList) {
    majorsByProfile[profile.id] = splitMajors(profile.major_intended)
  }

  const uniqueSorted = (values) =>
    [...new Set(values.filter(v => v !== null && v !== undefined && v !== ''))].sort((a, b) => a.localeCompare(b))

  return {
    profiles: profileList,
    schoolsByProfile,
    majorsByProfile,
    options: {
      colleges:    uniqueSorted(schoolRows.map(r => canonicalName(r.school_name))),
      majors:      uniqueSorted(profileList.flatMap(p => splitMajors(p.major_intended))),
      ethnicities: uniqueSorted(profileList.map(p => p.race_ethnicity)),
      residences:  uniqueSorted(profileList.map(p => p.residence)),
    },
  }
}

// Cached — every caller shares one fetch for the session.
export function getFilterData() {
  if (!cachedPromise) cachedPromise = loadFilterData()
  return cachedPromise
}

export const DEFAULT_FILTERS = {
  colleges: [],
  majors: [],
  ethnicities: [],
  residences: [],
  satMin: null, satMax: null,
  actMin: null, actMax: null,
  gpaMin: null, gpaMax: null,
}

function profileMatches(profile, schoolsByProfile, majorsByProfile, filters) {
  if (filters.colleges.length > 0) {
    const applied = schoolsByProfile[profile.id] ?? []
    if (!applied.some(name => filters.colleges.includes(name))) return false
  }
  if (filters.majors.length > 0) {
    const majors = majorsByProfile[profile.id] ?? []
    if (!majors.some(m => filters.majors.includes(m))) return false
  }
  if (filters.ethnicities.length > 0 && !filters.ethnicities.includes(profile.race_ethnicity)) return false
  if (filters.residences.length > 0 && !filters.residences.includes(profile.residence)) return false

  if (filters.satMin != null || filters.satMax != null) {
    if (profile.sat == null) return false
    if (filters.satMin != null && profile.sat < filters.satMin) return false
    if (filters.satMax != null && profile.sat > filters.satMax) return false
  }
  if (filters.actMin != null || filters.actMax != null) {
    if (profile.act == null) return false
    if (filters.actMin != null && profile.act < filters.actMin) return false
    if (filters.actMax != null && profile.act > filters.actMax) return false
  }
  if (filters.gpaMin != null || filters.gpaMax != null) {
    if (profile.gpa_unweighted == null) return false
    if (filters.gpaMin != null && profile.gpa_unweighted < filters.gpaMin) return false
    if (filters.gpaMax != null && profile.gpa_unweighted > filters.gpaMax) return false
  }
  return true
}

export function getMatchingProfileIds(filterData, filters) {
  const { profiles, schoolsByProfile, majorsByProfile } = filterData
  return profiles.filter(p => profileMatches(p, schoolsByProfile, majorsByProfile, filters)).map(p => p.id)
}

export function countActiveFilters(filters) {
  let n = 0
  if (filters.colleges.length > 0) n++
  if (filters.majors.length > 0) n++
  if (filters.ethnicities.length > 0) n++
  if (filters.residences.length > 0) n++
  if (filters.satMin != null || filters.satMax != null) n++
  if (filters.actMin != null || filters.actMax != null) n++
  if (filters.gpaMin != null || filters.gpaMax != null) n++
  return n
}