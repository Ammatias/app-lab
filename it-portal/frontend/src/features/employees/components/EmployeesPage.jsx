import { EmployeeAccountsModal } from './EmployeeAccountsModal'

export default function EmployeesPage({ onBack, ...props }) {
  return <EmployeeAccountsModal {...props} pageMode={true} onBack={onBack} />
}
