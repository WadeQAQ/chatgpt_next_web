import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isRoot } from "@/app/lib/auth";

// 确保路由动态渲染
export const dynamic = 'force-dynamic';

// 获取所有用户（仅管理员可访问）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 检查用户是否已登录
    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    // 检查用户是否是ROOT
    if (!isRoot(session)) {
      return NextResponse.json(
        { error: "权限不足，需要管理员权限" },
        { status: 403 }
      );
    }

    // 获取所有用户，排除密码字段
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            apiKeys: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("获取用户列表错误:", error);
    return NextResponse.json(
      { error: "获取用户列表失败" },
      { status: 500 }
    );
  }
} 