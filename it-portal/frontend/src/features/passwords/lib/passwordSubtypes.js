export const PASSWORD_PRIMARY_VIEWS = {
  resources: 'resources',
  network: 'network',
  employeeMail: 'employee-mail'
}

export const PASSWORD_NETWORK_VIEWS = {
  wifi: 'wifi'
}

export const PASSWORD_SUBTYPE_META = {
  resource: {
    sectionLabel: 'Основные',
    resultLabel: 'Ресурс',
    hint: 'Сервисы, серверы, кабинеты, панели и прочие основные доступы.'
  },
  wifi: {
    sectionLabel: 'Wi-Fi',
    resultLabel: 'Wi-Fi',
    hint: 'Точки доступа, пароли и расположение оборудования.'
  },
  employee_email: {
    sectionLabel: 'Почта сотрудников',
    resultLabel: 'Почта сотрудников',
    hint: 'Логины и пароли от почтовых ящиков сотрудников.'
  }
}

export const normalizePasswordSubtype = (subtype) => {
  if (subtype === 'wifi' || subtype === 'employee_email') {
    return subtype
  }

  return 'resource'
}

export const resolvePasswordSubtypeByView = ({ primaryView, networkView }) => (
  primaryView === PASSWORD_PRIMARY_VIEWS.network
    ? normalizePasswordSubtype(networkView)
    : primaryView === PASSWORD_PRIMARY_VIEWS.employeeMail
      ? 'employee_email'
      : 'resource'
)

export const getPasswordSubtypeLabel = (subtype) => PASSWORD_SUBTYPE_META[normalizePasswordSubtype(subtype)].resultLabel

export const getPasswordSearchTokens = (item) => {
  const subtype = normalizePasswordSubtype(item.subtype)
  const tokens = [
    item.title,
    item.login,
    item.value,
    item.description,
    item.source_sheet,
    subtype,
    getPasswordSubtypeLabel(subtype)
  ]

  if (subtype === 'wifi') {
    tokens.push('вайфай', 'wifi', 'ssid')
  }
  if (subtype === 'employee_email') {
    tokens.push('почта', 'почта сотрудников', 'email', 'e-mail', 'электронная почта')
  }
  if (item.is_draft) {
    tokens.push('черновик', 'draft')
  }

  return tokens
}
