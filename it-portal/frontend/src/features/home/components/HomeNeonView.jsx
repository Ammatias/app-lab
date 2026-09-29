import { memo } from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { HomeEditorForm } from './HomeEditorForm'
import { HomeGroupSidebar } from './HomeGroupSidebar'
import { HomeHero } from './HomeHero'
import { HomeLinkCard } from './HomeLinkCard'
import { HomeWidgetCard } from './HomeWidgetCard'
import { HomeWidgetPicker } from './HomeWidgetPicker'

const HomeNeonViewComponent = ({
  filteredHomeGroups,
  currentHomeGroup,
  currentHomeLinks,
  currentHomeWidgets,
  currentHomeItems,
  homeWidgetData,
  CurrentHomeIcon,
  isFavoritesGroup,
  isHomeEditMode,
  homeDensityMode,
  homeDropTargetGroupKey,
  homeDensityClass,
  homeScaleClass,
  showHomeEditor,
  homeLinkFormMode,
  homeLinkDraft,
  homeGroupDraft,
  homeGroupContextLabel,
  homeWidgetContextLabel,
  showHomeWidgetPicker,
  creatingHomeWidget,
  homeWidgetDraft,
  draggedHomeItemId,
  homeDropPreviewItemKey,
  homeDropPreviewMode,
  isFavoriteLink,
  onSetActiveHomeGroup,
  onToggleEditMode,
  onSetHomeDensityMode,
  onOpenFavoriteForm,
  onOpenHomeLinkCreate,
  onOpenHomeGroupCreate,
  onOpenHomeWidgetCreate,
  onHomeEditorSubmit,
  onHomeLinkDraftChange,
  onHomeGroupDraftChange,
  onResetHomeEditor,
  onHomeWidgetDraftChange,
  onCreateHomeWidget,
  onCancelHomeWidgetCreate,
  onUpdateHomeWidget,
  onHomeItemDragStart,
  onHomeItemDrag,
  onHomeItemDragOver,
  onHomeItemDrop,
  onHomeItemDragEnd,
  onHomeGroupDragOver,
  onHomeGroupDragLeave,
  onHomeGroupDrop,
  onRemoveFavoriteLink,
  onEditHomeLink,
  onDeleteHomeLink,
  onDeleteHomeWidget,
  onToggleFavorite
}) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="home-neon-shell">
      <HomeGroupSidebar
        filteredHomeGroups={filteredHomeGroups}
        currentHomeGroup={currentHomeGroup}
        draggedHomeItemId={draggedHomeItemId}
        dropTargetGroupKey={homeDropTargetGroupKey}
        onSetActiveHomeGroup={onSetActiveHomeGroup}
        onGroupDragOver={onHomeGroupDragOver}
        onGroupDragLeave={onHomeGroupDragLeave}
        onGroupDrop={onHomeGroupDrop}
      />

      <div className="home-neon-main">
        <HomeHero
          currentHomeGroup={currentHomeGroup}
          currentHomeLinks={currentHomeLinks}
          currentHomeWidgets={currentHomeWidgets}
          isFavoritesGroup={isFavoritesGroup}
          isHomeEditMode={isHomeEditMode}
          homeDensityMode={homeDensityMode}
          draggedHomeItemId={draggedHomeItemId}
          onToggleEditMode={onToggleEditMode}
          onSetHomeDensityMode={onSetHomeDensityMode}
          onOpenFavoriteForm={onOpenFavoriteForm}
          onOpenHomeLinkCreate={onOpenHomeLinkCreate}
          onOpenHomeGroupCreate={onOpenHomeGroupCreate}
          onOpenHomeWidgetCreate={onOpenHomeWidgetCreate}
          hasSearchResults={Boolean(currentHomeGroup)}
        />

        {showHomeEditor && (isFavoritesGroup || currentHomeGroup) && (
          <HomeEditorForm
            mode={homeLinkFormMode}
            homeLinkDraft={homeLinkDraft}
            homeGroupDraft={homeGroupDraft}
            groupContextLabel={homeGroupContextLabel}
            onLinkDraftChange={onHomeLinkDraftChange}
            onGroupDraftChange={onHomeGroupDraftChange}
            onSubmit={onHomeEditorSubmit}
            onCancel={onResetHomeEditor}
            onDelete={onDeleteHomeLink}
          />
        )}

        {showHomeWidgetPicker && (
          <HomeWidgetPicker
            draft={homeWidgetDraft}
            loading={creatingHomeWidget}
            groupContextLabel={homeWidgetContextLabel}
            onChange={onHomeWidgetDraftChange}
            onSubmit={onCreateHomeWidget}
            onCancel={onCancelHomeWidgetCreate}
          />
        )}

        {currentHomeItems.length > 0 ? (
          <div className={`home-neon-grid ${isFavoritesGroup ? 'is-favorites-grid' : ''} ${homeDensityClass} ${homeScaleClass}`}>
            {currentHomeItems.map((item, idx) => {
              const isPreviewTarget = homeDropPreviewItemKey === item.itemKey && draggedHomeItemId && draggedHomeItemId !== item.itemKey
              const isDropPreview = Boolean(isPreviewTarget && homeDropPreviewMode)

              if (item.entryType === 'widget') {
                return (
                  <HomeWidgetCard
                    key={item.itemKey || `widget-${item.id || idx}`}
                    widget={item}
                    idx={idx}
                    homeWidgetData={homeWidgetData}
                    isHomeEditMode={isHomeEditMode}
                    draggedHomeItemId={draggedHomeItemId}
                    isDropPreview={isDropPreview}
                    isDraggable={isHomeEditMode || isFavoritesGroup}
                    onDragStart={onHomeItemDragStart}
                    onDrag={onHomeItemDrag}
                    onDragOver={onHomeItemDragOver}
                    onDrop={onHomeItemDrop}
                    onDragEnd={onHomeItemDragEnd}
                    onUpdateHomeWidget={onUpdateHomeWidget}
                    onDeleteHomeWidget={onDeleteHomeWidget}
                  />
                )
              }

              return (
                <HomeLinkCard
                  key={item.itemKey || `link-${item.id || `${currentHomeGroup?.title || 'home'}-${idx}`}`}
                  link={item}
                  idx={idx}
                  CurrentHomeIcon={CurrentHomeIcon}
                  currentHomeGroup={currentHomeGroup}
                  isFavoritesGroup={isFavoritesGroup}
                  isHomeEditMode={isHomeEditMode}
                  draggedHomeItemId={draggedHomeItemId}
                  isDropPreview={isDropPreview}
                  isDraggable={isHomeEditMode || isFavoritesGroup}
                  onDragStart={onHomeItemDragStart}
                  onDrag={onHomeItemDrag}
                  onDragOver={onHomeItemDragOver}
                  onDrop={onHomeItemDrop}
                  onDragEnd={onHomeItemDragEnd}
                  onRemoveFavorite={onRemoveFavoriteLink}
                  onEditHomeLink={onEditHomeLink}
                  isFavoriteLink={isFavoriteLink}
                  onToggleFavorite={onToggleFavorite}
                />
              )
            })}
          </div>
        ) : (
          <EmptyState panel={true} style={{ padding: '26px', color: 'var(--text-muted)' }}>
            {isFavoritesGroup ? (
              <>
                В разделе «Домашняя» пока пусто. Добавьте свою ссылку, закрепите карточки из других разделов или подключите первый виджет.
                <div className="home-neon-empty-tips">
                  <span className="home-neon-empty-tip">Добавьте календарь, чтобы видеть месяц прямо на Home</span>
                  <span className="home-neon-empty-tip">Закрепите пару ключевых сервисов для ежедневной работы</span>
                  <span className="home-neon-empty-tip">Позже сюда удобно поставить уведомления и отпускной виджет</span>
                </div>
                <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={onOpenFavoriteForm}>
                    <Plus size={16} /> Добавить ссылку
                  </button>
                  <button className="btn" onClick={onOpenHomeWidgetCreate}>
                    <Plus size={16} /> Добавить виджет
                  </button>
                </div>
              </>
            ) : (
              <>
                По этому запросу на домашней странице ничего не найдено.
                <div className="home-neon-empty-tips">
                  <span className="home-neon-empty-tip">Попробуйте убрать часть фильтра или открыть соседнюю группу</span>
                  <span className="home-neon-empty-tip">В режиме редактирования можно сразу добавить ссылку или виджет в текущий раздел</span>
                </div>
              </>
            )}
          </EmptyState>
        )}
      </div>
    </motion.div>
)

export const HomeNeonView = memo(HomeNeonViewComponent)
