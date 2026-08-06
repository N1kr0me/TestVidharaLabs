/**
 * District → allowed chilli variety IDs (catalogue in varieties.ts).
 * Narrative + sources: docs/district-chilli-varieties.md
 */

import { DEFAULT_VARIETY_ID, getVariety } from '@/lib/varieties'

/** First id is the default when a district is selected. */
export const DISTRICT_VARIETY_IDS: Record<string, string[]> = {
  // Andhra Pradesh
  guntur: ['guntur-sannam', 'teja', 'byadgi'],
  palnadu: ['guntur-sannam', 'teja'],
  prakasam: ['guntur-sannam', 'teja'],
  ntr: ['guntur-sannam', 'teja'],
  bapatla: ['guntur-sannam', 'teja'],
  annamayya: ['guntur-sannam', 'teja'],
  // Telangana
  khammam: ['teja', 'guntur-sannam'],
  mahabubabad: ['teja', 'guntur-sannam'],
  warangal: ['teja', 'guntur-sannam'],
  mulugu: ['teja'],
  bhadradri: ['teja', 'guntur-sannam'],
  // Karnataka
  haveri: ['byadgi'],
  dharwad: ['byadgi'],
  gadag: ['byadgi', 'teja'],
  ballari: ['byadgi', 'teja'],
  raichur: ['byadgi', 'teja'],
  koppal: ['byadgi', 'teja'],
  byadgi: ['byadgi'],
  // Madhya Pradesh
  khargone: ['teja', 'guntur-sannam'],
  barwani: ['teja', 'guntur-sannam'],
  dhar: ['teja', 'guntur-sannam'],
  khandwa: ['teja', 'guntur-sannam'],
  burhanpur: ['teja', 'guntur-sannam'],
  // Maharashtra
  nagpur: ['teja', 'guntur-sannam'],
  nanded: ['teja', 'guntur-sannam'],
  jalgaon: ['teja', 'guntur-sannam'],
  dhule: ['teja', 'guntur-sannam'],
  buldhana: ['teja', 'guntur-sannam'],
  washim: ['teja', 'guntur-sannam'],
  // Rajasthan
  jodhpur: ['kashmiri', 'teja'],
  barmer: ['kashmiri', 'teja'],
  nagaur: ['kashmiri', 'teja'],
  pali: ['kashmiri', 'teja'],
  // Odisha
  ganjam: ['bird-eye', 'teja'],
  kandhamal: ['bird-eye', 'teja'],
  koraput: ['bird-eye', 'teja'],
  rayagada: ['bird-eye', 'teja'],
  // Tamil Nadu
  ramanathapuram: ['bird-eye', 'guntur-sannam', 'teja'],
  virudhunagar: ['bird-eye', 'guntur-sannam', 'teja'],
  thoothukudi: ['bird-eye', 'teja'],
  sivaganga: ['bird-eye', 'teja'],
  // West Bengal
  murshidabad: ['bird-eye', 'teja'],
  nadia: ['bird-eye', 'teja'],
  n24pgs: ['bird-eye', 'teja'],
  // Gujarat
  banaskantha: ['kashmiri', 'teja'],
  mehsana: ['kashmiri', 'teja'],
  sabarkantha: ['kashmiri', 'teja'],
  // Uttar Pradesh
  jhansi: ['kashmiri', 'teja'],
  lalitpur: ['kashmiri', 'teja'],
  banda: ['kashmiri', 'teja'],
  // Bihar
  samastipur: ['bird-eye', 'teja'],
  muzaffarpur: ['bird-eye', 'teja'],
  vaishali: ['bird-eye', 'teja'],
}

export function varietiesForDistrict(districtId: string): string[] {
  return DISTRICT_VARIETY_IDS[districtId] ?? [DEFAULT_VARIETY_ID]
}

export function defaultVarietyForDistrict(districtId: string): string {
  return varietiesForDistrict(districtId)[0] ?? DEFAULT_VARIETY_ID
}

export function resolveDistrictVariety(
  districtId: string,
  preferredId?: string,
): string {
  const allowed = varietiesForDistrict(districtId)
  if (preferredId && allowed.includes(preferredId)) return preferredId
  return allowed[0] ?? DEFAULT_VARIETY_ID
}

export function varietyOptionsForDistrict(districtId: string) {
  return varietiesForDistrict(districtId).map((id) => {
    const v = getVariety(id)
    return { value: id, label: v.name }
  })
}
