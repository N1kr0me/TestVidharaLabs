import { CompareDistrictsView } from '@/components/CompareDistrictsView'
import type { UserRoleId } from '@/lib/roles'

export function CompareFiveView({ role }: { role: UserRoleId }) {
  return (
    <CompareDistrictsView
      role={role}
      maxSelect={5}
      versionLabel="V3 · up to 5 districts"
      initialCount={3}
    />
  )
}
