import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hashPassword } from "@/app/lib/password";
import { registerSchema } from "@/app/lib/validation";
import { ZodError } from "zod";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions, isRoot } from "@/app/lib/auth";

// 确保路由动态渲染
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 检查当前用户是否已登录且具有ROOT权限
    const session = await getServerSession(authOptions);
    if (!session?.user || !isRoot(session)) {
      return NextResponse.json(
        { error: "权限不足，只有管理员可以创建用户" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "用户名已被占用，请选择其他用户名" },
        { status: 409 }
      );
    }

    // 如果提供了邮箱，检查邮箱是否已存在
    if (validatedData.email) {
      const existingUserEmail = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUserEmail) {
        return NextResponse.json(
          { error: "此邮箱已被注册" },
          { status: 409 }
        );
      }
    }

    // 密码哈希
    const hashedPassword = await hashPassword(validatedData.password);
    
    // 创建用户 - 由管理员创建的用户默认为普通用户
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        role: UserRole.USER, // 新用户默认为普通用户
      },
    });

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        user: userWithoutPassword,
        message: "用户创建成功" 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("注册错误:", error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: "输入验证失败", 
          details: error.errors 
        }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "注册时发生错误" }, 
      { status: 500 }
    );
  }
} 