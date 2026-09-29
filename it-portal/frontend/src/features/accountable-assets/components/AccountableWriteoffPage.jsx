import { AccountableWriteoffModal } from './AccountableWriteoffModal'

export default function AccountableWriteoffPage({ onBack, ...props }) {
  return <AccountableWriteoffModal {...props} open={true} onClose={onBack} pageMode={true} onBack={onBack} />
}
