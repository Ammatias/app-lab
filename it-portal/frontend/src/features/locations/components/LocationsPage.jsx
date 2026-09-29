import { LocationsManagerModal } from './LocationsManagerModal'

export default function LocationsPage({ onBack, ...props }) {
  return <LocationsManagerModal {...props} pageMode={true} onBack={onBack} />
}
