const SESSION_KEY = 'vidhara-v5-session-count'
const SESSION_START_KEY = 'vidhara-v5-session-start'

export function getSessionNumber(): number {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (raw) return Number(raw)
  const prev = Number(localStorage.getItem(SESSION_KEY) ?? '0')
  const next = prev + 1
  localStorage.setItem(SESSION_KEY, String(next))
  sessionStorage.setItem(SESSION_KEY, String(next))
  return next
}

export function getSessionStartMs(): number {
  const raw = sessionStorage.getItem(SESSION_START_KEY)
  if (raw) return Number(raw)
  const now = Date.now()
  sessionStorage.setItem(SESSION_START_KEY, String(now))
  return now
}

export function formatSessionElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatLiveClock(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
