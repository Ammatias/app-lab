import { AlertTriangle, Radio } from 'lucide-react'
import { useState } from 'react'
import { LoadingState } from '../../../shared/ui/LoadingState'
import { useOutdoorAudio } from '../model/useOutdoorAudio'
import '../styles/outdoor-audio.css'
import { AudioSettings } from './AudioSettings'
import { EventWorkspace } from './EventWorkspace'
import { PlayerDeck } from './PlayerDeck'
import { PlaylistManager } from './PlaylistManager'
import { QueuePanel } from './QueuePanel'
import { SchedulePanel } from './SchedulePanel'

export default function OutdoorAudioPage() {
  const audio = useOutdoorAudio()
  const [eventMode, setEventMode] = useState(false)
  const online = audio.status?.ok === true
  const eventSupported = audio.status?.event != null

  if (audio.loading) return <LoadingState />

  return (
    <section className={`oa-page ${eventMode ? 'is-event' : 'is-normal'}`}>
      <header className="oa-topbar">
        <div className="oa-brand">
          <Radio size={19} />
          <span>Уличный звук</span>
          <i className={online ? 'is-online' : 'is-offline'}>{online ? 'Онлайн' : 'Недоступен'}</i>
        </div>
        <div className="oa-mode" aria-label="Режим работы">
          <button type="button" className={!eventMode ? 'is-active' : ''} onClick={() => setEventMode(false)}>
            Обычный
          </button>
          <button
            type="button"
            className={eventMode ? 'is-active' : ''}
            onClick={() => setEventMode(true)}
            disabled={!eventSupported}
            title={eventSupported ? 'Открыть операторский режим' : 'Требуется обновление OutdoorAudio.Service'}
          >
            Мероприятие
          </button>
        </div>
      </header>

      {audio.error ? (
        <div className="oa-alert" role="alert">
          <AlertTriangle size={19} />
          <span>{audio.error}</span>
          <button type="button" onClick={() => audio.setError('')}>Закрыть</button>
        </div>
      ) : null}

      <PlayerDeck audio={audio} />

      {eventMode ? (
        <>
          <EventWorkspace audio={audio} />
          <QueuePanel audio={audio} />
        </>
      ) : (
        <div className="oa-workspace">
          <QueuePanel audio={audio} />
          <PlaylistManager audio={audio} />
          <SchedulePanel audio={audio} />
          <AudioSettings audio={audio} />
        </div>
      )}
    </section>
  )
}
