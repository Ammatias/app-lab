import { Pause, Play, RefreshCw, SkipForward, Square, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatDuration, formatElapsedTime, numberOrNull, playbackLabel } from '../lib/outdoorAudioModel'

export function PlayerDeck({ audio }) {
  const {
    status,
    busy,
    volume,
    setVolume,
    setVolumeRemote,
    transport,
    emergencyStop,
    refresh
  } = audio
  const [seek, setSeek] = useState(0)
  const [dragging, setDragging] = useState(false)
  const state = status?.mpv_state || 'stopped'
  const duration = numberOrNull(status?.duration) || numberOrNull(status?.current_queue_item?.duration_seconds) || 0
  const position = numberOrNull(status?.time_pos) || 0
  const activeCue = status?.event?.active
  const trackName = activeCue?.track_name
    || status?.current_queue_item?.original_filename
    || status?.path?.split(/[\\/]/).pop()
    || 'Нет активного трека'

  useEffect(() => {
    if (!dragging) setSeek(position)
  }, [dragging, position])

  const commitSeek = () => {
    setDragging(false)
    void transport('seek', { position_seconds: seek })
  }

  return (
    <section className="oa-deck" aria-label="Плеер">
      <div className="oa-deck__status">
        <span className={`oa-state oa-state--${state}`}>{playbackLabel(state)}</span>
        <div>
          <h1 title={trackName}>{trackName}</h1>
          <p>{status?.hostname || 'Windows audio PC'} · {status?.service || 'OutdoorAudio.Service'}</p>
        </div>
        <button className="oa-icon-button" type="button" title="Обновить" onClick={() => refresh()} disabled={Boolean(busy)}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="oa-progress">
        <span>{formatElapsedTime(dragging ? seek : position)}</span>
        <input
          type="range"
          min="0"
          max={Math.max(duration, 1)}
          value={Math.min(dragging ? seek : position, Math.max(duration, 1))}
          disabled={duration <= 0 || Boolean(busy)}
          onChange={(event) => {
            setDragging(true)
            setSeek(Number(event.target.value))
          }}
          onPointerUp={commitSeek}
          onKeyUp={commitSeek}
          aria-label="Позиция воспроизведения"
        />
        <span>{formatDuration(duration)}</span>
      </div>

      <div className="oa-transport">
        <button className="oa-control" type="button" onClick={() => void transport('stop')} disabled={Boolean(busy)}>
          <Square size={19} /> <span>Стоп</span>
        </button>
        <button
          className="oa-control oa-control--primary"
          type="button"
          onClick={() => void transport(state === 'playing' ? 'pause' : 'play')}
          disabled={Boolean(busy)}
        >
          {state === 'playing' ? <Pause size={24} /> : <Play size={24} />}
          <span>{state === 'playing' ? 'Пауза' : 'Играть'}</span>
        </button>
        <button className="oa-control" type="button" onClick={() => void transport('next')} disabled={Boolean(busy)}>
          <SkipForward size={20} /> <span>Следующий</span>
        </button>
        <button className="oa-emergency" type="button" onClick={() => void emergencyStop()} disabled={Boolean(busy)}>
          Остановить всё
        </button>
      </div>

      <label className="oa-volume">
        <Volume2 size={18} />
        <span>Громкость</span>
        <input
          type="range"
          min="0"
          max={Number(audio.mappedSettings.max_volume || status?.config?.max_volume || 90)}
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          onPointerUp={() => void setVolumeRemote()}
          onKeyUp={() => void setVolumeRemote()}
        />
        <strong>{volume}%</strong>
      </label>
    </section>
  )
}
