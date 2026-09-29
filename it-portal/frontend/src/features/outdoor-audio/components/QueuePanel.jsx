import { ChevronDown, ChevronUp, ListMusic, X } from 'lucide-react'
import { formatDuration } from '../lib/outdoorAudioModel'

export function QueuePanel({ audio }) {
  const queuedCount = Number(audio.status?.queued_count ?? audio.queue.filter((item) => item.state === 'queued').length)
  const queuedIds = audio.queue.filter((item) => item.state === 'queued').map((item) => item.id)

  return (
    <section className="oa-panel">
      <header className="oa-panel__header">
        <ListMusic size={18} />
        <h2>Очередь</h2>
        <span>{queuedCount}</span>
      </header>
      <div className="oa-list">
        {audio.queue.length === 0 ? <p className="oa-empty">Очередь пуста</p> : audio.queue.map((item, index) => (
          <article className={`oa-queue-row ${item.state === 'playing' ? 'is-active' : ''}`} key={item.id}>
            <span className="oa-index">{String(index + 1).padStart(2, '0')}</span>
            <div className="oa-row-copy">
              <strong>{item.original_filename}</strong>
              <small>{item.state === 'playing' ? 'Играет' : formatDuration(item.duration_seconds)}</small>
            </div>
            {item.state === 'queued' ? (
              <div className="oa-row-actions">
                <button type="button" title="Выше" onClick={() => void audio.moveQueueItem(item.id, -1)} disabled={Boolean(audio.busy) || queuedIds[0] === item.id}>
                  <ChevronUp size={18} />
                </button>
                <button type="button" title="Ниже" onClick={() => void audio.moveQueueItem(item.id, 1)} disabled={Boolean(audio.busy) || queuedIds.at(-1) === item.id}>
                  <ChevronDown size={18} />
                </button>
                <button type="button" title="Убрать" onClick={() => void audio.removeQueueItem(item.id)} disabled={Boolean(audio.busy)}>
                  <X size={18} />
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
