import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Webhook endpoint для перезапуска сборки из админ-панели
 * 
 * Использование:
 * POST /api/revalidate
 * Authorization: Bearer <token>
 * Body: { paths?: string[] }
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  // Проверка токена
  const token = process.env.BUILD_WEBHOOK_TOKEN;
  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const { paths } = body as { paths?: string[] };
    
    if (paths && Array.isArray(paths)) {
      // Перевалидация указанных путей
      paths.forEach((path) => {
        revalidatePath(path);
      });
    } else {
      // Перевалидация всех страниц
      revalidatePath('/');
      revalidatePath('/resume');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Revalidation successful',
      paths: paths || ['/', '/resume']
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Revalidation failed', details: String(error) }, 
      { status: 500 }
    );
  }
}

/**
 * GET endpoint для проверки доступности webhook
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Revalidate webhook is available'
  });
}
