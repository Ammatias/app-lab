let audioContext = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null

  if (!audioContext) {
    audioContext = new AudioContextClass()
  }

  return audioContext
}

function scheduleTone(context, { type, frequency, startAt, duration, gainValue }) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startAt)

  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + duration + 0.02)
}

function playAurora(context, startAt, gainValue) {
  scheduleTone(context, { type: 'triangle', frequency: 740, startAt, duration: 0.11, gainValue })
  scheduleTone(context, { type: 'sine', frequency: 988, startAt: startAt + 0.08, duration: 0.16, gainValue: gainValue * 0.82 })
}

function playPulse(context, startAt, gainValue) {
  scheduleTone(context, { type: 'sine', frequency: 660, startAt, duration: 0.09, gainValue })
  scheduleTone(context, { type: 'sine', frequency: 830, startAt: startAt + 0.11, duration: 0.09, gainValue: gainValue * 0.85 })
}

function playGlide(context, startAt, gainValue) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(560, startAt)
  oscillator.frequency.exponentialRampToValueAtTime(920, startAt + 0.16)

  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.2)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + 0.24)
}

export async function playNotificationSound({ preset = 'aurora', volume = 72 } = {}) {
  const context = getAudioContext()
  if (!context) return

  if (context.state === 'suspended') {
    await context.resume()
  }

  const startAt = context.currentTime + 0.01
  const gainValue = Math.max(0.0001, Math.min(0.18, Number(volume || 0) / 550))

  if (preset === 'pulse') {
    playPulse(context, startAt, gainValue)
    return
  }

  if (preset === 'glide') {
    playGlide(context, startAt, gainValue)
    return
  }

  playAurora(context, startAt, gainValue)
}
