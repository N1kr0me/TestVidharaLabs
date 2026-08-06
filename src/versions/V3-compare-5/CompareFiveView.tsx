import { CompareDistrictsView } from '@/components/CompareDistrictsView'
import type { CompanyId } from '@/lib/companies'
import type { UserRoleId } from '@/lib/roles'

/** Kept for future re-enable; App currently mounts CompareDistrictsView directly. */
export function CompareFiveView({
  role,
  company = 'spice-processors',
}: {
  role: UserRoleId
  company?: CompanyId
}) {
  return (
    <CompareDistrictsView role={role} company={company} maxSelect={5} />
  )
}
