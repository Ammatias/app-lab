import { VacationsModal } from './VacationsModal'

export default function VacationsPage({ onBack, ...props }) {
  return <VacationsModal {...props} pageMode={true} onBack={onBack} />
}
