import { Clock3, Play, RotateCcw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatDuration } from '../lib/outdoorAudioModel'

export function EventWorkspace({ audio }) {
  const [preferences, setPreferences] = useState(audio.eventPreferences)
  const active = audio.status?.event?.active
  const pending = audio.status?.event?.pending
  const canResume = audio.status?.event?.can_resume_background === true

  useEffect(() => setPreferences(audio.eventPreferences), [audio.eventPreferences])

  const changePreferences = (patch) => {
    const next = { ...preferences, ...patch }
    setPreferences(next)
    void audio.saveEventPreferences(next)
  }

  return (
    <section className="oa-event">
      <div className="oa-event__toolbar">
        <div className="oa-policy">
          <span>Запуск</span>
          <div className="oa-segmented">
            <button
              type="button"
              className={preferences.startPolicy === 'immediate' ? 'is-active' : ''}
              onClick={() => changePreferences({ startPolicy: 'immediate' })}
              disabled={Boolean(audio.busy)}
            >
              Сразу
            </button>
            <button
              type="button"
              className={preferences.startPolicy === 'after_current' ? 'is-active' : ''}
              onClick={() => changePreferences({ startPolicy: 'after_current' })}
              disabled={Boolean(audio.busy)}
            >
              После текущего
            </button>
          </div>
        </div>
        <label className="oa-policy">
          <span>После трека</span>
          <select
            value={preferences.afterPolicy}
            onChange={(event) => changePreferences({ afterPolicy: event.target.value })}
            disabled={Boolean(audio.busy)}
          >
            <option value="stop">Стоп</option>
            <option value="next">Играть следующий</option>
            <option value="resume_background" disabled={!canResume}>Вернуть фон</option>
          </select>
        </label>
        <button
          type="button"
          className={`oa-repeat ${preferences.repeat ? 'is-active' : ''}`}
          onClick={() => changePreferences({ repeat: !preferences.repeat })}
          aria-pressed={preferences.repeat}
          disabled={Boolean(audio.busy)}
        >
          <RotateCcw size={17} />
          Повтор
        </button>
      </div>

      <div className="oa-event__playlist">
        <label>
          <span>Плейлист мероприятия</span>
          <select value={audio.selectedPlaylistId} onChange={(event) => audio.selectPlaylist(event.target.value)}>
            <option value="">Выберите плейлист</option>
            {audio.playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>{playlist.name} · {playlist.track_count || 0}</option>
            ))}
          </select>
        </label>
        {pending ? (
          <button className="oa-pending" type="button" onClick={() => void audio.cancelPending()} disabled={Boolean(audio.busy)}>
            <Clock3 size={17} />
            Ожидает: {pending.track_name}
            <X size={17} />
          </button>
        ) : null}
      </div>

      <div className="oa-cues">
        {audio.playlistItems.length === 0 ? (
          <p className="oa-empty">В выбранном плейлисте нет треков</p>
        ) : audio.playlistItems.map((item, index) => {
          const isActive = Number(active?.playlist_item_id) === Number(item.id)
          const isPending = Number(pending?.playlist_item_id) === Number(item.id)
          return (
            <button
              className={`oa-cue ${isActive ? 'is-active' : ''} ${isPending ? 'is-pending' : ''}`}
              type="button"
              key={item.id}
              onClick={() => void audio.triggerEvent(item, preferences)}
              disabled={Boolean(audio.busy)}
            >
              <span className="oa-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="oa-cue__name">{item.original_filename}</span>
              <span className="oa-cue__duration">{formatDuration(item.duration_seconds)}</span>
              <span className="oa-cue__status">
                {isActive ? 'Играет' : isPending ? 'Ожидает' : <Play size={18} />}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
