import { memo, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, ListTree, Upload } from 'lucide-react'
import { containerVariants } from '../../../shared/lib/motion'
import { getNetworkRate } from '../../../shared/lib/networkSpeed'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { LoadingState } from '../../../shared/ui/LoadingState'
import { PhonebookDepartmentSection } from './PhonebookDepartmentSection'
import { requestTacticalAgentAction } from '../../../entities/tactical/api'
import { TrmmActionDialog } from '../../tactical/components/TrmmActionDialog'

const PhonebookPageComponent = ({
  groupedPhonebook,
  anydeskItems = [],
  loading,
  onEdit,
  onToggleAccounting,
  togglingContactId,
  onApplyNetworkLimit,
  onClearNetworkLimit,
  limitingContactId,
  onGenerateAgentScript,
  generatingAgentContactId,
  directoryView
}) => {
  const isExternalView = directoryView === 'external'
  const [sortMode, setSortMode] = useState('directory')
  const [tacticalActionDialog, setTacticalActionDialog] = useState(null)
  const [tacticalActionReason, setTacticalActionReason] = useState('')
  const [tacticalActionAgentId, setTacticalActionAgentId] = useState(null)
  const [tacticalActionMessage, setTacticalActionMessage] = useState(null)

  const runTacticalAction = async (contact, action, reason) => {
    setTacticalActionAgentId(contact.tactical_agent_id)
    setTacticalActionMessage(null)
    try {
      const result = await requestTacticalAgentAction(contact.tactical_agent_id, action, reason)
      setTacticalActionMessage({ success: true, text: result.message })
      setTacticalActionDialog(null)
      setTacticalActionReason('')
    } catch (error) {
      setTacticalActionMessage({ success: false, text: error.message })
    } finally {
      setTacticalActionAgentId(null)
    }
  }

  const handleTacticalAction = (contact, action) => {
    setTacticalActionDialog({ contact, action })
    setTacticalActionReason('')
  }
  const visibleGroups = useMemo(() => {
    if (isExternalView || sortMode === 'directory') return groupedPhonebook

    const field = sortMode === 'upload' ? 'network_upload_bps' : 'network_download_bps'
    const contacts = groupedPhonebook
      .flatMap((group) => group.contacts)
      .slice()
      .sort((left, right) => (
        getNetworkRate(right, field) - getNetworkRate(left, field)
        || String(left.name || '').localeCompare(String(right.name || ''), 'ru-RU')
      ))

    return contacts.length > 0
      ? [{
          title: sortMode === 'upload' ? 'Сетевая нагрузка · отдача' : 'Сетевая нагрузка · загрузка',
          contacts
        }]
      : []
  }, [groupedPhonebook, isExternalView, sortMode])

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="content-stack phonebook-stack"
      >
        <LoadingState />
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="content-stack phonebook-stack"
    >
      {!isExternalView && (
        <div className="phonebook-sort-toolbar">
          <span>Сортировка</span>
          <div className="phonebook-sort-control" role="group" aria-label="Сортировка телефонного справочника">
            {[
              { value: 'directory', label: 'По отделам', Icon: ListTree },
              { value: 'download', label: 'Загрузка', Icon: Download },
              { value: 'upload', label: 'Отдача', Icon: Upload }
            ].map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                className={sortMode === value ? 'is-active' : ''}
                aria-pressed={sortMode === value}
                onClick={() => setSortMode(value)}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          {tacticalActionMessage && (
            <span className={`phonebook-trmm-action-message ${tacticalActionMessage.success ? 'is-success' : 'is-error'}`} role="status">
              {tacticalActionMessage.text}
            </span>
          )}
        </div>
      )}
      {visibleGroups.map((group, index) => (
        <PhonebookDepartmentSection
          key={`${group.title}-${index}`}
          group={group}
          anydeskItems={anydeskItems}
          onEdit={onEdit}
          onToggleAccounting={onToggleAccounting}
          togglingContactId={togglingContactId}
          onApplyNetworkLimit={onApplyNetworkLimit}
          onClearNetworkLimit={onClearNetworkLimit}
          limitingContactId={limitingContactId}
          onGenerateAgentScript={onGenerateAgentScript}
          generatingAgentContactId={generatingAgentContactId}
          onTacticalAction={handleTacticalAction}
          tacticalActionAgentId={tacticalActionAgentId}
          isExternalView={isExternalView}
        />
      ))}
      {visibleGroups.length === 0 && (
        <EmptyState>{isExternalView ? 'Во внешнем справочнике пока ничего нет.' : 'Ничего не найдено.'}</EmptyState>
      )}
      <TrmmActionDialog
        contact={tacticalActionDialog?.contact}
        action={tacticalActionDialog?.action}
        reason={tacticalActionReason}
        busy={Boolean(tacticalActionDialog?.contact?.tactical_agent_id && tacticalActionAgentId === tacticalActionDialog.contact.tactical_agent_id)}
        onReasonChange={setTacticalActionReason}
        onClose={() => { setTacticalActionDialog(null); setTacticalActionReason('') }}
        onConfirm={() => runTacticalAction(
          tacticalActionDialog.contact,
          tacticalActionDialog.action,
          tacticalActionDialog.action === 'reboot' ? tacticalActionReason : 'Подтверждённый Wake-on-LAN из IT Portal'
        )}
      />
    </motion.div>
  )
}

export default memo(PhonebookPageComponent)
