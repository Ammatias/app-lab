import { NotificationsModal } from './NotificationsModal'

export default function NotificationsPage({ onBack, ...props }) {
  return <NotificationsModal {...props} open={true} onClose={onBack} pageMode={true} onBack={onBack} />
}
