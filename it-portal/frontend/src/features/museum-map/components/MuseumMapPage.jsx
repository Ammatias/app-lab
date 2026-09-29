import { useMemo, useState } from 'react'
import { Building2, MapPin, Search } from 'lucide-react'

import '../styles/museum-map.css'

const floors = [
  {
    id: 'floor-1',
    label: '1',
    title: 'Первый этаж',
    rooms: [
      { id: 'reception', label: 'Стойка поддержки', x: 70, y: 82, width: 250, height: 150, tone: 'support' },
      { id: 'workspace', label: 'Рабочая зона', x: 350, y: 82, width: 430, height: 150, tone: 'workspace' },
      { id: 'meeting', label: 'Переговорная', x: 810, y: 82, width: 250, height: 150, tone: 'meeting' },
      { id: 'server', label: 'Серверная', x: 70, y: 268, width: 270, height: 150, tone: 'infrastructure' },
      { id: 'storage', label: 'Склад оборудования', x: 370, y: 268, width: 330, height: 150, tone: 'storage' },
      { id: 'training', label: 'Учебный класс', x: 730, y: 268, width: 330, height: 150, tone: 'training' }
    ]
  },
  {
    id: 'floor-2',
    label: '2',
    title: 'Второй этаж',
    rooms: [
      { id: 'open-space', label: 'Открытый офис', x: 70, y: 82, width: 520, height: 150, tone: 'workspace' },
      { id: 'project', label: 'Проектная комната', x: 620, y: 82, width: 440, height: 150, tone: 'meeting' },
      { id: 'archive', label: 'Архив', x: 70, y: 268, width: 290, height: 150, tone: 'storage' },
      { id: 'lab', label: 'Лаборатория', x: 390, y: 268, width: 390, height: 150, tone: 'infrastructure' },
      { id: 'quiet', label: 'Тихая зона', x: 810, y: 268, width: 250, height: 150, tone: 'support' }
    ]
  }
]

function roomMatches(room, query) {
  const normalized = query.trim().toLocaleLowerCase('ru')
  return !normalized || room.label.toLocaleLowerCase('ru').includes(normalized)
}

export default function MuseumMapPage() {
  const [floorId, setFloorId] = useState(floors[0].id)
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [query, setQuery] = useState('')
  const floor = floors.find((item) => item.id === floorId) || floors[0]
  const matchingRoomIds = useMemo(
    () => new Set(floor.rooms.filter((room) => roomMatches(room, query)).map((room) => room.id)),
    [floor, query]
  )
  const selectedRoom = floor.rooms.find((room) => room.id === selectedRoomId) || null

  const selectFloor = (nextFloorId) => {
    setFloorId(nextFloorId)
    setSelectedRoomId(null)
  }

  return (
    <section className="demo-map-page" aria-labelledby="demo-map-title">
      <header className="demo-map-toolbar">
        <div>
          <span className="demo-map-kicker">Демонстрационная схема</span>
          <h2 id="demo-map-title"><Building2 aria-hidden="true" /> Карта офиса</h2>
          <p>Нейтральный макет показывает механику навигации, не раскрывая план реального здания.</p>
        </div>

        <label className="demo-map-search">
          <Search aria-hidden="true" size={18} />
          <span className="sr-only">Найти помещение</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти помещение"
          />
        </label>
      </header>

      <div className="demo-map-layout">
        <div className="demo-map-stage">
          <div className="demo-map-floor-tabs" aria-label="Выбор этажа">
            {floors.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === floor.id ? 'is-active' : ''}
                aria-pressed={item.id === floor.id}
                onClick={() => selectFloor(item.id)}
              >
                {item.label} этаж
              </button>
            ))}
          </div>

          <svg className="demo-map-plan" viewBox="0 0 1130 500" role="img" aria-label={floor.title}>
            <rect className="demo-map-shell" x="25" y="28" width="1080" height="430" rx="42" />
            <path className="demo-map-corridor" d="M70 246H1060" />
            {floor.rooms.map((room) => {
              const isMatch = matchingRoomIds.has(room.id)
              const isSelected = room.id === selectedRoomId
              return (
                <g
                  key={room.id}
                  className={`demo-map-room demo-map-room--${room.tone}${isSelected ? ' is-selected' : ''}${isMatch ? '' : ' is-dimmed'}`}
                  role="button"
                  tabIndex="0"
                  aria-label={room.label}
                  onClick={() => setSelectedRoomId(room.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedRoomId(room.id)
                    }
                  }}
                >
                  <rect x={room.x} y={room.y} width={room.width} height={room.height} rx="20" />
                  <text x={room.x + room.width / 2} y={room.y + room.height / 2}>{room.label}</text>
                </g>
              )
            })}
          </svg>
        </div>

        <aside className="demo-map-details" aria-live="polite">
          <MapPin aria-hidden="true" />
          <span>{floor.title}</span>
          <strong>{selectedRoom?.label || 'Выберите помещение'}</strong>
          <p>{selectedRoom ? 'Демонстрационная зона без привязки к реальной инфраструктуре.' : 'Нажмите на зону схемы, чтобы увидеть её название.'}</p>
        </aside>
      </div>
    </section>
  )
}
