import { CompareDistrictsView } from '@/components/CompareDistrictsView'
import { DEFAULT_COMPANY } from '@/lib/companies'
import type { UserRoleId } from '@/lib/roles'

/** Kept for future re-enable; not mounted in App. */
export function CompareTwoView({ role }: { role: UserRoleId }) {
  return (
    <CompareDistrictsView
      role={role}
      company={DEFAULT_COMPANY}
      maxSelect={2}
    />
  )
}
