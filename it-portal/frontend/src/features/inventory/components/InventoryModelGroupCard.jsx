import { Pencil, Trash2 } from 'lucide-react'
import { ActionIconButton } from '../../../shared/ui/ActionIconButton'

export function InventoryModelGroupCard({ group, onEditModel, onDeleteModel }) {
  const total = group.total_refilled + group.total_new
  const printerCount = group.printer_count ?? 0
  const isCritical = group.models.some((model) => {
    const modelTotal = Number(model.refilled_count || 0) + Number(model.new_count || 0)
    const criticalLimit = Number(model.critical_limit ?? 2)
    return modelTotal <= criticalLimit
  })
  const openEdit = (event, model) => {
    event.stopPropagation()
    onEditModel(event, model)
  }

  return (
    <div className={`inv-group-card ${isCritical ? 'is-critical' : ''}`}>
      <div className="inv-group-top">
        <div className="inv-group-copy">
          <div className="inv-group-title-row">
            <span className="inv-group-title">{group.name}</span>
            {group.models.length > 1 && <span className="inv-group-chip">{group.models.length} мод.</span>}
            {isCritical && <span className="inv-group-chip inv-group-chip--critical">Низкий остаток</span>}
          </div>
          <div className="inv-group-meta">
            <span className="inv-group-meta-dot" />
            <span>для {printerCount} принтеров</span>
          </div>
        </div>
        <div className="inv-counts inv-counts--warehouse">
          <div className="count-box count-box--warehouse" title="Заправлено (всех подтипов)">
            <span className="count-val">{group.total_refilled}</span>
            <span className="count-label">ЗАПР.</span>
          </div>
          <div className="count-box count-box--warehouse" title="Новые (в коробках, всех подтипов)">
            <span className="count-val">{group.total_new}</span>
            <span className="count-label">НОВЫЕ</span>
          </div>
        </div>
      </div>

      <div className="sub-models">
        {group.models.map((model) => (
          <div key={model.id} className="sub-model-tag">
            <div className="sub-model-main">
              <span className="sub-model-name editable-tag" role="button" tabIndex={0} onClick={(event) => openEdit(event, model)} onKeyDown={(event) => event.key === 'Enter' && openEdit(event, model)}>{model.name}</span>
              <span className="sub-model-stock editable-tag" role="button" tabIndex={0} onClick={(event) => openEdit(event, model)} onKeyDown={(event) => event.key === 'Enter' && openEdit(event, model)}>{model.refilled_count} запр. / {model.new_count} нов.</span>
            </div>
            <div className="hover-actions-mini sub-model-actions">
              <ActionIconButton onClick={(event) => onEditModel(event, model)} title="Редактировать" scale={1.05} rotate={0} style={{ padding: '2px' }}>
                <Pencil size={10} />
              </ActionIconButton>
              <ActionIconButton onClick={(event) => onDeleteModel(event, model)} title="Удалить" hoverColor="#f87171" scale={1.05} rotate={0} style={{ padding: '2px' }}>
                <Trash2 size={10} />
              </ActionIconButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
