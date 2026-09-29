import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildEventTriggerPayload,
  formatDuration,
  formatElapsedTime,
  normalizeEventPreferences,
  partitionAudioFiles,
  reorderQueueIds,
  resolveSelectedPlaylistId,
  shouldApplyRequest,
  sortAudioFilesByName,
  uniqueTrackIdsNotInPlaylist
} from './outdoorAudioModel.js'

test('formatDuration never produces an invalid :60 suffix', () => {
  assert.equal(formatDuration(59.6), '1:00')
  assert.equal(formatDuration(3599.6), '1:00:00')
})

test('formatDuration does not present missing metadata as a zero-length track', () => {
  assert.equal(formatDuration(null), '—')
  assert.equal(formatDuration(0), '—')
  assert.equal(formatElapsedTime(0), '0:00')
})

test('partitionAudioFiles accepts supported names case-insensitively and rejects the rest', () => {
  const files = [
    { name: 'Выход артистов.MP3' },
    { name: 'Фоновая музыка.flac' },
    { name: 'сценарий.pdf' },
    { name: '' }
  ]

  assert.deepEqual(partitionAudioFiles(files), {
    accepted: files.slice(0, 2),
    rejected: files.slice(2)
  })
})

test('sortAudioFilesByName follows numbered source filenames', () => {
  const files = [
    { name: '10 Финал.mp3' },
    { name: '2 Выход.mp3' },
    { name: '1 Начало.mp3' }
  ]

  assert.deepEqual(sortAudioFilesByName(files).map((file) => file.name), [
    '1 Начало.mp3',
    '2 Выход.mp3',
    '10 Финал.mp3'
  ])
})

test('uniqueTrackIdsNotInPlaylist prevents upload retries from duplicating playlist rows', () => {
  const uploaded = [{ id: 7 }, { id: 7 }, { id: 8 }, { id: null }]
  const playlistItems = [{ track_id: 7 }]

  assert.deepEqual(uniqueTrackIdsNotInPlaylist(uploaded, playlistItems), [8])
})

test('resolveSelectedPlaylistId keeps an existing selection', () => {
  const playlists = [{ id: 1 }, { id: 2 }]
  assert.equal(resolveSelectedPlaylistId('2', playlists), '2')
})

test('resolveSelectedPlaylistId falls back after the selected playlist was deleted', () => {
  const playlists = [{ id: 7 }, { id: 9 }]
  assert.equal(resolveSelectedPlaylistId('2', playlists), '7')
  assert.equal(resolveSelectedPlaylistId('2', []), '')
})

test('normalizeEventPreferences applies safe defaults and a strict allowlist', () => {
  assert.deepEqual(normalizeEventPreferences({}), {
    startPolicy: 'immediate',
    afterPolicy: 'stop',
    repeat: false
  })
  assert.deepEqual(normalizeEventPreferences({
    startPolicy: 'unknown',
    afterPolicy: 'resume_background',
    repeat: 'true'
  }), {
    startPolicy: 'immediate',
    afterPolicy: 'resume_background',
    repeat: true
  })
})

test('buildEventTriggerPayload requires positive playlist and item ids', () => {
  assert.throws(
    () => buildEventTriggerPayload({ playlistId: '', playlistItemId: 2 }),
    /плейлист/i
  )
  assert.throws(
    () => buildEventTriggerPayload({ playlistId: 1, playlistItemId: 0 }),
    /трек/i
  )
})

test('buildEventTriggerPayload emits the service wire contract', () => {
  assert.deepEqual(buildEventTriggerPayload({
    playlistId: '4',
    playlistItemId: '12',
    startPolicy: 'after_current',
    afterPolicy: 'next',
    repeat: true
  }), {
    playlist_id: 4,
    playlist_item_id: 12,
    start_policy: 'after_current',
    after_policy: 'next',
    repeat: true
  })
})

test('reorderQueueIds moves only queued items and preserves the playing item', () => {
  const queue = [
    { id: 1, state: 'playing' },
    { id: 2, state: 'queued' },
    { id: 3, state: 'queued' }
  ]
  assert.deepEqual(reorderQueueIds(queue, 3, -1), [3, 2])
  assert.deepEqual(reorderQueueIds(queue, 2, -1), [2, 3])
})

test('shouldApplyRequest rejects stale polling responses', () => {
  assert.equal(shouldApplyRequest(4, 4), true)
  assert.equal(shouldApplyRequest(3, 4), false)
})
