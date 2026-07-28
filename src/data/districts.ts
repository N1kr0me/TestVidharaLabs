export interface District {
  id: string
  name: string
  state: string
  lat: number
  lon: number
  cluster?: string
}

/** Approximate district centroids for chilli production clusters (demo). */
export const districts: District[] = [
  // Andhra Pradesh
  { id: 'guntur', name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365, cluster: 'Guntur–Palnadu' },
  { id: 'palnadu', name: 'Palnadu', state: 'Andhra Pradesh', lat: 16.5200, lon: 79.8700, cluster: 'Guntur–Palnadu' },
  { id: 'prakasam', name: 'Prakasam', state: 'Andhra Pradesh', lat: 15.5057, lon: 80.0499 },
  { id: 'ntr', name: 'NTR', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
  { id: 'bapatla', name: 'Bapatla', state: 'Andhra Pradesh', lat: 15.9042, lon: 80.4675 },
  { id: 'annamayya', name: 'Annamayya', state: 'Andhra Pradesh', lat: 14.0500, lon: 78.7500 },
  // Telangana
  { id: 'khammam', name: 'Khammam', state: 'Telangana', lat: 17.2473, lon: 80.1514, cluster: 'Khammam–Warangal' },
  { id: 'mahabubabad', name: 'Mahabubabad', state: 'Telangana', lat: 17.5980, lon: 80.0020, cluster: 'Khammam–Warangal' },
  { id: 'warangal', name: 'Warangal', state: 'Telangana', lat: 17.9689, lon: 79.5941, cluster: 'Khammam–Warangal' },
  { id: 'mulugu', name: 'Mulugu', state: 'Telangana', lat: 18.1910, lon: 80.3310 },
  { id: 'bhadradri', name: 'Bhadradri Kothagudem', state: 'Telangana', lat: 17.5510, lon: 80.6200 },
  // Karnataka
  { id: 'haveri', name: 'Haveri', state: 'Karnataka', lat: 14.7934, lon: 75.4040 },
  { id: 'dharwad', name: 'Dharwad', state: 'Karnataka', lat: 15.4589, lon: 75.0078 },
  { id: 'gadag', name: 'Gadag', state: 'Karnataka', lat: 15.4326, lon: 75.6350 },
  { id: 'ballari', name: 'Ballari', state: 'Karnataka', lat: 15.1394, lon: 76.9214 },
  { id: 'raichur', name: 'Raichur', state: 'Karnataka', lat: 16.2076, lon: 77.3463 },
  { id: 'koppal', name: 'Koppal', state: 'Karnataka', lat: 15.3452, lon: 76.1547 },
  { id: 'byadgi', name: 'Byadgi', state: 'Karnataka', lat: 14.6730, lon: 75.4870, cluster: 'Byadgi high-colour' },
  // Madhya Pradesh
  { id: 'khargone', name: 'Khargone', state: 'Madhya Pradesh', lat: 21.8229, lon: 75.6139 },
  { id: 'barwani', name: 'Barwani', state: 'Madhya Pradesh', lat: 22.0324, lon: 74.8980 },
  { id: 'dhar', name: 'Dhar', state: 'Madhya Pradesh', lat: 22.6013, lon: 75.3025 },
  { id: 'khandwa', name: 'Khandwa', state: 'Madhya Pradesh', lat: 21.8257, lon: 76.3523 },
  { id: 'burhanpur', name: 'Burhanpur', state: 'Madhya Pradesh', lat: 21.3089, lon: 76.2299 },
  // Maharashtra
  { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
  { id: 'nanded', name: 'Nanded', state: 'Maharashtra', lat: 19.1383, lon: 77.3210 },
  { id: 'jalgaon', name: 'Jalgaon', state: 'Maharashtra', lat: 21.0077, lon: 75.5626 },
  { id: 'dhule', name: 'Dhule', state: 'Maharashtra', lat: 20.9042, lon: 74.7749 },
  { id: 'buldhana', name: 'Buldhana', state: 'Maharashtra', lat: 20.5290, lon: 76.1830 },
  { id: 'washim', name: 'Washim', state: 'Maharashtra', lat: 20.1110, lon: 77.1330 },
  // Rajasthan
  { id: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243 },
  { id: 'barmer', name: 'Barmer', state: 'Rajasthan', lat: 25.7520, lon: 71.3960 },
  { id: 'nagaur', name: 'Nagaur', state: 'Rajasthan', lat: 27.2020, lon: 73.7340 },
  { id: 'pali', name: 'Pali', state: 'Rajasthan', lat: 25.7710, lon: 73.3230 },
  // Odisha
  { id: 'ganjam', name: 'Ganjam', state: 'Odisha', lat: 19.3870, lon: 85.0510 },
  { id: 'kandhamal', name: 'Kandhamal', state: 'Odisha', lat: 20.1340, lon: 84.0160 },
  { id: 'koraput', name: 'Koraput', state: 'Odisha', lat: 18.8130, lon: 82.7100 },
  { id: 'rayagada', name: 'Rayagada', state: 'Odisha', lat: 19.1710, lon: 83.4160 },
  // Tamil Nadu
  { id: 'ramanathapuram', name: 'Ramanathapuram', state: 'Tamil Nadu', lat: 9.3710, lon: 78.8300 },
  { id: 'virudhunagar', name: 'Virudhunagar', state: 'Tamil Nadu', lat: 9.5680, lon: 77.9620 },
  { id: 'thoothukudi', name: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.7640, lon: 78.1340 },
  { id: 'sivaganga', name: 'Sivaganga', state: 'Tamil Nadu', lat: 9.8470, lon: 78.4810 },
  // West Bengal
  { id: 'murshidabad', name: 'Murshidabad', state: 'West Bengal', lat: 24.1750, lon: 88.2800 },
  { id: 'nadia', name: 'Nadia', state: 'West Bengal', lat: 23.4710, lon: 88.5560 },
  { id: 'n24pgs', name: 'North 24 Parganas', state: 'West Bengal', lat: 22.6160, lon: 88.4020 },
  // Gujarat
  { id: 'banaskantha', name: 'Banaskantha', state: 'Gujarat', lat: 24.1720, lon: 72.4330 },
  { id: 'mehsana', name: 'Mehsana', state: 'Gujarat', lat: 23.5880, lon: 72.3690 },
  { id: 'sabarkantha', name: 'Sabarkantha', state: 'Gujarat', lat: 23.6030, lon: 72.9500 },
  // Uttar Pradesh
  { id: 'jhansi', name: 'Jhansi', state: 'Uttar Pradesh', lat: 25.4484, lon: 78.5685 },
  { id: 'lalitpur', name: 'Lalitpur', state: 'Uttar Pradesh', lat: 24.6900, lon: 78.4150 },
  { id: 'banda', name: 'Banda', state: 'Uttar Pradesh', lat: 25.4750, lon: 80.3350 },
  // Bihar
  { id: 'samastipur', name: 'Samastipur', state: 'Bihar', lat: 25.8630, lon: 85.7810 },
  { id: 'muzaffarpur', name: 'Muzaffarpur', state: 'Bihar', lat: 26.1209, lon: 85.3647 },
  { id: 'vaishali', name: 'Vaishali', state: 'Bihar', lat: 25.6830, lon: 85.3550 },
]

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function nearestDistrict(lat: number, lon: number): District {
  let best = districts[0]
  let bestDist = Infinity
  for (const d of districts) {
    const dist = haversineKm(lat, lon, d.lat, d.lon)
    if (dist < bestDist) {
      bestDist = dist
      best = d
    }
  }
  return best
}

export function getDistrictById(id: string): District | undefined {
  return districts.find((d) => d.id === id)
}
