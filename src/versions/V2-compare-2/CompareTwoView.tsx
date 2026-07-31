import { CompareDistrictsView } from '@/components/CompareDistrictsView'
import type { UserRoleId } from '@/lib/roles'

export function CompareTwoView({ role }: { role: UserRoleId }) {
  return (
    <CompareDistrictsView
      role={role}
      maxSelect={2}
      versionLabel="V2 · 2 districts"
      initialCount={2}
    />
  )
}
