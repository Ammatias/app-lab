/**
 * API Client для получения данных из админ-панели
 *
 * Используется для интеграции с Universal Admin Panel
 * Автоматически переключается между API и статическими данными
 *
 * Endpoints:
 * - GET /api/public/[slug]/content - получить весь контент
 * - GET /api/resume/[slug] - получить резюме
 * - GET /api/hero/[slug] - получить Hero данные
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || '';
const DATA_SOURCE = process.env.DATA_SOURCE || 'static';
const PROJECT_SLUG = 'portfolio';

/**
 * Получить данные проектов
 * @returns Массив проектов
 */
export async function getProjects() {
  if (DATA_SOURCE === 'api' && API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/${PROJECT_SLUG}/content`, {
        cache: 'no-store',
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch from API');
      }

      const json = await res.json();
      return json.data?.projects || [];
    } catch (error) {
      console.warn('API failed, falling back to static data:', error);
    }
  }

  // Fallback на статические данные
  const { projects } = await import('@/data/projects');
  return projects;
}

/**
 * Получить данные резюме
 * @returns Данные резюме
 */
export async function getResume() {
  if (DATA_SOURCE === 'api' && API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/${PROJECT_SLUG}/content`, {
        cache: 'no-store',
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch from API');
      }

      const json = await res.json();
      return json.data?.resume || null;
    } catch (error) {
      console.warn('API failed, falling back to static data:', error);
    }
  }

  // Fallback на статические данные
  const { resume } = await import('@/data/resume');
  return resume;
}

/**
 * Получить данные Hero секции
 * @returns Данные Hero
 */
export async function getHero() {
  if (DATA_SOURCE === 'api' && API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/${PROJECT_SLUG}/content`, {
        cache: 'no-store',
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch from API');
      }

      const json = await res.json();
      return json.data?.hero || null;
    } catch (error) {
      console.warn('API failed, falling back to static data:', error);
    }
  }

  // Fallback на статические данные
  const { hero } = await import('@/data/hero');
  return hero;
}

/**
 * Получить весь контент проекта одним запросом
 * @returns Объект с projects, resume, hero, settings
 */
export async function getAllContent() {
  if (DATA_SOURCE === 'api' && API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/${PROJECT_SLUG}/content`, {
        cache: 'no-store',
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch from API');
      }

      const json = await res.json();
      return {
        projects: json.data?.projects || [],
        resume: json.data?.resume || null,
        hero: json.data?.hero || {
          title: 'Portfolio',
          subtitle: 'Developer',
          ctaPrimary: { text: 'Projects', href: '#projects' },
          ctaSecondary: { text: 'Resume', href: '/resume' },
        },
        settings: json.settings || { theme: 'dark', colors: {} },
      };
    } catch (error) {
      console.warn('API failed, falling back to static data:', error);
      // Return static data on error
      return {
        projects: [],
        resume: null,
        hero: {
          title: 'Portfolio',
          subtitle: 'Developer',
          ctaPrimary: { text: 'Projects', href: '#projects' },
          ctaSecondary: { text: 'Resume', href: '/resume' },
        },
        settings: { theme: 'dark', colors: {} },
      };
    }
  }

  // Fallback на статические данные
  const [projects, resume, hero] = await Promise.all([
    import('@/data/projects').then(m => m.projects),
    import('@/data/resume').then(m => m.resume),
    import('@/data/hero').then(m => m.hero),
  ]);

  return {
    projects,
    resume,
    hero,
    settings: { theme: 'dark', colors: {} },
  };
}
