import { DepartmentsManagerModal } from './DepartmentsManagerModal'

export default function DepartmentsPage({ onBack, ...props }) {
  return <DepartmentsManagerModal {...props} pageMode={true} onBack={onBack} />
}
