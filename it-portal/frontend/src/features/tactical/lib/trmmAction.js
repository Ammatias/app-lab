const ACTION_CONFIG = {
  reboot: {
    action: 'reboot',
    title: 'Перезагрузить компьютер?',
    description: 'Команда перезагрузит компьютер. Несохранённые данные пользователя могут быть потеряны.',
    confirmLabel: 'Перезагрузить',
    pendingLabel: 'Отправляю…',
    requiresConfirmation: true,
    requiresReason: true
  },
  wol: {
    action: 'wol',
    title: 'Разбудить компьютер?',
    description: 'В TRMM будет отправлен Wake-on-LAN. Компьютер включится, если сеть и BIOS поддерживают пробуждение.',
    confirmLabel: 'Разбудить',
    pendingLabel: 'Отправляю…',
    requiresConfirmation: true,
    requiresReason: false
  }
}

export function getTrmmActionDialogConfig(action) {
  return ACTION_CONFIG[action] || null
}
