import { motion } from 'framer-motion'
import { itemVariants } from '../../../shared/lib/motion'
import { PhonebookTable } from './PhonebookTable'

export function PhonebookDepartmentSection({
  group,
  anydeskItems,
  onEdit,
  onToggleAccounting,
  togglingContactId,
  onApplyNetworkLimit,
  onClearNetworkLimit,
  limitingContactId,
  onGenerateAgentScript,
  generatingAgentContactId,
  onTacticalAction,
  tacticalActionAgentId,
  isExternalView
}) {
  return (
    <motion.div variants={itemVariants} className="glass-panel phonebook-section" style={{ overflow: 'hidden' }}>
      <div className="phonebook-department" style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontWeight: 'bold', letterSpacing: '1px' }}>
        {group.title}
      </div>
      <PhonebookTable
        contacts={group.contacts}
        anydeskItems={anydeskItems}
        onEdit={onEdit}
        onToggleAccounting={onToggleAccounting}
        togglingContactId={togglingContactId}
        onApplyNetworkLimit={onApplyNetworkLimit}
        onClearNetworkLimit={onClearNetworkLimit}
        limitingContactId={limitingContactId}
        onGenerateAgentScript={onGenerateAgentScript}
        generatingAgentContactId={generatingAgentContactId}
        onTacticalAction={onTacticalAction}
        tacticalActionAgentId={tacticalActionAgentId}
        isExternalView={isExternalView}
      />
    </motion.div>
  )
}
