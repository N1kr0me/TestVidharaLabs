/**
 * Dashboard roles from docs/Unified_Strategy_Roles.md.
 * Production: bound to account. Mockup: header dropdown.
 */
export type UserRoleId = 'quality-head' | 'agronomy' | 'procurement'

export type UserRole = {
  id: UserRoleId
  label: string
  focus: string
}

export const USER_ROLES: UserRole[] = [
  {
    id: 'quality-head',
    label: 'Quality Head',
    focus:
      'Spec tolerance, colorimetric testing, customer allocation — commercial drill-down default.',
  },
  {
    id: 'agronomy',
    label: 'Agronomy Team',
    focus:
      'ESI drivers, growth-stage windows, literature thresholds — technical reasoning default.',
  },
  {
    id: 'procurement',
    label: 'Procurement Head',
    focus:
      'Volume allocation, cost avoidance, supplier risk — glance-level consequence default.',
  },
]

export const DEFAULT_ROLE: UserRoleId = 'procurement'
