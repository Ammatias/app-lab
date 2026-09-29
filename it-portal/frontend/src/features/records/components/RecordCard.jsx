import { FileArchive, Monitor, Pencil, Shield, Trash2 } from 'lucide-react'
import { CopyableText } from '../../../shared/ui/CopyableText'
import { connectAnyDesk } from '../../../shared/lib/anydesk'
import { downloadStoredFile } from '../../../shared/lib/files'
import { getDisplayValue } from '../../ecp/lib/ecpDates'
import { EcpExpiryBadge } from '../../ecp/components/EcpExpiryBadge'
import { getTypeIcon } from '../lib/recordTypeMeta'
import { ActionIconButton } from '../../../shared/ui/ActionIconButton'
import { downloadPrivateKeyArchive } from '../../../entities/items/api'
import { EcpInstallAction } from '../../ecp/components/EcpInstallAction'

export function RecordCard({ activeTab, item, onEdit, onDelete }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', wordBreak: 'break-word' }}>{item.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {getTypeIcon(activeTab)}
          <ActionIconButton onClick={(event) => onEdit(event, item)} title="Редактировать" rotate={-10} whileTap={{ scale: 0.92 }}>
            <Pencil size={16} />
          </ActionIconButton>
          <ActionIconButton onClick={(event) => onDelete(event, item)} title="Удалить" hoverColor="#f87171" rotate={10} whileTap={{ scale: 0.92 }}>
            <Trash2 size={16} />
          </ActionIconButton>
        </div>
      </div>

      {activeTab === 'password' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <CopyableText text={item.login} label="Логин:" />
          <CopyableText text={item.value} hidden={true} label="Пароль:" large={true} />
          {item.description && (
            <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {item.description}
            </div>
          )}
        </div>
      )}

      {activeTab === 'anydesk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Кабинет:</span>
            <span style={{ fontWeight: 'bold' }}>{item.room || '—'}</span>
          </div>
          <CopyableText text={item.value} label="ID:" large={true} />
          <CopyableText text={item.description} hidden={true} label="Пароль:" large={true} />
          <button
            className="btn btn-primary"
            style={{ marginTop: '5px', width: '100%', justifyContent: 'center' }}
            onClick={(event) => {
              event.stopPropagation()
              connectAnyDesk(item.value, item.description)
            }}
            title="Подключиться и скопировать пароль"
          >
            <Monitor size={18} style={{ marginRight: '8px' }} /> Подключиться
          </button>
        </div>
      )}

      {activeTab === 'ecp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <EcpExpiryBadge item={item} />
          <CopyableText text={getDisplayValue(item.login)} label="Логин:" large={true} />
          <CopyableText text={getDisplayValue(item.value)} hidden={getDisplayValue(item.value) !== 'Нет'} label="Пароль:" large={true} />
          <div style={{ display: 'flex', alignItems: 'stretch', gap: '10px', flexWrap: 'wrap' }}>
              {item.file_visible && item.file_data && (
                <button
                  className="btn btn-primary"
                  style={{ justifyContent: 'center', flex: '1 1 180px' }}
                  onClick={(event) => {
                    event.stopPropagation()
                    downloadStoredFile(item.file_name, item.file_mime_type, item.file_data)
                  }}
                  title={item.file_name || 'Скачать открытый файл'}
                >
                  <Shield size={18} style={{ marginRight: '8px' }} /> Открытый ключ
                </button>
              )}
              {item.private_file_visible && item.private_file_name && (
                <button
                  className="btn"
                  style={{ justifyContent: 'center', flex: '1 1 180px' }}
                  onClick={(event) => {
                    event.stopPropagation()
                    downloadPrivateKeyArchive(item.id, item.private_file_name).catch((error) => {
                      console.error(error)
                      alert(error.message)
                    })
                  }}
                  title={item.private_file_name}
                >
                  <FileArchive size={18} style={{ marginRight: '8px' }} /> Закрытый ключ ZIP
                </button>
              )}
              <EcpInstallAction item={item} />
          </div>
          {item.description && (
            <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {item.description}
            </div>
          )}
        </div>
      )}
    </>
  )
}
