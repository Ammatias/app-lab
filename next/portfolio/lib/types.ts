/**
 * Общие типы данных для интеграции с Admin Panel
 *
 * Эти типы должны совпадать с типами в админ-панели
 * для обеспечения консистентности данных
 */

import { Project } from '@/data/projects';
import { Resume } from '@/data/resume';
import { HeroData } from '@/data/hero';

/**
 * Ответ API с данными проекта
 */
export interface ProjectContent {
  projects: Project[];
  resume: Resume;
  hero: HeroData;
  settings: {
    theme: 'dark' | 'light';
    colors: Record<string, string>;
  };
}

/**
 * Стандартный ответ API
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
  timestamp: string;
}

/**
 * Данные для перезапуска сборки
 */
export interface RevalidateRequest {
  paths?: string[];
}

/**
 * Ответ перезапуска сборки
 */
export interface RevalidateResponse {
  success: boolean;
  message: string;
  paths?: string[];
}

/**
 * Контент проекта из Admin Panel
 */
export interface AdminPanelContent {
  projects?: Project[];
  resume?: Resume | null;
  hero?: HeroData | null;
}

/**
 * Полный ответ от /api/public/[slug]/content
 */
export interface PublicContentResponse {
  data: AdminPanelContent;
  settings: {
    theme: 'dark' | 'light';
    colors: Record<string, string>;
  };
  timestamp: string;
}
