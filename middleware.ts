import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@prisma/client';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 登录页面路径
  const loginRoute = '/auth/login';
  // 注册页面路径（仅管理员可访问）
  const registerRoute = '/auth/register';
  
  // 白名单路径，这些路径不需要身份验证即可访问
  const publicPaths = [
    '/api/auth', // NextAuth API 路由
    '/api/init', // 系统初始化API
    '/favicon.ico',
    '/_next', // Next.js 资源
    '/images', // 静态资源
  ];

  // 检查路径是否在白名单中
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) || 
                       pathname === loginRoute;

  // 从请求中获取令牌（session）
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  const isAuthenticated = !!token;
  const isRoot = token?.role === UserRole.ROOT;

  // 处理注册页面的访问控制
  if (pathname === registerRoute) {
    // 如果用户未登录，重定向到登录页面
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(loginRoute, request.url));
    }
    // 如果用户登录但不是ROOT权限，重定向到首页
    if (!isRoot) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // ROOT用户可以访问注册页面
    return NextResponse.next();
  }

  // 如果用户已登录但访问登录页面，重定向到首页
  if (isAuthenticated && pathname === loginRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 如果用户未登录且访问需要授权的页面，重定向到登录页面
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL(loginRoute, request.url));
  }

  return NextResponse.next();
}

// 配置中间件应用于哪些路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了以下路径：
     * - api/auth（NextAuth API 路由）
     * - _next（Next.js 静态文件）
     * - favicon.ico, public 目录下的资源
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}; 