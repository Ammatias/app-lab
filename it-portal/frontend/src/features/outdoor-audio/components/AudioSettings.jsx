import { Settings2 } from 'lucide-react'
import { audioDeviceOption, normalizeAudioDeviceValue } from '../lib/outdoorAudioModel'

export function AudioSettings({ audio }) {
  const maxVolume = audio.mappedSettings.max_volume || audio.status?.config?.max_volume || 90
  const defaultVolume = audio.mappedSettings.default_volume || audio.status?.config?.default_volume || 65
  const device = normalizeAudioDeviceValue(audio.mappedSettings.audio_device || audio.status?.config?.audio_device || '')

  return (
    <details className="oa-settings">
      <summary><Settings2 size={18} /> Настройки звука</summary>
      <div className="oa-settings__body">
        <label>
          <span>Максимальная громкость</span>
          <input
            type="number"
            min="1"
            max="100"
            defaultValue={maxVolume}
            onBlur={(event) => void audio.updateSettings({ max_volume: Number(event.target.value) })}
          />
        </label>
        <label>
          <span>Громкость по умолчанию</span>
          <input
            type="number"
            min="0"
            max={maxVolume}
            defaultValue={defaultVolume}
            onBlur={(event) => void audio.updateSettings({ default_volume: Number(event.target.value) })}
          />
        </label>
        <label>
          <span>Устройство VLC</span>
          <input
            type="text"
            list="oa-devices"
            defaultValue={device}
            placeholder="По умолчанию"
            onBlur={(event) => void audio.updateSettings({ audio_device: normalizeAudioDeviceValue(event.target.value) })}
          />
          <datalist id="oa-devices">
            {audio.audioDevices.map((item) => {
              const option = audioDeviceOption(item)
              return <option key={`${option.value}-${option.raw}`} value={option.value} label={option.label} />
            })}
          </datalist>
        </label>
      </div>
    </details>
  )
}
