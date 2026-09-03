const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const systemUser = await db.user.upsert({
    where: { email: 'system@example.local' },
    update: {},
    create: { id: 'system', email: 'system@example.local', name: 'System' },
  })

  const content = {
    hero: {
      title: 'Привет, я Разработчик',
      subtitle: 'Создаю современные веб-приложения с фокусом на производительность и удобство.',
      ctaPrimary: { href: '#projects', text: 'Посмотреть проекты' },
      ctaSecondary: { href: '/resume', text: 'Резюме' },
    },
    resume: {
      about: 'Демонстрационный профиль разработчика. Замените его собственным содержимым.',
      skills: ['TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker'],
      courses: [{ id: '1', year: '2024', title: 'Современная веб-разработка', institution: 'Пример учебного центра' }],
      contacts: {
        email: 'developer@example.com',
        phone: '+0 000 000 00 00',
        github: 'https://github.com/your-username/',
        telegram: '@your-telegram',
      },
      education: [{ id: '1', year: '2024', degree: 'Высшее образование', specialty: 'Информационные технологии', institution: 'Пример университета' }],
      experience: [{ id: '1', period: '2024 — настоящее время', company: 'Пример компании', position: 'Веб-разработчик', description: ['Разработка и сопровождение веб-приложений'] }],
    },
    projects: [{
      id: '1',
      demo: 'https://portfolio.example.com',
      tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
      title: 'Демонстрационный проект',
      github: 'https://github.com/your-username/your-repository',
      features: ['Адаптивный интерфейс', 'Управление контентом', 'Docker-развёртывание'],
      description: 'Пример проекта для замены собственным содержимым.',
      screenshots: [],
      fullDescription: 'Обновите описание и ссылки перед публикацией своего портфолио.',
    }],
  }

  const portfolioProject = await db.project.upsert({
    where: { slug: 'portfolio' },
    update: { name: 'Portfolio', url: 'https://portfolio.example.com', userId: 'system', content, settings: { theme: 'dark', colors: {} } },
    create: { id: 'example-portfolio-project', name: 'Portfolio', slug: 'portfolio', url: 'https://portfolio.example.com', userId: 'system', content, settings: { theme: 'dark', colors: {} } },
  })

  console.log('System user ensured:', systemUser.id)
  console.log('Portfolio project ensured:', portfolioProject.id)
  console.log('Seeding completed!')
}

main()
  .catch((error) => {
    console.error('Error during seeding:', error)
    process.exit(1)
  })
  .finally(async () => db.$disconnect())
