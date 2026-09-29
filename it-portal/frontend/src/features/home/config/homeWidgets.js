import { AlertTriangle, CalendarRange, ContactRound, Gauge, MessagesSquare, ShieldAlert, UsersRound } from 'lucide-react'

export const HOME_WIDGET_WIDTH_OPTIONS = [
  { value: 'normal', title: 'Обычный', shortLabel: 'N', description: 'Компактный размер для плотной сетки.' },
  { value: 'wide', title: 'Широкий', shortLabel: 'W', description: 'Больше пространства для календаря и статуса.' },
  { value: 'tall', title: 'Высокий', shortLabel: 'T', description: 'Узкий, но более длинный формат для вертикального контента.' },
  { value: 'hero', title: 'Hero', shortLabel: 'H', description: 'Крупный виджет на всю центральную сцену Home.' }
]

export const HOME_WIDGET_DEFINITIONS = [
  {
    type: 'tactical_attention',
    title: 'TRMM · требует внимания',
    description: 'Показывает выключенные, не отвечающие и не сопоставленные компьютеры.',
    widthMode: 'normal',
    widthOptions: ['normal', 'wide'],
    Icon: ShieldAlert
  },
  {
    type: 'month_calendar',
    title: 'Календарь месяца',
    description: 'Календарная сетка с записями по дням. Дальше сюда можно будет связать события из VK Workspace.',
    widthMode: 'wide',
    widthOptions: ['normal', 'wide', 'hero'],
    Icon: CalendarRange
  },
  {
    type: 'favorite_contacts',
    title: 'Избранные сотрудники',
    description: 'Тонкая контактная лента с быстрым доступом к нужным людям и внешним контактам.',
    widthMode: 'normal',
    widthOptions: ['normal', 'wide'],
    Icon: ContactRound
  },
  {
    type: 'urgent_cartridges',
    title: 'Срочные остатки картриджей',
    description: 'Показывает самые критичные остатки по складу, чтобы дефицит был виден сразу на Home.',
    widthMode: 'normal',
    widthOptions: ['normal', 'wide'],
    Icon: AlertTriangle
  },
  {
    type: 'admin_team',
    title: 'Состав отдела',
    description: 'Живой список трёх админов портала: онлайн, авторизован, офлайн или в отпуске.',
    widthMode: 'wide',
    widthOptions: ['normal', 'wide', 'hero'],
    Icon: UsersRound
  },
  {
    type: 'network_top',
    title: 'Сетевая загрузка',
    description: 'Топ-6 сотрудников по текущей скорости загрузки через OpenWrt.',
    widthMode: 'wide',
    widthOptions: ['normal', 'wide'],
    Icon: Gauge
  },
  {
    type: 'vk_workspace',
    title: 'VK Workspace',
    description: 'Быстрый лаунчер в VK Workspace с подсказкой по текущему логину администратора.',
    widthMode: 'normal',
    widthOptions: ['normal', 'wide'],
    Icon: MessagesSquare
  }
]

export const HOME_WIDGET_DEFINITION_MAP = HOME_WIDGET_DEFINITIONS.reduce((accumulator, widget) => {
  accumulator[widget.type] = widget
  return accumulator
}, {})
