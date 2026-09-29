import { AccountableImportsModal } from './AccountableAssetsPage'

export default function AccountableImportsPage({ onBack, ...props }) {
  return <AccountableImportsModal {...props} open={true} onClose={onBack} pageMode={true} onBack={onBack} />
}
