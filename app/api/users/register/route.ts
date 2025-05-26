import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { UserRole } from "@prisma/client";
import { hashPassword } from "@/app/lib/password";
import { getServerSession } from "next-auth/next";
import { authOptions, isRoot } from "@/app/lib/auth";

// 确保路由动态渲染
export const dynamic = 'force-dynamic';

// POST /api/users/register - 创建新用户
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 检查是否是ROOT用户
    if (!session?.user || !isRoot(session)) {
      return NextResponse.json(
        { error: "权限不足，只有ROOT用户可以创建新用户" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { username, password, email, role = UserRole.USER } = data;

    // 简单验证
    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码是必填项" },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "用户名已存在" },
        { status: 409 }
      );
    }

    // 如果提供了邮箱，检查邮箱是否已存在
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: "邮箱已被使用" },
          { status: 409 }
        );
      }
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password);

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email: email || null,
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("创建用户错误:", error);
    return NextResponse.json(
      { error: "创建用户失败" },
      { status: 500 }
    );
  }
} 