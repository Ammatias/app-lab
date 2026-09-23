'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function StringListEditor({
  label,
  values,
  onChange,
  placeholder = 'Новый пункт',
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const value = draft.trim()
    if (!value) return
    onChange([...values, value])
    setDraft('')
  }
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= values.length) return
    const next = [...values]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold">{label}</legend>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={`${index}-${value}`} className="flex items-center gap-2">
            <Input value={value} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} aria-label={`${label}, пункт ${index + 1}`} />
            <Button type="button" variant="ghost" size="icon" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Переместить выше"><ArrowUp className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => move(index, 1)} disabled={index === values.length - 1} aria-label="Переместить ниже"><ArrowDown className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} aria-label="Удалить пункт"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add() } }} placeholder={placeholder} aria-label={`Добавить: ${label}`} />
        <Button type="button" variant="outline" onClick={add}><Plus className="mr-2 h-4 w-4" />Добавить</Button>
      </div>
    </fieldset>
  )
}
