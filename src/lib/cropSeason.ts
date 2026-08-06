export type CropSeason = 'Kharif' | 'Rabi'

export const CROP_SEASONS: CropSeason[] = ['Kharif', 'Rabi']

/** Indian chilli season window from calendar month (synthetic). */
export function inferCropSeason(date = new Date()): CropSeason {
  const m = date.getMonth() + 1
  // Nov–Mar → Rabi; Apr–Oct → Kharif (includes former Zaid gap into Kharif)
  if (m >= 11 || m <= 3) return 'Rabi'
  return 'Kharif'
}

export function cropSeasonHint(season: CropSeason): string {
  switch (season) {
    case 'Kharif':
      return 'Apr–Oct monsoon / early window'
    case 'Rabi':
      return 'Nov–Mar winter harvest'
  }
}
