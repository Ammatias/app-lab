import { Clock3, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { parseScheduleAction, scheduleTargetLabel } from '../lib/outdoorAudioModel'

const EMPTY_DRAFT = { name: '', schedule_value: '', action_type: 'play', playlist_id: '' }

export function SchedulePanel({ audio }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT)

  const create = async () => {
    const playlistId = Number(draft.playlist_id || audio.selectedPlaylistId)
    if (!draft.schedule_value) {
      audio.setError('Укажите время расписания')
      return
    }
    if (draft.action_type === 'play' && !playlistId) {
      audio.setError('Выберите плейлист')
      return
    }
    const result = await audio.createSchedule({
      name: draft.name.trim() || 'Расписание',
      schedule_kind: 'time',
      schedule_value: draft.schedule_value,
      action: draft.action_type === 'stop'
        ? { type: 'stop' }
        : { type: 'play_playlist', playlist_id: playlistId }
    })
    if (result) setDraft(EMPTY_DRAFT)
  }

  return (
    <section className="oa-panel">
      <header className="oa-panel__header">
        <Clock3 size={18} />
        <h2>Расписание</h2>
        <span>{audio.schedules.length}</span>
      </header>
      <div className="oa-schedule-form">
        <input placeholder="Название" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        <input type="time" value={draft.schedule_value} onChange={(event) => setDraft({ ...draft, schedule_value: event.target.value })} />
        <select value={draft.action_type} onChange={(event) => setDraft({ ...draft, action_type: event.target.value })}>
          <option value="play">Включить</option>
          <option value="stop">Выключить</option>
        </select>
        {draft.action_type === 'play' ? (
          <select value={draft.playlist_id || audio.selectedPlaylistId} onChange={(event) => setDraft({ ...draft, playlist_id: event.target.value })}>
            <option value="">Плейлист</option>
            {audio.playlists.map((playlist) => <option key={playlist.id} value={playlist.id}>{playlist.name}</option>)}
          </select>
        ) : null}
        <button type="button" onClick={() => void create()} disabled={Boolean(audio.busy)}>
          <Plus size={17} /> Добавить
        </button>
      </div>
      <div className="oa-list">
        {audio.schedules.length === 0 ? <p className="oa-empty">Нет запланированных запусков</p> : audio.schedules.map((schedule) => {
          const action = parseScheduleAction(schedule)
          return (
            <article className="oa-schedule-row" key={schedule.id}>
              <strong>{String(schedule.schedule_value || '').slice(0, 5)}</strong>
              <div className="oa-row-copy">
                <span>{schedule.name}</span>
                <small>{scheduleTargetLabel(action, audio.tracks, audio.playlists)}</small>
              </div>
              <button
                type="button"
                className={schedule.enabled ? 'is-active' : ''}
                onClick={() => void audio.updateSchedule(schedule.id, { enabled: !schedule.enabled })}
              >
                {schedule.enabled ? 'Вкл' : 'Выкл'}
              </button>
              <button type="button" title="Удалить" onClick={() => void audio.deleteSchedule(schedule.id)}>
                <Trash2 size={17} />
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
