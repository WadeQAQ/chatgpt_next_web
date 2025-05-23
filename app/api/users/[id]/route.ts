import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { authOptions, isRoot } from "@/app/lib/auth";
import { hashPassword, verifyPassword } from "@/app/lib/password";

// 确保路由动态渲染
export const dynamic = 'force-dynamic';

// 获取单个用户信息
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // 检查用户是否已登录
    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const userId = params.id;

    // 如果不是ROOT用户，只能查看自己的信息
    if (!isRoot(session) && session.user.id !== userId) {
      return NextResponse.json(
        { error: "权限不足，无法查看其他用户信息" },
        { status: 403 }
      );
    }

    // 获取用户信息，排除密码字段
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("获取用户信息错误:", error);
    return NextResponse.json(
      { error: "获取用户信息失败" },
      { status: 500 }
    );
  }
}

// 更新用户信息
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // 检查用户是否已登录
    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const userId = params.id;
    const data = await request.json();
    let updateData: any = { ...data };
    
    // 删除currentPassword字段，不存入数据库
    if (updateData.currentPassword) {
      delete updateData.currentPassword;
    }

    // 如果不是ROOT用户，只能更新自己的信息且不能更改角色
    if (!isRoot(session)) {
      if (session.user.id !== userId) {
        return NextResponse.json(
          { error: "权限不足，无法更新其他用户信息" },
          { status: 403 }
        );
      }
      
      // 普通用户不能更改自己的角色
      if (updateData.role) {
        delete updateData.role;
      }
    } else {
      // ROOT用户不能将自己的角色降级
      if (session.user.id === userId && updateData.role === UserRole.USER) {
        return NextResponse.json(
          { error: "不能降级自己的ROOT权限" },
          { status: 400 }
        );
      }
    }

    // 如果更新包含密码，需要验证当前密码并哈希新密码
    if (updateData.password) {
      // 如果是非ROOT用户自己修改自己的密码，需要验证当前密码
      if (session.user.id === userId && !isRoot(session)) {
        // 验证当前密码
        if (!data.currentPassword) {
          return NextResponse.json(
            { error: "需要提供当前密码" },
            { status: 400 }
          );
        }
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { password: true }
        });
        
        if (!user) {
          return NextResponse.json(
            { error: "用户不存在" },
            { status: 404 }
          );
        }
        
        const isPasswordValid = await verifyPassword(data.currentPassword, user.password);
        
        if (!isPasswordValid) {
          return NextResponse.json(
            { error: "当前密码不正确" },
            { status: 400 }
          );
        }
      }
      
      // 哈希新密码
      updateData.password = await hashPassword(updateData.password);
    }

    // 更新用户
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("更新用户错误:", error);
    return NextResponse.json(
      { error: "更新用户信息失败" },
      { status: 500 }
    );
  }
}

// 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // 检查用户是否已登录和ROOT权限
    if (!session?.user || !isRoot(session)) {
      return NextResponse.json(
        { error: "权限不足，需要管理员权限" },
        { status: 403 }
      );
    }

    const userId = params.id;

    // 防止ROOT删除自己
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "不能删除自己的账户" },
        { status: 400 }
      );
    }

    // 删除用户
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ message: "用户删除成功" });
  } catch (error) {
    console.error("删除用户错误:", error);
    return NextResponse.json(
      { error: "删除用户失败" },
      { status: 500 }
    );
  }
} 