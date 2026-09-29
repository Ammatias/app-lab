import { ListMusic, Play, Plus, Trash2, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { formatDuration } from '../lib/outdoorAudioModel'

export function PlaylistManager({ audio }) {
  const [name, setName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)
  const dragDepth = useRef(0)
  const selected = audio.playlists.find((item) => String(item.id) === String(audio.selectedPlaylistId))

  const create = async () => {
    const value = name.trim()
    if (!value) {
      audio.setError('Укажите название плейлиста')
      return
    }
    const result = await audio.createPlaylist(value)
    if (result) setName('')
  }

  const upload = async (files) => {
    await audio.uploadFiles(files)
  }

  const resetDrag = () => {
    dragDepth.current = 0
    setIsDragging(false)
  }

  const drop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    resetDrag()
    if (!selected || audio.busy) return
    void upload(event.dataTransfer.files)
  }

  return (
    <section className="oa-panel">
      <header className="oa-panel__header">
        <ListMusic size={18} />
        <h2>Плейлисты</h2>
        <span>{audio.playlists.length}</span>
      </header>
      <div className="oa-inline-form">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Новый плейлист" />
        <button type="button" onClick={() => void create()} disabled={Boolean(audio.busy)}>
          <Plus size={17} /> Создать
        </button>
      </div>
      <div className="oa-picker">
        <select value={audio.selectedPlaylistId} onChange={(event) => audio.selectPlaylist(event.target.value)}>
          <option value="">Выберите плейлист</option>
          {audio.playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>{playlist.name} · {playlist.track_count || 0}</option>
          ))}
        </select>
        <button type="button" className="is-primary" onClick={() => void audio.playPlaylist()} disabled={!selected || Boolean(audio.busy)}>
          <Play size={17} /> Играть
        </button>
        <button type="button" onClick={() => void audio.enqueuePlaylist()} disabled={!selected || Boolean(audio.busy)}>
          <Plus size={17} /> В очередь
        </button>
        <button type="button" title="Удалить плейлист" onClick={() => void audio.deletePlaylist()} disabled={!selected || Boolean(audio.busy)}>
          <Trash2 size={17} />
        </button>
      </div>
      <button
        className={`oa-upload${isDragging ? ' is-dragging' : ''}`}
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          dragDepth.current += 1
          if (selected && !audio.busy) setIsDragging(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          dragDepth.current = Math.max(0, dragDepth.current - 1)
          if (dragDepth.current === 0) setIsDragging(false)
        }}
        onDrop={drop}
        disabled={!selected || Boolean(audio.busy)}
        aria-busy={audio.busy === 'upload'}
      >
        <Upload size={22} />
        <span>
          {audio.uploadProgress
            ? `Загружено ${audio.uploadProgress.completed} из ${audio.uploadProgress.total}`
            : selected
              ? `Выбрать или перетащить файлы в «${selected.name}»`
              : 'Сначала выберите плейлист'}
        </span>
        <small>Берём название файла · mp3, wav, flac, ogg или m4a</small>
      </button>
      <input
        ref={inputRef}
        hidden
        type="file"
        multiple
        accept=".mp3,.wav,.flac,.ogg,.m4a"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files || [])
          event.currentTarget.value = ''
          void upload(files)
        }}
      />
      <div className="oa-list">
        {audio.playlistItems.length === 0 ? <p className="oa-empty">Плейлист пуст</p> : audio.playlistItems.map((item, index) => (
          <article className="oa-track-row" key={item.id}>
            <span className="oa-index">{String(index + 1).padStart(2, '0')}</span>
            <div className="oa-row-copy">
              <strong>{item.original_filename}</strong>
              <small>{formatDuration(item.duration_seconds)}</small>
            </div>
            <button type="button" title="Убрать из плейлиста" onClick={() => void audio.removePlaylistItem(item.id)}>
              <X size={18} />
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
