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

export function RecordRow({ activeTab, item, onEdit, onDelete }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '20px', flexWrap: 'nowrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: '1 1 auto', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px', flexShrink: 0 }}>
          {getTypeIcon(activeTab)}
          <h3 style={{ margin: 0, fontSize: '1.05rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {item.title}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'nowrap', flex: 1, overflowX: 'auto', paddingBottom: '2px' }}>
          {activeTab === 'anydesk' && (
            <>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 'fit-content' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Кабинет:</span>
                <span style={{ fontWeight: 'bold' }}>{item.room || '—'}</span>
              </div>
              <CopyableText text={item.value} label="ID:" large={true} />
              <CopyableText text={item.description} hidden={true} label="Пароль:" large={true} />
              <button
                className="btn btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', marginLeft: '10px' }}
                onClick={(event) => {
                  event.stopPropagation()
                  connectAnyDesk(item.value, item.description)
                }}
                title="Подключиться и скопировать пароль"
              >
                <Monitor size={14} style={{ marginRight: '6px' }} /> Подключиться
              </button>
            </>
          )}

          {activeTab === 'password' && (
            <>
              <CopyableText text={item.login} label="Логин:" />
              <CopyableText text={item.value} hidden={true} label="Пароль:" large={true} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.description}
              </div>
            </>
          )}

          {activeTab === 'ecp' && (
            <>
              <EcpExpiryBadge item={item} compact />
              <CopyableText text={getDisplayValue(item.login)} label="Логин:" large={true} />
              <CopyableText text={getDisplayValue(item.value)} hidden={getDisplayValue(item.value) !== 'Нет'} label="Пароль:" large={true} />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 'fit-content' }}>
                  {item.file_visible && item.file_data && (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={(event) => {
                        event.stopPropagation()
                        downloadStoredFile(item.file_name, item.file_mime_type, item.file_data)
                      }}
                      title={item.file_name || 'Скачать открытый файл'}
                    >
                      <Shield size={14} style={{ marginRight: '6px' }} /> Открытый ключ
                    </button>
                  )}
                  {item.private_file_visible && item.private_file_name && (
                    <button
                      className="btn"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={(event) => {
                        event.stopPropagation()
                        downloadPrivateKeyArchive(item.id, item.private_file_name).catch((error) => {
                          console.error(error)
                          alert(error.message)
                        })
                      }}
                      title={item.private_file_name}
                    >
                      <FileArchive size={14} style={{ marginRight: '6px' }} /> Закрытый ключ ZIP
                    </button>
                  )}
                  <EcpInstallAction item={item} compact />
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <ActionIconButton onClick={(event) => onEdit(event, item)} title="Редактировать" rotate={-10} whileTap={{ scale: 0.92 }}>
          <Pencil size={16} />
        </ActionIconButton>
        <ActionIconButton onClick={(event) => onDelete(event, item)} title="Удалить" hoverColor="#f87171" rotate={10} whileTap={{ scale: 0.92 }}>
          <Trash2 size={16} />
        </ActionIconButton>
      </div>
    </div>
  )
}
